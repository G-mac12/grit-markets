//+------------------------------------------------------------------+
//| GMConfig.mqh — server-delivered strategy configuration           |
//| Part of the Grit Markets EA Integration Kit.                     |
//|                                                                  |
//| IP-protection rules (hard constraints, do not weaken):           |
//|  - parameters live in EA MEMORY ONLY: never written to disk,     |
//|    never printed to the Experts log, never chart comments        |
//|  - the EA exposes NO strategy inputs; profiles arrive in the     |
//|    telemetry response as pending_settings                        |
//|  - pending settings apply ONLY when the basket is flat (no open  |
//|    legs); mid-ladder application is forbidden                    |
//|  - after applying, echo settings_version on the next telemetry   |
//|    push so the dashboard marks the version applied               |
//+------------------------------------------------------------------+
#ifndef GM_CONFIG_MQH
#define GM_CONFIG_MQH

struct GMParams
  {
   double            base_lot;
   double            lot_multiplier;
   int               max_legs;
   int               take_profit_points;
   int               grid_step_points;
   bool              use_equity_stop;
   double            equity_stop_pct;
   bool              news_filter;
  };

// active config + version actually running (compiled-in safe defaults
// until the first server version applies)
GMParams g_gm_params = {0.01, 1.21, 21, 34, 21, true, 20.0, true};
int      g_gm_settings_version = 0;

// pending version parked until the basket is flat
bool     g_gm_pending_present = false;
int      g_gm_pending_version = 0;
GMParams g_gm_pending_params;

// [OWNER INPUT: param jitter on/off + bounds] — compile-time flag adds a
// small deterministic per-account variation to lot/spacing to resist
// copy-trading reverse-engineering. OFF until the owner signs off.
// #define GM_PARAM_JITTER_PCT 2

// --- tiny JSON field readers (server emits flat, known-shape JSON) -----
double GM_JsonNum(const string json, const string field, const double fallback)
  {
   int p = StringFind(json, "\"" + field + "\":");
   if(p < 0) return(fallback);
   int s = p + StringLen(field) + 3;
   int e = s;
   while(e < StringLen(json))
     {
      ushort c = StringGetCharacter(json, e);
      if((c >= '0' && c <= '9') || c == '.' || c == '-') e++;
      else break;
     }
   if(e == s) return(fallback);
   return(StringToDouble(StringSubstr(json, s, e - s)));
  }

bool GM_JsonBool(const string json, const string field, const bool fallback)
  {
   int p = StringFind(json, "\"" + field + "\":");
   if(p < 0) return(fallback);
   return(StringFind(json, "true", p) == p + StringLen(field) + 3);
  }

// Parse "pending_settings":{"version":N,"params":{...}} out of a telemetry
// response. Stores it as pending; never logs the values.
void GM_ReadPendingSettings(const string response_json)
  {
   int p = StringFind(response_json, "\"pending_settings\":{");
   if(p < 0) return; // null or absent — nothing pending

   string block = StringSubstr(response_json, p);
   int version = (int)GM_JsonNum(block, "version", 0);
   if(version <= 0 || version == g_gm_settings_version) return;

   GMParams np;
   np.base_lot           = GM_JsonNum (block, "base_lot",           g_gm_params.base_lot);
   np.lot_multiplier     = GM_JsonNum (block, "lot_multiplier",     g_gm_params.lot_multiplier);
   np.max_legs           = (int)GM_JsonNum(block, "max_legs",       g_gm_params.max_legs);
   np.take_profit_points = (int)GM_JsonNum(block, "take_profit_points", g_gm_params.take_profit_points);
   np.grid_step_points   = (int)GM_JsonNum(block, "grid_step_points",   g_gm_params.grid_step_points);
   np.use_equity_stop    = GM_JsonBool(block, "use_equity_stop",    g_gm_params.use_equity_stop);
   np.equity_stop_pct    = GM_JsonNum (block, "equity_stop_pct",    g_gm_params.equity_stop_pct);
   np.news_filter        = GM_JsonBool(block, "news_filter",        g_gm_params.news_filter);

   // defence in depth: reject out-of-bounds values even though the server
   // bounds-checks first — and refuse any config with the stop disarmed
   if(np.base_lot < 0.01 || np.base_lot > 0.10)   return;
   if(np.lot_multiplier < 1.05 || np.lot_multiplier > 2.0) return;
   if(np.max_legs < 5 || np.max_legs > 40)        return;
   if(!np.use_equity_stop)                        return;
   if(np.equity_stop_pct < 0.5 || np.equity_stop_pct > 50) return;

   g_gm_pending_params  = np;
   g_gm_pending_version = version;
   g_gm_pending_present = true;
   // log the VERSION only — never the values
   PrintFormat("Grit Markets: settings v%d received, waiting for flat state.", version);
  }

// Call once per tick/timer with the live basket state. Applies the pending
// version only when flat; returns true when a switch happened.
bool GM_ApplyPendingIfFlat(const bool basket_is_flat)
  {
   if(!g_gm_pending_present || !basket_is_flat) return(false);
   g_gm_params           = g_gm_pending_params;
   g_gm_settings_version = g_gm_pending_version;
   g_gm_pending_present  = false;
   PrintFormat("Grit Markets: settings v%d applied.", g_gm_settings_version);
   return(true);
  }

#endif // GM_CONFIG_MQH
