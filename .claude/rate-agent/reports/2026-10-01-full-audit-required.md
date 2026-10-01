# Rate Agent — Full Audit Required
**Run date:** 2026-10-01  
**Scope classification:** HALT — Full Audit Required  
**No changes pushed to the site.**

---

## Halt conditions triggered

Three independent halt conditions fired on this run. Any one of them alone would halt the run.

### 1. Full-audit threshold exceeded (≥50 bp on two rates)

| Rate | Old (manifest) | New (sources) | Delta | Threshold |
|---|---|---|---|---|
| 30yr Fixed | 6.49% | 7.28% | **+79 bp** | ≥50 bp → HALT |
| 15yr Fixed | 5.82% | 6.60% | **+78 bp** | ≥50 bp → HALT |
| HELOC avg | 7.43% | 7.29% | −14 bp | — |
| Prime | 6.75% | 7.00% | +25 bp | — |

### 2. Cross-source verification failures (>10 bp disagreement)

The runbook requires cross-checking each rate against a secondary source. Three rates failed:

| Rate | Primary (Freddie Mac PMMS) | Secondary (Bankrate/Experian) | Disagreement |
|---|---|---|---|
| 30yr Fixed | 7.28% (PMMS, Oct 1) | 7.43% (Bankrate, Oct 1) | **15 bp** |
| 15yr Fixed | 6.60% (PMMS, Oct 1) | 6.76% (Bankrate, Oct 1) | **16 bp** |
| HELOC avg | 7.29% (Bankrate, Sep 30) | 7.53% (Experian/Curinos, Sep 2026) | **24 bp** |
| Prime | 7.00% (multiple sources) | 7.00% (WSJ, multiple) | ✓ pass |

**Note on PMMS vs Bankrate divergence:** The gap between Freddie Mac PMMS (7.28%) and Bankrate (7.43%) for the 30yr is likely methodological — PMMS surveys lenders earlier in the week, Bankrate uses a different sample. Both are plausibly "correct" for their methodology. However, the runbook requires halting on >10 bp disagreement regardless. Human review should determine which figure is preferred for the site's reporting and whether to update the manifest cross-check tolerance or accept the PMMS figure as authoritative.

### 3. Primary source URLs blocked by network proxy

Direct WebFetch to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov` all returned `EGRESS_BLOCKED`. Rate data was obtained via WebSearch from indexed press releases and articles. The data appears reliable (Freddie Mac Oct 1 press release cited directly), but this violates the runbook's requirement to `WebFetch` each source URL directly.

**Recommendation:** Fix proxy allowlist to permit egress to these domains, then re-run.

---

## Rate summary for the record

Data as of October 1, 2026. Sources obtained via WebSearch indices.

| Rate | Old | New | Delta | Notes |
|---|---|---|---|---|
| 30yr Fixed | 6.49% | 7.28% | +79 bp | Freddie Mac PMMS Oct 1, 2026 |
| 15yr Fixed | 5.82% | 6.60% | +78 bp | Freddie Mac PMMS Oct 1, 2026 |
| HELOC avg | 7.43% | 7.29% | −14 bp | Bankrate national avg Sep 30, 2026 |
| Prime | 6.75% | 7.00% | +25 bp | Fed H.15; rate changed Sep 17, 2026 |

**Context:** Manifest last_run was 2026-07-09 — roughly 12 weeks of drift. The Fed appears to have hiked rates in September 2026 (prime went from 6.75% to 7.00%), which is directly contradicted by current article prose forecasting further cuts.

---

## Derived values (computed, not applied)

New values if rates were applied using manifest formulas:

| Derived | Old | New | Formula |
|---|---|---|---|
| cashout_refi_30yr | 6.99% | **7.78%** | 30yr + 0.50 |
| heloc_vs_prime_spread | 0.68 | **0.29** | heloc_avg − prime |
| heloc_vs_refi_gap_pt | +0.44 | **−0.49** | heloc_avg − cashout_refi_30yr |
| sample_heloc_interest_monthly | $619 | **$608** | $100K × heloc_avg / 12 |
| sample_existing_payment | $1,432 | $1,432 | static |
| sample_heloc_total_monthly | $2,051 | **$2,040** | existing + HELOC interest |
| sample_refi_monthly | $2,659 | **$2,874** | amortize($400K, cashout_refi_30yr, 30yr) |
| sample_gap_dollars | $608 | **$834** | refi_monthly − heloc_total |

### ⚠ Editorial flag: rate-gap inversion

`heloc_vs_refi_gap_pt` has flipped from **+0.44** (HELOC 0.44% MORE expensive than cashout refi) to **−0.49** (HELOC now **0.49% CHEAPER** than cashout refi). This is a significant editorial concern:

- The hero card currently implies the HELOC rate is higher than the refi rate, while the HELOC scenario still wins on total monthly cost because you keep the existing low-rate mortgage.
- With new rates, the HELOC rate itself is now lower than the cashout refi rate, which changes the narrative framing. A human author needs to decide how to frame this.
- The total monthly comparison still strongly favors HELOC ($2,040 vs $2,874 = $834/mo more for refi), so the core argument is intact — but the rate-gap copy needs rewriting.

---

## Manifest locations that would change

All 24 HTML files have 5 masthead values to update. Index.html has 5 additional hero card values.

### Masthead (all 24 HTML files)
| Location ID | Find | Replace |
|---|---|---|
| masthead_30yr | `6.49%` | `7.28%` |
| masthead_15yr | `5.82%` | `6.60%` |
| masthead_heloc | `7.43%` | `7.29%` |
| masthead_prime | `6.75%` | `7.00%` |
| masthead_source_date | `Jul 9, 2026` (or similar) | `Oct 1, 2026` |

**Files:** cash-out-refinance-guide.html, heloc-home-values-drop.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-college.html, heloc-application-process.html, heloc-for-renovation.html, heloc-as-emergency-fund.html, how-helocs-work.html, heloc-mistakes.html, heloc-vs-401k-loan.html, heloc-on-paid-off-house.html, heloc-vs-personal-loan.html, heloc-tax-deduction.html, heloc-vs-reverse-mortgage.html, heloc-requirements-2026.html, heloc-rates-2026.html, heloc-vs-home-equity-loan.html, james-b-solomon/index.html, how-to-shop-for-heloc.html, index.html, three-way-comparison.html, terms/index.html, privacy/index.html

### Hero card (index.html only)
| Location ID | Old | New |
|---|---|---|
| hero_dateline | `Jul 9, 2026 rates · Sample Scenario` | `Oct 1, 2026 rates · Sample Scenario` |
| hero_sample_heloc_interest | `7.43%` / `$619` | `7.29%` / `$608` |
| hero_sample_heloc_total | `$2,051` | `$2,040` |
| hero_sample_refi_line | `$400K at 6.99%` / `$2,659` | `$400K at 7.78%` / `$2,874` |
| hero_verdict_dollars | `$608/mo more` | `$834/mo more` |

---

## Article prose with stale rate references

These are article body references (not masthead, not hero card) that contain old rate values. These are **out of scope for normal/expanded runs** but require human content review after rates change materially.

### Stale Prime rate (6.75% → 7.00%)

| File | Line | Excerpt |
|---|---|---|
| heloc-vs-home-equity-loan.html | 105 | `currently 6.75%) plus a markup the lender adds` |
| heloc-vs-home-equity-loan.html | 130 | `Prime down from 8.50% to 6.75%, pulling HELOC rates` |
| heloc-vs-home-equity-loan.html | 142 | `<tr><td>U.S. Prime Rate</td><td>6.75%</td><td>WSJ, since Dec 11, 2025</td></tr>` |
| how-to-shop-for-heloc.html | 102 | `currently 6.75%, set by each large bank` |
| three-way-comparison.html | 182 | `the benchmark most consumer loans use, currently 6.75%` |
| heloc-mistakes.html | 113 | `currently 6.75%). Your rate is prime plus a margin` |
| how-helocs-work.html | 110 | `Prime is **6.75%**, down 1.75 points from its 8.50% peak` |
| how-helocs-work.html | 129 | `<tr><td>U.S. Prime Rate</td><td>6.75%</td><td>Fed H.15, Dec 11, 2025</td></tr>` |

### Stale HELOC avg (7.43% → 7.29%) in article prose

`7.43%` appears only in masthead and hero card — no stale prose references outside manifest locations.

### Stale 30yr/15yr in article prose

`6.49%` and `5.82%` appear only in masthead elements — no stale prose references outside manifest locations.

### ⚠ Additional editorial concern in article prose

**heloc-mistakes.html:113** says *"The Fed cut rates seven times between September 2024 and December 2025 and paused at its March 2026 meeting, with forecasts pointing to further cuts."* The prime rate has since **risen** from 6.75% to 7.00% (Sep 17, 2026), directly contradicting the "forecasts pointing to further cuts" narrative. This line needs human rewrite — not just a rate number swap.

**how-helocs-work.html:110** says *"down 1.75 points from its 8.50% peak after seven cuts between September 2024 and December 2025."* With prime now at 7.00%, this is now off by 0.25 points and the statement is factually stale.

---

## heloc-rates-2026.html (out-of-scope article)

This article is explicitly excluded from the agent's scope. It contains numerous stale references including:
- Line 101: Bankrate HELOC avg at `7.02%` (as of April 8, 2026)
- Line 101: Prime rate `6.75%`
- Line 114: Prime rate table row `6.75%, Unchanged since Dec 11, 2025`
- Line 109: Example rate `~6.75%`
- Line 161: Fed forecast scenario row at `6.75%`

This article needs a full human-authored content refresh.

---

## What to do next

1. **Fix the proxy allowlist** to permit egress to `freddiemac.com`, `bankrate.com`, and `federalreserve.gov` (and ideally `fred.stlouisfed.org`). Re-run the agent after fixing, and the direct-source verification will either pass or give a cleaner failure signal.

2. **Decide on the PMMS vs Bankrate discrepancy.** The 15 bp gap between Freddie Mac PMMS and Bankrate is structural/methodological, not an error. Consider either (a) raising the cross-check tolerance for PMMS vs Bankrate sources in the manifest, or (b) always treating PMMS as authoritative when it is the primary source.

3. **Human content pass on article prose** — at minimum:
   - heloc-vs-home-equity-loan.html (lines 105, 130, 142)
   - how-to-shop-for-heloc.html (line 102)
   - three-way-comparison.html (line 182)
   - heloc-mistakes.html (line 113 — also needs a narrative rewrite, not just a number swap)
   - how-helocs-work.html (lines 110, 129)
   - heloc-rates-2026.html (full article refresh)

4. **Hero card editorial review.** The `heloc_vs_refi_gap_pt` inversion (from +0.44 to −0.49) means the framing of the hero card comparison has changed. The numbers still favor HELOC strongly ($834/mo more for refi), but copy that says "HELOC rate is above refi rate" is no longer accurate. Consider whether to update the framing before re-running the agent.

5. **Once proxy and verification issues are resolved,** re-run the agent. If the 30yr delta from any new verified value is still ≥50 bp vs. manifest, it will halt again for full audit — which is correct behavior until a human clears the prose pass.

---

*Agent halted. No files modified. No commit made.*
