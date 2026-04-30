# Rate-Update Run — HALTED: Source Fetch Failure
**Date:** 2026-04-30  
**Run type:** Halted — all rate sources unreachable (HTTP 403)  
**Pushed:** No  
**Committed:** No

---

## Summary

Every rate source and every backup source returned HTTP 403 or was blocked by the fetch environment. Zero rates could be fetched or verified. Per runbook policy ("If you can't verify, halt"), no edits were made, nothing was committed, and nothing was pushed.

---

## Halt Trigger

**Condition:** "Source page returns non-200 or is restructured unrecognizably."

All thirteen fetch attempts failed:

| URL | Result |
|---|---|
| https://www.freddiemac.com/pmms | 403 |
| https://www.freddiemac.com/pmms/archive.html | 403 |
| https://www.bankrate.com/home-equity/heloc-rates/ | 403 |
| https://www.federalreserve.gov/releases/h15/ | 403 |
| https://www.federalreserve.gov/releases/h15/current/ | 403 |
| https://www.nerdwallet.com/mortgages/heloc-rates | 403 |
| https://fred.stlouisfed.org/series/MORTGAGE30US | 403 |
| https://fred.stlouisfed.org/series/MORTGAGE15US | 403 |
| https://fred.stlouisfed.org/series/DPRIME | 403 |
| https://www.valuepenguin.com/home-equity/average-heloc-rates | 403 |
| https://www.experian.com/blogs/ask-experian/heloc-rates/ | 403 |
| https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&… | 403 |
| https://www.wsj.com/market-data/bonds/moneyrates | Blocked by fetch environment |

The failures span Freddie Mac, the Federal Reserve, Bankrate, NerdWallet, FRED, ValuePenguin, Experian, and WSJ — every primary and every secondary source the runbook specifies. This is consistent with a network-level block in the automated fetch environment (e.g., outbound HTTPS to financial data domains filtered), not a single-site outage.

---

## Current Site State

Rates shown on the site are from **Apr 9, 2026** (three weeks stale as of today).

| Rate | Value on site | Manifest field |
|---|---|---|
| 30yr Fixed | 6.37% | `rates.30yr_fixed.current` |
| 15yr Fixed | 5.74% | `rates.15yr_fixed.current` |
| HELOC avg | 7.02% | `rates.heloc_avg.current` |
| Prime | 6.75% | `rates.prime.current` |

Derived values on the homepage hero card also reflect Apr 9 inputs and are similarly stale.

**Note:** The Apr 20 run (see `2026-04-20-regex-miss.md`) did successfully fetch Apr 16 rates before halting for a different reason (regex misses). That rate data is now two weeks old and should not be applied without a fresh fetch.

---

## Manifest Status

The manifest (`manifest.json`) was last successfully updated on **2026-04-20** (run date; rates_as_of is still 2026-04-09 because the Apr 20 run halted before writing).

**Positive changes since Apr 20:**

1. **`masthead_source_date` regex issue resolved.** The Apr 20 report found 8 HTML files using a literal Unicode middle-dot (`·`, U+00B7) instead of the HTML entity `&middot;`. Those files have since been corrected; grep now confirms all 21 HTML files use `&middot;`. The `masthead_source_date` pattern will match cleanly on the next run.

2. **`hero_heloc_rate` and `hero_refi_rate` removed.** These defunct manifest entries (which matched no HTML element in index.html) are no longer present in the manifest. The values they intended to track are covered by `hero_sample_heloc_interest` and `hero_sample_refi_line`, both of which match correctly.

**Outstanding manifest discrepancy:**

The scope field on the four masthead location entries still reads `"all HTML pages (24 files)"`. The repo currently has **21 HTML files** (james-b-solomon.html, privacy.html, and terms.html were removed; how-to-shop-for-heloc.html was added since the manifest was written). This is cosmetic documentation drift only — the regex will still match across however many files exist — but the description should be updated on the next successful run.

---

## Regex Pre-flight (verified this run)

With 21 HTML files on disk, the manifest patterns were spot-checked via grep:

| Pattern ID | Expected match | Status |
|---|---|---|
| masthead_30yr | 21 files | ✓ |
| masthead_heloc | 21 files | ✓ |
| masthead_prime | 21 files | ✓ |
| masthead_15yr | 21 files | ✓ |
| masthead_source_date | 21 files | ✓ (resolved since Apr 20) |
| hero_dateline | index.html | Not checked (no fetch; no edits) |
| hero_sample_heloc_interest | index.html | Not checked |
| hero_sample_heloc_total | index.html | Not checked |
| hero_sample_refi_line | index.html | Not checked |
| hero_verdict_dollars | index.html | Not checked |

The index.html patterns were not exercised because no edits were attempted. They matched cleanly on the Apr 20 run.

---

## Action Required

1. **Diagnose the network block.** The automated fetch environment cannot reach any financial data domain over HTTPS. This is likely a firewall or egress-filter change in the execution environment, not a site-wide outage. Check the execution environment's outbound network policy.

2. **Re-run manually once network access is restored.** All manifest regex issues identified in the Apr 20 run have been fixed. A clean run is expected as soon as rate data can be fetched and verified.

3. **Consider updating `manifest.json` scope descriptions** from "24 files" to "21 files" on the next successful run (cosmetic only).

---

*No files were modified. No commits were made. No push occurred.*
