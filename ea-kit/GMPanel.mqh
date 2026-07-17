//+------------------------------------------------------------------+
//| GMPanel.mqh — on-chart setup assistant                           |
//| Part of the Grit Markets EA Integration Kit.                     |
//|                                                                  |
//| A self-diagnosing status panel: five checks, each rendered as    |
//| OK/FIX with the exact remedy when failing. This panel is the     |
//| customer's first line of support — keep the fix texts verbatim   |
//| in sync with the start-here guides.                              |
//|                                                                  |
//| Checks:                                                          |
//|  1. EA running          (always true when the panel draws)       |
//|  2. Algo Trading on     (terminal toggle AND per-chart box)      |
//|  3. WebRequest allowed  (detected via GMLicense probe failure)   |
//|  4. License valid       (GMLicense state)                        |
//|  5. Telemetry flowing   (GMTelemetry last-success age)           |
//+------------------------------------------------------------------+
#ifndef GM_PANEL_MQH
#define GM_PANEL_MQH

#include "GMLicense.mqh"
#include "GMTelemetry.mqh"

#define GM_PANEL_PREFIX "GMPanel_"
#define GM_PANEL_X      12
#define GM_PANEL_Y      24
#define GM_PANEL_ROW_H  18

void GM_PanelLabel(const string name, const int row, const string text,
                   const color clr)
  {
   string id = GM_PANEL_PREFIX + name;
   if(ObjectFind(0, id) < 0)
     {
      ObjectCreate(0, id, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, id, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, id, OBJPROP_XDISTANCE, GM_PANEL_X);
      ObjectSetInteger(0, id, OBJPROP_FONTSIZE, 8);
      ObjectSetString (0, id, OBJPROP_FONT, "Consolas");
      ObjectSetInteger(0, id, OBJPROP_SELECTABLE, false);
     }
   ObjectSetInteger(0, id, OBJPROP_YDISTANCE, GM_PANEL_Y + row * GM_PANEL_ROW_H);
   ObjectSetString (0, id, OBJPROP_TEXT, text);
   ObjectSetInteger(0, id, OBJPROP_COLOR, clr);
  }

// Redraw the panel. Call from OnTimer (60s) — cheap enough to run always.
void GM_PanelUpdate(const bool telemetry_enabled)
  {
   const color OK   = clrLimeGreen;
   const color FIX  = clrOrangeRed;
   const color DIM  = clrSilver;
   int row = 0;

   GM_PanelLabel("title", row++, "GRIT MARKETS — SETUP", DIM);

   // 1. EA running
   GM_PanelLabel("ea", row++, "[OK]  EA installed and running", OK);

   // 2. Algo trading (both the terminal toggle and the per-chart box)
   bool term_algo  = (bool)TerminalInfoInteger(TERMINAL_TRADE_ALLOWED);
   bool chart_algo = (bool)MQLInfoInteger(MQL_TRADE_ALLOWED);
   if(term_algo && chart_algo)
      GM_PanelLabel("algo", row++, "[OK]  Algo Trading enabled", OK);
   else if(!term_algo)
      GM_PanelLabel("algo", row++,
         "[FIX] Click the 'Algo Trading' button in the MT5 toolbar", FIX);
   else
      GM_PanelLabel("algo", row++,
         "[FIX] EA settings > Common tab > tick 'Allow Algo Trading'", FIX);

   // 3. WebRequest whitelist (probe failure mode from GMLicense)
   if(g_gm_whitelist_missing)
      GM_PanelLabel("web", row++,
         "[FIX] Tools > Options > Expert Advisors > Allow WebRequest > add https://gritmarkets.com",
         FIX);
   else
      GM_PanelLabel("web", row++, "[OK]  gritmarkets.com reachable", OK);

   // 4. License
   if(g_gm_license_valid)
      GM_PanelLabel("lic", row++, "[OK]  License valid", OK);
   else if(g_gm_license_checked_at == 0)
      GM_PanelLabel("lic", row++, "[..]  Checking license...", DIM);
   else
      GM_PanelLabel("lic", row++,
         "[FIX] License rejected (" + g_gm_license_reason +
         ") — check the key in the EA inputs / your dashboard", FIX);

   // 5. Telemetry
   if(!telemetry_enabled)
      GM_PanelLabel("tel", row++, "[--]  Telemetry disabled by input", DIM);
   else if(g_gm_last_push_ok > 0 &&
           TimeCurrent() - g_gm_last_push_ok < 15 * 60)
      GM_PanelLabel("tel", row++, "[OK]  Telemetry flowing to dashboard", OK);
   else if(g_gm_last_push_at == 0)
      GM_PanelLabel("tel", row++, "[..]  First telemetry push pending...", DIM);
   else
      GM_PanelLabel("tel", row++,
         "[FIX] Telemetry failing — check the secret from Licenses & Downloads and the WebRequest whitelist",
         FIX);
  }

void GM_PanelRemove()
  {
   ObjectsDeleteAll(0, GM_PANEL_PREFIX);
  }

#endif // GM_PANEL_MQH
