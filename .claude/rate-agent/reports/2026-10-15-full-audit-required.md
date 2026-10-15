# Rate Agent — Full Audit Required (Third Consecutive Halt)
**Run date:** 2026-10-15  
**Scope classification:** HALT — Full Audit Required  
**No changes pushed to the site.**

---

## Summary

This is the **third consecutive full-audit halt** (Oct 1, Oct 8, Oct 15). The site has been displaying stale July 9, 2026 rates for **98 days**. Rates have moved +91 bp on the 30yr and +89 bp on the 15yr from manifest values — both well above the ≥50 bp full-audit threshold.

### Halt conditions triggered this run

1. **Full-audit threshold (≥50 bp):** 30yr Fixed moved +91 bp; 15yr Fixed moved +89 bp from manifest.
2. **Cross-source verification failure (>10 bp):** 15yr rate: Freddie Mac PMMS 6.71% vs Bankrate 6.82% = **11 bp gap**. Per runbook, this independently triggers a halt.
3. **Primary source URLs blocked:** Direct WebFetch/curl to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov` all return `ENOTFOUND` (DNS resolution failure). Rates sourced via WebSearch from indexed press releases and comparison sites. Data quality is high (GlobeNewswire copy of Freddie Mac Oct 15 press release; Bankrate Oct 14 national average; Fed H.15 Oct 14 release via FRED), but direct-URL primary verification is technically unmet.

---

## Rate deltas (manifest → October 15, 2026)

| Rate | Manifest (Jul 9) | This week (Oct 15) | Delta | Halt trigger |
|---|---|---|---|---|
| 30yr Fixed | 6.49% | **7.40%** | **+91 bp** | ≥50 bp → HALT |
| 15yr Fixed | 5.82% | **6.71%** | **+89 bp** | ≥50 bp → HALT |
| HELOC avg | 7.43% | **7.34%** | −9 bp | — |
| Prime | 6.75% | **7.00%** | +25 bp | — |

**Sources:**
- **30yr/15yr:** Freddie Mac PMMS release, October 15, 2026 — "Mortgage Rates Hold Steady at 7.40%" (GlobeNewswire, confirmed). 15yr from Freddie Mac archive: 6.71%, down 0.02 from Oct 8's 6.73%.
- **30yr cross-check:** Bankrate Oct 15 national avg = 7.50% → gap = **10 bp** (exactly at limit; runbook halt is `> 10 bp`; this does NOT independently trigger halt).
- **15yr cross-check:** Bankrate Oct 15 national avg = 6.82% → gap = **11 bp → VERIFICATION FAILURE** (>10 bp).
- **HELOC:** Bankrate national average Oct 14 = 7.34%. Cross-check: HELOC Calculator Oct 15 = 7.33% → gap = 1 bp ✓.
- **Prime:** Fed H.15 (via FRED) Oct 14 = 7.00%, unchanged. Cross-check: FRED DPRIME Oct 13 = 7.00% ✓.

**Comparison with Oct 8 report:**

| Rate | Oct 8 (reported) | Oct 15 (this run) | Week-over-week |
|---|---|---|---|
| 30yr Fixed | 7.40% | 7.40% | 0 bp |
| 15yr Fixed | 6.73% | 6.71% | −2 bp |
| HELOC avg | 7.33% | 7.34% | +1 bp |
| Prime | 7.00% | 7.00% | 0 bp |

Rates are essentially flat week-over-week. The site remains stale from July 9 in all cases.

---

## Derived values (computed, not applied)

Math verified: re-running formulas with old manifest rates reproduces all current manifest `current` values exactly (confirmed by Python computation this run).

| Derived | Manifest (Jul 9) | New (if applied) | Notes |
|---|---|---|---|
| cashout_refi_30yr | 6.99% | **7.90%** | 30yr + 0.50 (same as Oct 8) |
| heloc_vs_prime_spread | 0.68 | **0.34** | heloc_avg − prime |
| heloc_vs_refi_gap_pt | +0.44 | **−0.56** | heloc_avg − cashout_refi_30yr |
| sample_heloc_interest_monthly | $619 | **$612** | $100K × 7.34% / 12 |
| sample_existing_payment | $1,432 | $1,432 | Static |
| sample_heloc_total_monthly | $2,051 | **$2,044** | existing + HELOC interest |
| sample_refi_monthly | $2,659 | **$2,907** | amortize($400K, 7.90%, 30yr) |
| sample_gap_dollars | $608 | **$863** | refi_monthly − heloc_total |

### ⚠ Rate-gap inversion (continuing — third week)

`heloc_vs_refi_gap_pt` is **−0.56** (HELOC is 0.56 pp cheaper than cash-out refi on a rate basis). This is a slight improvement from Oct 8 (−0.57) due to HELOC ticking up 1 bp. The hero card's copy framing the refi as more expensive remains directionally correct on a total monthly basis ($2,044 HELOC path vs $2,907 refi = **$863/mo more for refi**), but any prose saying the HELOC rate is *higher* than the refi rate is backwards. This needs editorial review before the agent updates the hero card numbers.

---

## Manifest regex status (all 10 patterns verified)

All 10 manifest `find_regex` patterns verified against live HTML this run.

| Pattern ID | Files matched | Status |
|---|---|---|
| masthead_30yr | 24/24 | ✓ (value: 6.49%) |
| masthead_heloc | 24/24 | ✓ (value: 7.43%) |
| masthead_prime | 24/24 | ✓ (value: 6.75%) |
| masthead_15yr | 24/24 | ✓ (value: 5.82%) |
| masthead_source_date | 24/24 | ✓ (Jul 9, 2026) |
| hero_dateline | index.html | ✓ (Jul 9, 2026) |
| hero_sample_heloc_interest | index.html | ✓ (7.43%, $619) |
| hero_sample_heloc_total | index.html | ✓ ($2,051) |
| hero_sample_refi_line | index.html | ✓ (6.99%, $2,659) |
| hero_verdict_dollars | index.html | ✓ ($608/mo more) |

No regex misses. Site structure is intact. All edits are technically ready to apply the moment a human clears the halt.

---

## What would change on a normal run (once cleared for human review)

### Masthead (all 24 HTML files)

| Location ID | Current value | Would become |
|---|---|---|
| masthead_30yr | `6.49%` | `7.40%` |
| masthead_15yr | `5.82%` | `6.71%` |
| masthead_heloc | `7.43%` | `7.34%` |
| masthead_prime | `6.75%` | `7.00%` |
| masthead_source_date | `Jul 9, 2026` | `Oct 15, 2026` |

**24 files:** cash-out-refinance-guide.html, heloc-home-values-drop.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-college.html, heloc-application-process.html, heloc-for-renovation.html, heloc-as-emergency-fund.html, how-helocs-work.html, heloc-mistakes.html, heloc-vs-401k-loan.html, heloc-on-paid-off-house.html, heloc-vs-personal-loan.html, heloc-tax-deduction.html, heloc-vs-reverse-mortgage.html, heloc-requirements-2026.html, heloc-rates-2026.html, heloc-vs-home-equity-loan.html, james-b-solomon/index.html, how-to-shop-for-heloc.html, index.html, three-way-comparison.html, terms/index.html, privacy/index.html

### Hero card (index.html only)

| Location ID | Current value | Would become |
|---|---|---|
| hero_dateline | `Jul 9, 2026 rates · Sample Scenario` | `Oct 15, 2026 rates · Sample Scenario` |
| hero_sample_heloc_interest | `7.43% / $619` | `7.34% / $612` |
| hero_sample_heloc_total | `$2,051` | `$2,044` |
| hero_sample_refi_line | `$400K at 6.99% / $2,659` | `$400K at 7.90% / $2,907` |
| hero_verdict_dollars | `$608/mo more` | `$863/mo more` |

---

## Article prose with stale rate references

The comprehensive article-body scan from the **2026-10-01 full-audit report** (corroborated by the Oct 8 report) remains valid — no site changes have been made since that report. Refer to those reports for full file:line context. Summary:

- **7.02% HELOC rate** (April 2026 stale): 13 files, including cash-out-refinance-guide.html, heloc-as-emergency-fund.html, heloc-for-college.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-renovation.html, heloc-vs-401k-loan.html, heloc-vs-home-equity-loan.html, heloc-vs-personal-loan.html, heloc-vs-reverse-mortgage.html, how-helocs-work.html, index.html, three-way-comparison.html
- **6.75% prime rate** (stale; current is 7.00%): 8 references across 5 files
- **6.37% and 6.49%/5.82% mortgage rates in prose**: cash-out-refinance-guide.html, heloc-on-paid-off-house.html, heloc-vs-home-equity-loan.html, index.html
- **Stale Fed-cuts narrative** (Fed has since *hiked*): heloc-for-debt-consolidation.html, heloc-mistakes.html, how-helocs-work.html, index.html
- **heloc-rates-2026.html**: Full article explicitly out of agent scope; needs dedicated human-authored refresh

---

## What to do next (priority order)

1. **Fix proxy allowlist / egress network policy** to permit DNS resolution and HTTPS to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov`. This is the **third consecutive run** blocked from direct source verification. Until this is resolved, the agent cannot complete a verified run even if all other halt conditions were cleared.

2. **Decide on manifest policy for PMMS vs Bankrate 30yr/15yr discrepancy.** The PMMS–Bankrate gap for the 15yr (11 bp this week, 9 bp last week) is a recurring methodological difference that triggers the cross-verification halt rule. Options: (a) raise the cross-check tolerance to 15 bp for PMMS vs Bankrate specifically, noting the methodological difference in the manifest; (b) treat PMMS as authoritative for 30yr/15yr and remove Bankrate as their cross-check source; (c) keep the current rule and require human clearance whenever Bankrate and PMMS diverge by >10 bp.

3. **Human content pass (required before agent can push any update):**
   - `heloc-for-debt-consolidation.html`, `heloc-mistakes.html`, `how-helocs-work.html`, `index.html` — stale "Fed cut forecasts" narrative (the Fed has since **hiked**). Highest editorial priority.
   - `heloc-rates-2026.html` — full article refresh. Explicitly out of agent scope.
   - All `7.02%` HELOC rate references in article prose (13 files; see Oct 1 report for line numbers).
   - All `6.75%` prime rate references in article prose (8 references; see Oct 1 report).
   - Hero card editorial review — rate-gap inversion framing (HELOC rate is now 0.56 pp lower than cash-out refi, so any copy saying HELOC rate is "higher" is backwards).

4. **Clear the halt and re-run** once network is fixed, manifest cross-check policy is updated, and human content pass is complete. The agent's computed values for this week are: 30yr 7.40%, 15yr 6.71%, HELOC 7.34%, Prime 7.00%. If rates remain flat next week, these are still the right target values.

5. **Site data is 98 days stale as of Oct 15, 2026.** If a manual update is preferred over waiting for all conditions to clear, the masthead values and hero card numbers listed above are the correct targets.

---

*Agent halted. No files modified. No rate commit made. No push occurred.*
