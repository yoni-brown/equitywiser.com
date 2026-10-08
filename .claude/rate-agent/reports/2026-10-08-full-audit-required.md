# Rate Agent — Full Audit Required (Second Consecutive Halt)
**Run date:** 2026-10-08  
**Scope classification:** HALT — Full Audit Required  
**No changes pushed to the site.**

---

## Summary

This is the **second consecutive full-audit halt**. The previous run (2026-10-01) also halted for the same reason. The site has been displaying stale July 9, 2026 rates for nearly 13 weeks. Rates have now moved +91 bp on the 30yr and 15yr from manifest values.

### Why this run halted independently

Three halt conditions fired:

1. **Full-audit threshold (≥50 bp):** 30yr Fixed moved +91 bp, 15yr Fixed moved +91 bp.
2. **Cross-source verification failure (>10 bp):** 30yr: Freddie Mac PMMS 7.40% vs Bankrate 7.53% = 13 bp. (Same methodological discrepancy flagged in the Oct 1 report.)
3. **Primary source URLs blocked:** Direct WebFetch/curl to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov` all return `EGRESS_BLOCKED`. Rate data sourced via WebSearch from indexed press releases. Data quality is high (Freddie Mac Oct 8 press release cited; Bankrate Oct 7 national average; FRED Oct 2 prime reading), but direct-URL verification is technically unmet.

---

## Rate deltas (manifest → October 8, 2026)

| Rate | Manifest (Jul 9) | This week (Oct 8) | Delta | Halt trigger |
|---|---|---|---|---|
| 30yr Fixed | 6.49% | **7.40%** | **+91 bp** | ≥50 bp → HALT |
| 15yr Fixed | 5.82% | **6.73%** | **+91 bp** | ≥50 bp → HALT |
| HELOC avg | 7.43% | **7.33%** | −10 bp | — |
| Prime | 6.75% | **7.00%** | +25 bp | — |

**Sources:**
- 30yr/15yr: Freddie Mac PMMS release, October 8, 2026 (7.40% / 6.73%). Confirmed by Bankrate Oct 8 (7.53% / 6.82% — 13 bp / 9 bp gap; methodological, see Oct 1 report).
- HELOC: Bankrate national average, October 7, 2026 (7.33%). Cross-check: Forbes/Curinos Oct 6 (7.43%) = 10 bp gap (exactly at limit).
- Prime: FRED (Federal Reserve H.15), updated October 5, 2026 (7.00%). The September 16, 2026 Fed hike moved fed funds to 3.75–4.00%; prime follows at fed funds + 3.00%. Bankrate's WSJ prime page shows a stale 6.75% (last updated June 30, 2026 — before the September hike); FRED data is authoritative.

**Comparison with Oct 1 report:**

| Rate | Oct 1 (reported) | Oct 8 (this run) | Week-over-week |
|---|---|---|---|
| 30yr Fixed | 7.28% | 7.40% | +12 bp |
| 15yr Fixed | 6.60% | 6.73% | +13 bp |
| HELOC avg | 7.29% | 7.33% | +4 bp |
| Prime | 7.00% | 7.00% | 0 bp |

---

## Derived values (computed, not applied)

Math verified: re-running formulas with old manifest rates reproduces all current manifest `current` values exactly.

| Derived | Manifest | New (if applied) | Notes |
|---|---|---|---|
| cashout_refi_30yr | 6.99% | **7.90%** | 30yr + 0.50 |
| heloc_vs_prime_spread | 0.68 | **0.33** | heloc_avg − prime |
| heloc_vs_refi_gap_pt | +0.44 | **−0.57** | heloc_avg − cashout_refi_30yr |
| sample_heloc_interest_monthly | $619 | **$611** | $100K × 7.33% / 12 |
| sample_existing_payment | $1,432 | $1,432 | Static |
| sample_heloc_total_monthly | $2,051 | **$2,043** | existing + HELOC interest |
| sample_refi_monthly | $2,659 | **$2,907** | amortize($400K, 7.90%, 30yr) |
| sample_gap_dollars | $608 | **$864** | refi_monthly − heloc_total |

### ⚠ Rate-gap inversion (editorial flag — escalating)

`heloc_vs_refi_gap_pt` is now **−0.57** (HELOC 0.57% cheaper than cash-out refi). In the Oct 1 report it was −0.49. The trend is continuing — the rate gap inversion flagged last week is larger now. The hero card's copy must be human-reviewed before any update is pushed.

The total monthly comparison remains strongly favorable for HELOC ($2,043 vs $2,907 = **$864/mo more for refi**), so the core argument is intact. But any site copy referring to the HELOC rate being *higher* than the refi rate is now backwards.

---

## Manifest regex status

All 10 manifest `find_regex` patterns were verified against `index.html` and one non-index file. **All match.** The site structure is unchanged from the manifest.

---

## What would change on a normal run (once cleared)

### Masthead (all 24 HTML files)

| Location ID | Current value | Would become |
|---|---|---|
| masthead_30yr | `6.49%` | `7.40%` |
| masthead_15yr | `5.82%` | `6.73%` |
| masthead_heloc | `7.43%` | `7.33%` |
| masthead_prime | `6.75%` | `7.00%` |
| masthead_source_date | `Jul 9, 2026` | `Oct 8, 2026` |

**24 files:** cash-out-refinance-guide.html, heloc-home-values-drop.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-college.html, heloc-application-process.html, heloc-for-renovation.html, heloc-as-emergency-fund.html, how-helocs-work.html, heloc-mistakes.html, heloc-vs-401k-loan.html, heloc-on-paid-off-house.html, heloc-vs-personal-loan.html, heloc-tax-deduction.html, heloc-vs-reverse-mortgage.html, heloc-requirements-2026.html, heloc-rates-2026.html, heloc-vs-home-equity-loan.html, james-b-solomon/index.html, how-to-shop-for-heloc.html, index.html, three-way-comparison.html, terms/index.html, privacy/index.html

### Hero card (index.html only)

| Location ID | Current value | Would become |
|---|---|---|
| hero_dateline | `Jul 9, 2026 rates · Sample Scenario` | `Oct 8, 2026 rates · Sample Scenario` |
| hero_sample_heloc_interest | `7.43% / $619` | `7.33% / $611` |
| hero_sample_heloc_total | `$2,051` | `$2,043` |
| hero_sample_refi_line | `$400K at 6.99% / $2,659` | `$400K at 7.90% / $2,907` |
| hero_verdict_dollars | `$608/mo more` | `$864/mo more` |

---

## Article prose with stale rate references

The article-body scan from the **2026-10-01 full-audit report** remains valid — no site changes have been made. Below is a consolidated summary; see that report for full file:line context.

### Stale 7.02% HELOC avg (widespread — April 2026 rate)

Many articles cite `7.02%` as the HELOC rate "as of April 2026" or "current." The current Bankrate avg is **7.33%**. This affects:

| File | References | Nature |
|---|---|---|
| cash-out-refinance-guide.html | Lines 126, 147, 157 | Rate table row; dollar examples at 7.02% |
| heloc-as-emergency-fund.html | Lines 102, 141, 174 | Rate comparisons and math examples |
| heloc-for-college.html | Lines 90, 93, 107, 127, 200, 230 | Comparisons, tables, math |
| heloc-for-debt-consolidation.html | Lines 118, 129, 167, 208 | Math examples; "currently 6.75%" prime ref |
| heloc-for-investment-property.html | Lines 93, 107, 132 | Rate table; math example |
| heloc-for-renovation.html | Lines 110, 144 | Rate table; math example |
| heloc-vs-401k-loan.html | Lines 92, 113, 158, 187 | Comparisons; "7.75% today" derived from stale prime |
| heloc-vs-home-equity-loan.html | Lines 92, 138, 167, 177, 202 | Comparisons; tables; math |
| heloc-vs-personal-loan.html | Lines 92, 114, 141, 163, 173 | Comparisons; rate table; math |
| heloc-vs-reverse-mortgage.html | Lines 114, 145 | Rate table; math |
| how-helocs-work.html | Lines 100, 102, 130, 140, 144, 195 | Multiple examples |
| index.html | Lines 507, 562, 673, 695 | Inline edu text; FAQ; editorial commentary |
| three-way-comparison.html | Lines 142, 153, 164 | Comparison math |

### Stale 6.75% prime rate

All references from the Oct 1 report still apply (8 references across 5 files). Additionally, the **heloc-vs-401k-loan.html** line 92 references "Prime + 1% (about 7.75% today)" — this was based on the old 6.75% prime; with prime now at 7.00%, that would be 8.00%.

### Stale 6.49%/5.82%/6.37% mortgage rates

`6.49%` and `5.82%` appear only in masthead elements (correctly handled by manifest). `6.37%` (April 2026 Freddie Mac rate) appears in article prose:
- cash-out-refinance-guide.html: Lines 111, 121, 147 (examples with "6.37% rate-and-term refi")
- heloc-on-paid-off-house.html: Line 121 (rate table row)
- heloc-vs-home-equity-loan.html: Line 141 (table row)
- index.html: Line 695 (FAQ answer)

### ⚠ Narrative staleness beyond rate numbers

**heloc-for-debt-consolidation.html line 167:** "The Fed cut rates seven times...paused at its March 2026 meeting; the median projection implies one more 25 bps cut before year-end." The Fed has since **hiked** (September 2026), reversing this forecast entirely.

**heloc-mistakes.html line 113:** Same forecasting language — "with forecasts pointing to further cuts." Now factually incorrect; a rate hike has occurred.

**how-helocs-work.html line 110:** "down 1.75 points from its 8.50% peak after seven cuts between September 2024 and December 2025." Prime is now **7.00%** (1.50 points below peak, not 1.75), after the September 2026 hike reversed one of those cuts.

**index.html line 673:** "at 7.02%, rates are near a 3-year low. One more cut would push averages toward 6.75–6.85%. The era of rapidly falling HELOC rates...is largely over." With HELOC at 7.33% and the Fed hiking, this commentary is directionally wrong.

**heloc-rates-2026.html:** Full article remains stale at April 2026 snapshot. This file is explicitly out of agent scope — requires dedicated human-authored refresh.

---

## What to do next

1. **Fix proxy allowlist** to permit egress to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov`. This is the second consecutive run blocked from direct source verification. See Oct 1 report for details.

2. **Decide on the PMMS vs Bankrate 30yr discrepancy** (13 bp gap). The Oct 1 report recommended either raising cross-check tolerance for these two sources or treating PMMS as authoritative when it is the designated primary. This is a manifest policy decision, not an emergency.

3. **Human content pass — priority order:**
   - All files with stale "Fed cut forecasts" narrative (heloc-for-debt-consolidation.html, heloc-mistakes.html, how-helocs-work.html, index.html) — the Fed has *hiked*, not cut, since these were written.
   - heloc-rates-2026.html — full article refresh.
   - All 7.02% HELOC rate references in article prose (see table above).
   - All 6.75% prime rate references in article prose.
   - All 6.37% mortgage rate references in article prose.

4. **Hero card editorial review** — the rate-gap inversion (HELOC now 0.57% cheaper than cash-out refi on a rate basis) means hero card framing copy needs human review before the agent updates numbers.

5. **Re-run the agent** once proxy is fixed and human content pass is complete. If the owner decides to accept PMMS as authoritative over Bankrate for the 30yr cross-check and update the manifest policy, the delta-threshold halt will remain until the manifest values are reset (which requires a human to confirm the new values). The agent is designed to halt until a human explicitly clears it on ≥50 bp moves.

---

*Agent halted. No files modified. No commit made.*
