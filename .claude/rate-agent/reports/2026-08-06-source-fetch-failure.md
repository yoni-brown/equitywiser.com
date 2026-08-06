# Rate-Update Run — HALTED: Source Fetch Failure
**Date:** 2026-08-06  
**Run type:** Halted — all rate sources unreachable (HTTP 403)  
**Pushed:** No  
**Committed:** No (report only)

---

## Summary

Every rate source and every backup source returned HTTP 403. Zero rates could be fetched or verified. Per runbook policy ("If you can't verify, halt"), no rate edits were made, nothing was committed, and nothing was pushed.

This is the **second consecutive failed run** (also failed 2026-07-31). The last successful run was **2026-07-09** — site data is now **28 days stale**.

---

## Halt Trigger

**Condition:** "Source page returns non-200 or is restructured unrecognizably."

All fetch attempts failed:

| URL | Result |
|---|---|
| https://www.freddiemac.com/pmms | 403 |
| https://www.bankrate.com/home-equity/heloc-rates/ | 403 |
| https://www.federalreserve.gov/releases/h15/ | 403 |
| https://www.nerdwallet.com/mortgages/mortgage-rates | 403 |
| https://www.nerdwallet.com/home-equity/heloc-rates | 403 |
| https://www.wsj.com/market-data/bonds/moneyrates | Blocked by fetch environment |
| https://www.mortgagenewsdaily.com/mortgage-rates/ | 403 |
| https://fred.stlouisfed.org/data/DPRIME.txt | 403 |
| https://api.stlouisfed.org/fred/series/observations?series_id=DPRIME | 403 |
| https://www.valuepenguin.com/home-equity/heloc-rates | 403 |
| https://www.bankrate.com/mortgages/mortgage-rates/ | 403 |

Proxy status (`/__agentproxy/status`): healthy, no recent relay failures. The 403s come from destination servers, not from the egress proxy policy. This appears to be a systematic anti-bot block affecting all financial data domains from this execution environment.

---

## Current Site State

Rates shown on the site are from **Jul 9, 2026** (28 days stale as of today). Values confirmed by grep against live HTML files:

| Rate | Value on site | Manifest field |
|---|---|---|
| 30yr Fixed | 6.49% | `rates.30yr_fixed.current` |
| 15yr Fixed | 5.82% | `rates.15yr_fixed.current` |
| HELOC avg | 7.43% | `rates.heloc_avg.current` |
| Prime | 6.75% | `rates.prime.current` |

Derived values on the homepage hero card also reflect July 9 inputs:
- HELOC monthly interest on $100K: $619
- HELOC total (existing + interest): $2,051
- Cash-out refi on $400K at 6.99%: $2,659
- Monthly gap (refi vs HELOC): $608

---

## Regex Pre-flight (all 10 patterns verified)

Site structure is intact. All manifest patterns match as expected:

| Pattern ID | Files matched | Status |
|---|---|---|
| masthead_30yr | 24/24 | ✓ |
| masthead_heloc | 24/24 | ✓ |
| masthead_prime | 24/24 | ✓ |
| masthead_15yr | 24/24 | ✓ |
| masthead_source_date (Freddie Mac PMMS · Jul 9, 2026) | 24/24 | ✓ |
| hero_dateline | index.html | ✓ ("Jul 9, 2026 rates · Sample Scenario") |
| hero_sample_heloc_interest | index.html | ✓ (7.43%, $619) |
| hero_sample_heloc_total | index.html | ✓ ($2,051) |
| hero_sample_refi_line | index.html | ✓ (6.99%, $2,659) |
| hero_verdict_dollars | index.html | ✓ ($608/mo more) |

No regex misses. The site is structurally ready for an update — the only blocker is network access to rate sources.

---

## Action Required

This is the **second week in a row** this run has halted on the same condition. The underlying issue requires attention:

1. **Diagnose the persistent egress block.** Financial data domains (freddiemac.com, bankrate.com, federalreserve.gov, fred.stlouisfed.org, nerdwallet.com, wsj.com, valuepenguin.com) are all refusing connections from this execution environment. The July 9 run succeeded; the July 31 and August 6 runs have both failed. Something changed network-side between July 9 and July 31.

2. **Consider a FRED API key.** The St. Louis Fed's FRED API (`api.stlouisfed.org`) provides mortgage and prime rate data in a structured JSON format that may be less likely to block automated access with a proper API key. Freddie Mac PMMS data is available via FRED series `MORTGAGE30US` and `MORTGAGE15US`; prime rate via `DPRIME`.

3. **Re-run manually once network access is restored.** All manifest regex patterns are verified clean. A successful run is expected as soon as rate sources are reachable — no manifest or site structure changes needed.

4. **Site data is 28 days stale.** If rates have moved materially over the past four weeks, consider triggering a manual run from a non-restricted environment or updating rates by hand for now.

---

*No rate files were modified. No rate commits were made. No push occurred.*
