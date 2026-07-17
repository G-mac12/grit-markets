//+------------------------------------------------------------------+
//| GMTelemetry.mqh — HMAC-signed telemetry push + settings channel  |
//| Part of the Grit Markets EA Integration Kit.                     |
//|                                                                  |
//| Contract: POST https://gritmarkets.com/api/telemetry             |
//|   header  X-GM-Signature: hex(HMAC-SHA256(raw_body, secret))     |
//|   returns {"ok",bool,"pending_settings":{...}|null,"ack_ticket"} |
//|                                                                  |
//| Behaviour rules:                                                 |
//|  - heartbeat every 5 minutes (call GM_TelemetryTimerTick from a  |
//|    60s OnTimer); immediate push on position close                |
//|  - retry buffer: failed pushes queue in MEMORY and flush on the  |
//|    next successful connection (VPS reboots lose the queue —      |
//|    acceptable, snapshots are point-in-time)                      |
//|  - trades queue until the server's ack_ticket covers them        |
//|  - telemetry is reporting only: no trading decision may ever     |
//|    depend on it; failures must never throw or block              |
//|  - NEVER include broker credentials, and never log the secret    |
//+------------------------------------------------------------------+
#ifndef GM_TELEMETRY_MQH
#define GM_TELEMETRY_MQH

#include "GMCrypto.mqh"
#include "GMConfig.mqh"

#define GM_TELEMETRY_ENDPOINT "https://gritmarkets.com/api/telemetry"
#define GM_HEARTBEAT_SECS     300
#define GM_TRADE_QUEUE_MAX    200

// module state — read by GMPanel
datetime g_gm_last_push_ok = 0;
datetime g_gm_last_push_at = 0;

// closed-trade queue (flushed on successful push, pruned by ack_ticket)
struct GMTradeRec
  {
   ulong             ticket;
   string            symbol;
   string            direction;   // "buy"/"sell"
   double            lots;
   datetime          open_time;
   datetime          close_time;
   double            open_price;
   double            close_price;
   double            profit;
   double            commission;
   double            swap;
   int               sequence_level;
  };
GMTradeRec g_gm_trade_queue[];

// Queue a closed position (call from OnTradeTransaction when a position
// closes; sequence_level = the leg number this position held in its basket).
void GM_QueueClosedTrade(const GMTradeRec &rec)
  {
   int n = ArraySize(g_gm_trade_queue);
   if(n >= GM_TRADE_QUEUE_MAX) return; // cap; the server re-syncs by ticket
   ArrayResize(g_gm_trade_queue, n + 1);
   g_gm_trade_queue[n] = rec;
  }

string GM_Iso8601(const datetime t)
  {
   MqlDateTime dt;
   TimeToStruct(t, dt);
   return(StringFormat("%04d-%02d-%02dT%02d:%02d:%02dZ",
          dt.year, dt.mon, dt.day, dt.hour, dt.min, dt.sec));
  }

string GM_BuildPayload(const string license_key)
  {
   string trades = "";
   for(int i = 0; i < ArraySize(g_gm_trade_queue); i++)
     {
      GMTradeRec r = g_gm_trade_queue[i];
      if(i > 0) trades += ",";
      trades += StringFormat(
         "{\"ticket\":%I64u,\"symbol\":\"%s\",\"direction\":\"%s\","
         "\"lots\":%.2f,\"open_time\":\"%s\",\"close_time\":\"%s\","
         "\"open_price\":%.5f,\"close_price\":%.5f,\"profit\":%.2f,"
         "\"commission\":%.2f,\"swap\":%.2f,\"sequence_level\":%d}",
         r.ticket, r.symbol, r.direction, r.lots,
         GM_Iso8601(r.open_time), GM_Iso8601(r.close_time),
         r.open_price, r.close_price, r.profit, r.commission, r.swap,
         r.sequence_level);
     }

   return(StringFormat(
      "{\"license_key\":\"%s\",\"mt5_account\":\"%I64d\",\"is_demo\":%s,"
      "\"account_currency\":\"%s\",\"settings_version\":%d,"
      "\"snapshot\":{\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,"
      "\"free_margin\":%.2f,\"margin_level_pct\":%.2f,"
      "\"open_positions_count\":%d,\"floating_pl\":%.2f},"
      "\"trades\":[%s]}",
      license_key,
      AccountInfoInteger(ACCOUNT_LOGIN),
      AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_DEMO
         ? "true" : "false",
      AccountInfoString(ACCOUNT_CURRENCY),
      g_gm_settings_version,
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      AccountInfoDouble(ACCOUNT_MARGIN),
      AccountInfoDouble(ACCOUNT_MARGIN_FREE),
      AccountInfoDouble(ACCOUNT_MARGIN_LEVEL),
      PositionsTotal(),
      AccountInfoDouble(ACCOUNT_PROFIT),
      trades));
  }

// One push. Never throws; failures leave the queue intact for the next tick.
bool GM_PushTelemetry(const string license_key, const string telemetry_secret)
  {
   if(telemetry_secret == "") return(false);
   g_gm_last_push_at = TimeCurrent();

   string body = GM_BuildPayload(license_key);
   string sig  = GM_HmacSha256Hex(body, telemetry_secret);
   if(sig == "") return(false);

   char request[];
   StringToCharArray(body, request, 0, StringLen(body), CP_UTF8);
   ArrayResize(request, StringLen(body));

   char response[];
   string response_headers;
   string headers = "Content-Type: application/json\r\nX-GM-Signature: " + sig + "\r\n";
   ResetLastError();
   int status = WebRequest("POST", GM_TELEMETRY_ENDPOINT, headers,
                           5000, request, response, response_headers);
   if(status != 200)
      return(false); // retry buffer: queue survives; next tick retries

   string json = CharArrayToString(response, 0, WHOLE_ARRAY, CP_UTF8);
   g_gm_last_push_ok = TimeCurrent();

   // prune the trade queue up to the server's acknowledged ticket
   ulong ack = (ulong)GM_JsonNum(json, "ack_ticket", 0);
   if(ack > 0)
     {
      GMTradeRec keep[];
      for(int i = 0; i < ArraySize(g_gm_trade_queue); i++)
         if(g_gm_trade_queue[i].ticket > ack)
           {
            int k = ArraySize(keep);
            ArrayResize(keep, k + 1);
            keep[k] = g_gm_trade_queue[i];
           }
      ArrayFree(g_gm_trade_queue);
      if(ArraySize(keep) > 0)
        {
         ArrayResize(g_gm_trade_queue, ArraySize(keep));
         for(int i = 0; i < ArraySize(keep); i++)
            g_gm_trade_queue[i] = keep[i];
        }
     }

   // settings channel rides the same response
   GM_ReadPendingSettings(json);
   return(true);
  }

// Timer hook: call from a 60s OnTimer. Heartbeats every 5 minutes; pushes
// sooner whenever closed trades are queued.
void GM_TelemetryTimerTick(const bool enabled, const string license_key,
                           const string telemetry_secret)
  {
   if(!enabled) return;
   bool due = (TimeCurrent() - g_gm_last_push_at >= GM_HEARTBEAT_SECS)
              || (ArraySize(g_gm_trade_queue) > 0);
   if(due) GM_PushTelemetry(license_key, telemetry_secret);
  }

#endif // GM_TELEMETRY_MQH
