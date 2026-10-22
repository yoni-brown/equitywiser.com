# Rate Agent — Full Audit Required (Fourth Consecutive Halt)
**Run date:** 2026-10-22  
**Scope classification:** HALT — Full Audit Required  
**No changes pushed to the site.**

---

## Summary

This is the **fourth consecutive full-audit halt** (Oct 1, Oct 8, Oct 15, Oct 22). The site has been displaying stale July 9, 2026 rates for **105 days**. Rates have moved +83 bp on the 30yr and +86 bp on the 15yr from manifest values — both well above the ≥50 bp full-audit threshold.

**Positive developments this week:**
- The 15yr PMMS–Bankrate cross-verification gap that independently triggered the Oct 15 halt (11 bp) resolved: 15yr PMMS 6.68% vs Bankrate 6.73% = **5 bp** — within threshold.
- Rates ticked down week-over-week (30yr −8 bp, 15yr −3 bp), which reduces the computed monthly refi gap.
- The full-audit trigger itself (≥50 bp on 30yr/15yr from the July 9 manifest) remains the only blocker.

---

## Halt conditions triggered this run

1. **Full-audit threshold (≥50 bp):** 30yr Fixed moved +83 bp; 15yr Fixed moved +86 bp from manifest.
2. **Primary source URLs blocked:** Direct WebFetch/curl to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov` all return `ENOTFOUND` (DNS resolution failure — same as previous three runs). Rates sourced via WebSearch from indexed press releases. Data quality is high (Freddie Mac Oct 22 PMMS release via multiple wire sources; Bankrate Oct 21 national avg; Fed H.15 Oct 21 release via Macrotrends/FRED), but direct-URL primary verification is technically unmet.

---

## Rate deltas (manifest → October 22, 2026)

| Rate | Manifest (Jul 9) | This week (Oct 22) | Delta | Halt trigger |
|---|---|---|---|---|
| 30yr Fixed | 6.49% | **7.32%** | **+83 bp** | ≥50 bp → HALT |
| 15yr Fixed | 5.82% | **6.68%** | **+86 bp** | ≥50 bp → HALT |
| HELOC avg | 7.43% | **7.36%** | −7 bp | — |
| Prime | 6.75% | **7.00%** | +25 bp | — |

Week-over-week change from Oct 15 report:

| Rate | Oct 15 | Oct 22 | Change |
|---|---|---|---|
| 30yr Fixed | 7.40% | 7.32% | **−8 bp** |
| 15yr Fixed | 6.71% | 6.68% | **−3 bp** |
| HELOC avg | 7.34% | 7.36% | +2 bp |
| Prime | 7.00% | 7.00% | 0 bp |

**Sources (this run):**
- **30yr/15yr:** Freddie Mac PMMS, October 22, 2026. 30yr: 7.32% (down from 7.40%); 15yr: 6.68% (down from 6.71%). Confirmed via stocktitan.net ("Freddie Mac mortgage rate falls to 7.32%") and mortgagenewschannel.com PMMS archive.
- **30yr cross-check:** Bankrate Oct 22 national avg ≈ 7.39% (analysis page). Gap = **7 bp** ✓
- **15yr cross-check:** Bankrate Oct 22 national avg ≈ 6.73%. Gap = **5 bp** ✓ (resolved from last week's 11 bp failure)
- **HELOC:** Bankrate national average Oct 21, 2026 = 7.36%. Cross-check: heloccalculator.org Oct 20 = 7.34% → gap = **2 bp** ✓
- **Prime:** Fed H.15 Oct 21, 2026 = 7.00%, unchanged. Cross-check: Macrotrends (H.15-sourced) Oct 13 = 7.00% ✓. *Note: WSJ Money Rates cached pages in search results showed 6.75% from June 2026 — these predate the September 2026 FOMC rate hike and are stale. H.15 is authoritative.*

---

## Derived values (computed, not applied)

Math verified: re-running formulas with old manifest rates reproduces all current manifest `current` values exactly.

| Derived | Manifest (Jul 9) | New (if applied) | Notes |
|---|---|---|---|
| cashout_refi_30yr | 6.99% | **7.82%** | 30yr + 0.50 |
| heloc_vs_prime_spread | 0.68 | **0.36** | heloc_avg − prime |
| heloc_vs_refi_gap_pt | +0.44 | **−0.46** | heloc_avg − cashout_refi_30yr |
| sample_heloc_interest_monthly | $619 | **$613** | $100K × 7.36% / 12 |
| sample_existing_payment | $1,432 | $1,432 | Static (unchanged) |
| sample_heloc_total_monthly | $2,051 | **$2,045** | existing + HELOC interest |
| sample_refi_monthly | $2,659 | **$2,885** | amortize($400K, 7.82%, 30yr) |
| sample_gap_dollars | $608 | **$840** | refi_monthly − heloc_total |

### ⚠ Rate-gap inversion (continuing — fourth week)

`heloc_vs_refi_gap_pt` is **−0.46** (HELOC is 0.46 pp cheaper than cash-out refi on a rate basis). This is slightly better (less inverted) than Oct 15 (−0.56), because 30yr fell 8 bp this week. The hero card's total-monthly framing remains directionally correct ($2,045 HELOC path vs $2,885 refi = **$840/mo more for refi**), but any article prose saying the HELOC rate is "higher" than the refi rate is backwards and needs editorial correction before the hero card numbers are updated.

---

## Manifest regex status (all 10 patterns verified)

All 10 manifest `find_regex` patterns verified against live HTML this run. Site structure is intact.

| Pattern ID | Files matched | Status | Live value |
|---|---|---|---|
| masthead_30yr | 24/24 | ✓ | 6.49% |
| masthead_heloc | 24/24 | ✓ | 7.43% |
| masthead_prime | 24/24 | ✓ | 6.75% |
| masthead_15yr | 24/24 | ✓ | 5.82% |
| masthead_source_date | 24/24 | ✓ | Jul 9, 2026 |
| hero_dateline | index.html | ✓ | Jul 9, 2026 |
| hero_sample_heloc_interest | index.html | ✓ | 7.43%, $619 |
| hero_sample_heloc_total | index.html | ✓ | $2,051 |
| hero_sample_refi_line | index.html | ✓ | 6.99%, $2,659 |
| hero_verdict_dollars | index.html | ✓ | $608/mo more |

No regex misses. All edits are technically ready to apply the moment the full-audit halt is cleared.

---

## What would change on a cleared run (Oct 22 rates)

### Masthead (all 24 HTML files)

| Location ID | Current value | Would become |
|---|---|---|
| masthead_30yr | `6.49%` | `7.32%` |
| masthead_15yr | `5.82%` | `6.68%` |
| masthead_heloc | `7.43%` | `7.36%` |
| masthead_prime | `6.75%` | `7.00%` |
| masthead_source_date | `Jul 9, 2026` | `Oct 22, 2026` |

**24 files:** cash-out-refinance-guide.html, heloc-home-values-drop.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-college.html, heloc-application-process.html, heloc-for-renovation.html, heloc-as-emergency-fund.html, how-helocs-work.html, heloc-mistakes.html, heloc-vs-401k-loan.html, heloc-on-paid-off-house.html, heloc-vs-personal-loan.html, heloc-tax-deduction.html, heloc-vs-reverse-mortgage.html, heloc-requirements-2026.html, heloc-rates-2026.html, heloc-vs-home-equity-loan.html, james-b-solomon/index.html, how-to-shop-for-heloc.html, index.html, three-way-comparison.html, terms/index.html, privacy/index.html

### Hero card (index.html only)

| Location ID | Current value | Would become |
|---|---|---|
| hero_dateline | `Jul 9, 2026 rates · Sample Scenario` | `Oct 22, 2026 rates · Sample Scenario` |
| hero_sample_heloc_interest | `7.43% / $619` | `7.36% / $613` |
| hero_sample_heloc_total | `$2,051` | `$2,045` |
| hero_sample_refi_line | `$400K at 6.99% / $2,659` | `$400K at 7.82% / $2,885` |
| hero_verdict_dollars | `$608/mo more` | `$840/mo more` |

---

## Article prose with stale rate references

The comprehensive article-body scan from the **2026-10-01 full-audit report** (corroborated by Oct 8 and Oct 15) remains valid — no site changes have been made since July 9, 2026. Refer to those reports for full file:line context. Summary:

- **7.02% HELOC rate** (April 2026 baseline, stale): 13 files — cash-out-refinance-guide.html, heloc-as-emergency-fund.html, heloc-for-college.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-renovation.html, heloc-vs-401k-loan.html, heloc-vs-home-equity-loan.html, heloc-vs-personal-loan.html, heloc-vs-reverse-mortgage.html, how-helocs-work.html, index.html, three-way-comparison.html
- **6.75% prime rate** (stale; current is 7.00%): 8 references across 5 files — heloc-as-emergency-fund.html, heloc-for-debt-consolidation.html, heloc-mistakes.html, heloc-on-paid-off-house.html, how-helocs-work.html, how-to-shop-for-heloc.html, index.html, three-way-comparison.html
- **~6.62% cash-out refi rate in article prose** (stale; current market rate ~7.82%): three-way-comparison.html (multiple), cash-out-refinance-guide.html (multiple), heloc-for-renovation.html, heloc-on-paid-off-house.html — this gap is the most visually misleading; articles now understate the refi cost
- **Stale Fed-cuts narrative** ("Fed paused at its March 2026 meeting … forecast implies one more cut before year-end"): heloc-for-debt-consolidation.html:167, heloc-mistakes.html:113, how-helocs-work.html:110, index.html — **the Fed has since hiked** (prime rose to 7.00%); this is factually wrong
- **heloc-rates-2026.html**: Full article explicitly out of agent scope; needs dedicated human-authored refresh

---

## What to do next (priority order)

1. **Fix proxy allowlist / egress network policy** to permit DNS resolution and HTTPS to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov`. This is the **fourth consecutive run** blocked from direct source verification. The agent can source rates via WebSearch, but the runbook requires direct URL fetches for primary verification.

2. **Human content pass (required before agent can push any update):**
   - **Highest priority:** `heloc-for-debt-consolidation.html`, `heloc-mistakes.html`, `how-helocs-work.html`, `index.html` — stale "Fed cut forecasts" narrative. The Fed has hiked since these were written; the forecast references are factually wrong.
   - `heloc-rates-2026.html` — full article refresh. Explicitly out of agent scope. The lede ("7.02% as of April 8, 2026") and all rate examples need a human-authored rewrite.
   - All `~6.62%` cash-out refi references in article prose (three-way-comparison.html, cash-out-refinance-guide.html, etc.) — the 120 bp rate increase makes these comparisons meaningfully wrong.
   - All `7.02%` HELOC rate references in article prose (13 files).
   - All `6.75%` prime rate references in article prose (5 files).
   - Hero card review: the rate-gap inversion framing (HELOC is now 0.46 pp *cheaper* than cash-out refi by rate, not more expensive as implied by some article prose).

3. **Decide on manifest cross-check policy for PMMS vs Bankrate** for 30yr/15yr. Last three weeks alternated between passing and failing the 10 bp threshold. Recommended: document that the PMMS covers purchase loans with 20% down at excellent credit, while Bankrate uses 740 FICO; methodological differences up to ~10–15 bp are expected and not data errors. Options: (a) raise tolerance to 15 bp for this pair; (b) use a PMMS-specific archive as the cross-check (Freddie Mac's own prior-week PMMS release).

4. **Clear the halt and re-run** once network is fixed, manifest cross-check policy is updated, and human content pass is complete. Oct 22 target values: 30yr 7.32%, 15yr 6.68%, HELOC 7.36%, Prime 7.00%. If rates remain near these levels next week these are still correct.

5. **Site data is 105 days stale as of Oct 22, 2026.** If a manual update is preferred over waiting for all conditions to clear, the masthead values and hero card numbers listed in the "What would change" section above are the correct targets for Oct 22, 2026 rates.

---

*Agent halted. No files modified. No rate commit made. No push occurred.*
