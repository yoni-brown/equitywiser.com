# Rate-Update Run — HALTED: Source Fetch Failure
**Date:** 2026-07-31  
**Run type:** Halted — all rate sources unreachable (HTTP 403)  
**Pushed:** No  
**Committed:** No (report only)

---

## Summary

Every rate source and every backup source returned HTTP 403 or was otherwise blocked by the fetch environment. Zero rates could be fetched or verified. Per runbook policy ("If you can't verify, halt"), no rate edits were made, nothing was committed, and nothing was pushed.

This is the same network-level block seen on 2026-04-30. There was a successful run on 2026-07-09 (manifest `last_run`), so the block appears intermittent — it was not present three weeks ago.

---

## Halt Trigger

**Condition:** "Source page returns non-200 or is restructured unrecognizably."

All fetch attempts failed:

| URL | Result |
|---|---|
| https://www.freddiemac.com/pmms | 403 |
| https://www.bankrate.com/home-equity/heloc-rates/ | 403 |
| https://www.federalreserve.gov/releases/h15/ | 403 |
| https://www.nerdwallet.com/mortgages/mortgage-rates/30-year-fixed | 403 |
| https://www.nerdwallet.com/best/mortgages/heloc-rates | 403 |
| https://www.wsj.com/market-data/bonds/moneyrates | Blocked by fetch environment |
| https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US | 403 |
| https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE15US | 403 |
| https://fred.stlouisfed.org/graph/fredgraph.csv?id=PRIME | 403 |

The proxy status endpoint (`/__agentproxy/status`) shows no recent relay failures and reports a healthy configuration — so these 403s are organization egress-policy denials for these specific hosts, not a proxy malfunction.

---

## Current Site State

Rates shown on the site are from **Jul 9, 2026** (22 days stale as of today). Values confirmed by grep against live HTML files:

| Rate | Value on site | Manifest field |
|---|---|---|
| 30yr Fixed | 6.49% | `rates.30yr_fixed.current` |
| 15yr Fixed | 5.82% | `rates.15yr_fixed.current` |
| HELOC avg | 7.43% | `rates.heloc_avg.current` |
| Prime | 6.75% | `rates.prime.current` |

Derived values on the homepage hero card also reflect July 9 inputs.

HTML file count: **24 files** (manifest scope descriptions now accurate).

---

## Manifest Status

Manifest `last_run` and `rates_as_of` remain `2026-07-09`. No manifest changes were made this run.

---

## Regex Pre-flight (verified this run)

Masthead patterns confirmed present across all 24 HTML files (grep matches expected):

| Pattern ID | Files matched | Status |
|---|---|---|
| masthead_30yr | 24 | ✓ |
| masthead_heloc | 24 | ✓ |
| masthead_prime | 24 | ✓ |
| masthead_15yr | 24 | ✓ |
| masthead_source_date (Freddie Mac PMMS &middot; Jul 9, 2026) | 24 | ✓ |

Homepage hero-card patterns were not exercised (no edits attempted).

---

## Action Required

1. **Diagnose the egress block.** The execution environment's outbound HTTPS policy is blocking financial data domains (freddiemac.com, bankrate.com, federalreserve.gov, fred.stlouisfed.org, nerdwallet.com, wsj.com). This policy did not block the July 9 run — something changed between Jul 9 and Jul 31.

2. **Re-run manually once network access is restored.** All manifest regex patterns verified clean. A successful run is expected as soon as rate sources are reachable.

3. **Site data is now 22 days stale.** If rates have moved materially this week, consider triggering a manual run from a non-restricted environment.

---

*No rate files were modified. No rate commits were made. No push occurred.*
