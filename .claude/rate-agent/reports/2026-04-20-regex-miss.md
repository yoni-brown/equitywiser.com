# Rate-Update Run — HALTED: Regex Miss
**Date:** 2026-04-20  
**Run type:** Halted — manifest regex failures  
**Pushed:** No

---

## Summary

Three manifest regex patterns failed to match the current HTML. Per runbook policy, no edits were made and nothing was pushed. Human action is required to fix the manifest before rerunning.

---

## Halt Triggers

### Miss 1 & 2 — `hero_heloc_rate` and `hero_refi_rate` (index.html)

**Patterns:**
```
hero_heloc_rate:
  <dt>HELOC average<small>Variable · Prime + ([\d.]+)</small></dt>\s*<dd>(\d+\.\d+)<span class="hd-pct">%</span></dd>

hero_refi_rate:
  <dt>30‑yr cash‑out refi<small>Fixed · ~0.5 pt over 30‑yr</small></dt>\s*<dd>~(\d+\.\d+)<span class="hd-pct">%</span></dd>
```

**Root cause:** Neither `<dt>/<dd>` nor `.hd-pct` elements exist anywhere in index.html (verified across all 827 lines). The hero card uses a `<div class="hd-line">/<span>` layout, not a `<dl>/<dt>/<dd>` layout. These manifest entries appear to describe a planned or deprecated section that was never present in the current HTML.

**Note:** The rate values these entries would update (HELOC avg and cash-out refi rate) *are* covered by other manifest entries that do match:
- HELOC rate 7.02% → covered by `hero_sample_heloc_interest` (line 66)
- Refi rate 6.87% → covered by `hero_sample_refi_line` (line 78)

There is no data loss from these two patterns being absent, but the manifest must be corrected before the agent can run cleanly.

**Recommended fix:** Remove `hero_heloc_rate` and `hero_refi_rate` from `manifest.json`. Confirm that the HELOC rate and refi rate are adequately represented by `hero_sample_heloc_interest` and `hero_sample_refi_line`, then verify with a dry-run grep.

---

### Miss 3 — `masthead_source_date` (8 of 24 HTML files)

**Pattern:**
```
Freddie Mac PMMS &middot; ([A-Z][a-z]+ \d{1,2}, \d{4})
```

**Files where it MATCHED (16):**
index.html, heloc-application-process.html, heloc-as-emergency-fund.html, heloc-for-college.html, heloc-for-debt-consolidation.html, heloc-for-investment-property.html, heloc-for-renovation.html, heloc-home-values-drop.html, heloc-mistakes.html, heloc-on-paid-off-house.html, heloc-rates-2026.html (partial — matched masthead, body is out of scope), heloc-requirements-2026.html, heloc-tax-deduction.html, james-b-solomon.html, privacy.html, terms.html

**Files where it MISSED (8):**
- cash-out-refinance-guide.html
- heloc-rates-2026.html *(masthead check only — confirmed this file is in the miss list)*
- heloc-vs-401k-loan.html
- heloc-vs-home-equity-loan.html
- heloc-vs-personal-loan.html
- heloc-vs-reverse-mortgage.html
- how-helocs-work.html
- three-way-comparison.html

**Root cause:** The 8 missing files use a **literal Unicode middle-dot** (`·`, U+00B7) in the rate-source span, whereas the manifest regex looks for the **HTML entity** `&middot;`. The two variants are visually identical but textually different. 

Affected span in the 8 files:
```html
<span class="rate-item" style="color:var(--ink-light);font-size:0.62rem;">Freddie Mac PMMS · Apr 9, 2026</span>
```

Matched span (the 16 files):
```html
<span class="rate-item rate-source">Freddie Mac PMMS &middot; Apr 9, 2026</span>
```

**Recommended fix (two options):**

Option A — Fix the 8 HTML files to use `&middot;` + the `rate-source` class (normalizes the template):
```html
<span class="rate-item rate-source">Freddie Mac PMMS &middot; Apr 9, 2026</span>
```

Option B — Update the manifest regex to match either variant:
```
Freddie Mac PMMS (?:&middot;|·) ([A-Z][a-z]+ \d{1,2}, \d{4})
```
Note: Option B would also require the replacement to preserve whichever variant the file uses, which complicates the agent's edit logic. Option A is cleaner.

---

## Rate Data Collected (valid — cross-verification passed)

All four rates were successfully fetched and cross-verified. This data is ready to apply once the manifest is fixed.

| Rate | Old (Apr 9) | New (Apr 16) | Δ bp | Primary source | Cross-check | Cross-check Δ |
|---|---|---|---|---|---|---|
| 30yr Fixed | 6.37% | **6.30%** | −7 | Freddie Mac PMMS Apr 16 | Bankrate 6.34% | 4 bp ✓ |
| 15yr Fixed | 5.74% | **5.65%** | −9 | Freddie Mac PMMS Apr 16 | Bankrate 5.72% | 7 bp ✓ |
| HELOC avg | 7.02% | **7.07%** | +5 | Bankrate national avg Apr 15 | CBS/Money.com 7.14% | 7 bp ✓ |
| Prime | 6.75% | **6.75%** | 0 | Fed H.15 (unchanged) | PrimeRates.com 6.75% | 0 bp ✓ |

*Note on HELOC cross-verification: Curinos (different methodology) reported 7.24% for Apr 16–19, a 17 bp gap vs Bankrate. Curinos uses a larger sample with different loan parameters; this divergence is consistent with known methodology differences between the two surveys and is not indicative of a data error.*

**Scope classification that would have applied:** Normal run (max delta = 9 bp, well under 24 bp threshold).

---

## Derived Values That Would Have Changed

| Derived | Old | New | Formula |
|---|---|---|---|
| cashout_refi_30yr | 6.87% | **6.80%** | 30yr_fixed + 0.50 |
| heloc_vs_prime_spread | 0.27 | **0.32** | heloc_avg − prime |
| heloc_vs_refi_gap_pt | 0.15 | **0.27** | heloc_avg − cashout_refi_30yr |
| sample_heloc_interest_monthly | $585 | **$589** | 100K × 7.07% / 12 |
| sample_existing_payment | $1,432 | $1,432 | STATIC (300K @ 4.0%, 30yr) |
| sample_heloc_total_monthly | $2,017 | **$2,021** | existing + HELOC interest |
| sample_refi_monthly | $2,626 | **$2,608** | amortize(400K, 6.80%, 30yr) |
| sample_gap_dollars | $609 | **$587** | refi − heloc total |

---

## Regex Patterns That DID Match

All other manifest patterns matched correctly on their target files:

| Pattern | Files | Result |
|---|---|---|
| masthead_30yr | all 24 | ✓ matched 24/24 |
| masthead_heloc | all 24 | ✓ matched 24/24 |
| masthead_prime | all 24 | ✓ matched 24/24 |
| masthead_15yr | all 24 | ✓ matched 24/24 |
| masthead_source_date | all 24 | **✗ matched 16/24** |
| hero_dateline | index.html | ✓ matched |
| hero_heloc_rate | index.html | **✗ no match** |
| hero_refi_rate | index.html | **✗ no match** |
| hero_sample_heloc_interest | index.html | ✓ matched |
| hero_sample_heloc_total | index.html | ✓ matched |
| hero_sample_refi_line | index.html | ✓ matched |
| hero_verdict_dollars | index.html | ✓ matched |

---

## Action Required Before Next Run

1. **Fix `hero_heloc_rate` and `hero_refi_rate`** in `manifest.json`: either remove them (preferred — the values they track are already covered) or update their patterns to match the actual index.html structure.

2. **Fix `masthead_source_date`** in `manifest.json` and/or the 8 affected HTML files: align the middle-dot format (either update all 8 HTML files to use `&middot;`, or update the manifest regex to accept both variants).

3. **Rerun the rate update** after fixes are applied. Rate data from today's collection is valid and ready to use; new fetches are not required if the manifest is fixed promptly (within the same week).

---

*No files were modified. No commits were made. No push occurred.*
