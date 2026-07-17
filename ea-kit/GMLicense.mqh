//+------------------------------------------------------------------+
//| GMLicense.mqh — licence validation for Grit Markets              |
//| Part of the Grit Markets EA Integration Kit.                     |
//|                                                                  |
//| Contract: POST https://gritmarkets.com/api/license/validate      |
//|   body    {"license_key","mt5_account","ea_version"}             |
//|   returns {"valid":bool,"reason":string,"expires":string|null}   |
//|                                                                  |
//| Behaviour rules (do not weaken):                                 |
//|  - validate in OnInit; no trading without a first valid result   |
//|  - revalidate every 12h on a timer, NEVER inside trading logic   |
//|  - network failure != invalid: keep trading on last-known-good,  |
//|    retry hourly                                                  |
//|  - a parsed valid:false on revalidation stops NEW baskets only;  |
//|    open sequences are managed to their normal close              |
//+------------------------------------------------------------------+
#ifndef GM_LICENSE_MQH
#define GM_LICENSE_MQH

#define GM_LICENSE_ENDPOINT   "https://gritmarkets.com/api/license/validate"
#define GM_WEBREQUEST_TIMEOUT 5000
#define GM_REVALIDATE_SECS    (12 * 3600)
#define GM_RETRY_SECS         3600

// module state — read by GMPanel for the on-chart assistant
bool     g_gm_license_valid      = false;  // last parsed server verdict
bool     g_gm_license_hard_fail  = false;  // parsed valid:false (not network)
string   g_gm_license_reason     = "not_checked";
datetime g_gm_license_checked_at = 0;
bool     g_gm_whitelist_missing  = false;  // error 4014 seen

// One validation round-trip. Updates module state; returns the parsed
// verdict, or the last-known-good verdict on pure network failure.
bool GM_ValidateLicense(const string license_key, const string ea_version)
  {
   string account = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string body = StringFormat(
      "{\"license_key\":\"%s\",\"mt5_account\":\"%s\",\"ea_version\":\"%s\"}",
      license_key, account, ea_version);

   char request[];
   StringToCharArray(body, request, 0, StringLen(body), CP_UTF8);
   ArrayResize(request, StringLen(body)); // drop the null terminator

   char response[];
   string response_headers;
   ResetLastError();
   int status = WebRequest("POST", GM_LICENSE_ENDPOINT,
                           "Content-Type: application/json\r\n",
                           GM_WEBREQUEST_TIMEOUT,
                           request, response, response_headers);

   if(status == -1)
     {
      int err = GetLastError();
      g_gm_whitelist_missing = (err == 4014);
      PrintFormat("Grit Markets: licence check network failure (error %d). %s",
                  err,
                  err == 4014
                     ? "Add " + GM_LICENSE_ENDPOINT + " host to Tools > Options > Expert Advisors > Allow WebRequest."
                     : "Retrying on schedule.");
      // network failure: keep last-known-good verdict
      return(g_gm_license_valid);
     }
   g_gm_whitelist_missing = false;

   string json = CharArrayToString(response, 0, WHOLE_ARRAY, CP_UTF8);
   bool valid = (StringFind(json, "\"valid\":true") >= 0);

   // extract the reason code for the Experts log / panel
   int rp = StringFind(json, "\"reason\":\"");
   if(rp >= 0)
     {
      int rs = rp + 10;
      int re = StringFind(json, "\"", rs);
      if(re > rs) g_gm_license_reason = StringSubstr(json, rs, re - rs);
     }

   g_gm_license_valid      = valid;
   g_gm_license_hard_fail  = !valid;
   g_gm_license_checked_at = TimeCurrent();

   if(!valid)
      PrintFormat("Grit Markets: licence rejected — %s", g_gm_license_reason);
   return(valid);
  }

// Timer hook: call from OnTimer (e.g. a 60s EventSetTimer). Handles the
// 12h cadence and the 1h retry after failures internally.
void GM_LicenseTimerTick(const string license_key, const string ea_version)
  {
   int interval = (g_gm_license_valid && !g_gm_whitelist_missing)
                     ? GM_REVALIDATE_SECS : GM_RETRY_SECS;
   if(TimeCurrent() - g_gm_license_checked_at < interval) return;
   GM_ValidateLicense(license_key, ea_version);
  }

// Gate for NEW baskets only. Open-sequence management must not call this.
bool GM_MayOpenNewBasket()
  {
   return(!g_gm_license_hard_fail);
  }

#endif // GM_LICENSE_MQH
