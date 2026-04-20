# Rate-update agent

Weekly automation that keeps equitywiser.com's rate data accurate.

## What's in this folder

| File | Purpose |
|---|---|
| [`runbook.md`](runbook.md) | Procedure the scheduled agent follows each run. Read this to understand what it does. |
| [`manifest.json`](manifest.json) | Canonical inventory: current rate values, derived calculations, and every location on the site that contains a rate-dependent number. Machine-readable; agent updates it after each run. |
| `reports/` | One Markdown report per run (normal + any halts or audit triggers). Owner reviews at leisure. |

## Cadence

Thursday 15:00 PT, weekly. Freddie Mac PMMS drops Thursday mornings; Bankrate propagates by early afternoon; Fed H.15 is final by Friday. Thursday 15:00 PT gives a full day of settling without delaying the refresh.

## Scope boundaries

**Normal run (rate change ≤ 24 bp):** agent touches only the locations enumerated in `manifest.json` — the masthead rate bar and the homepage hero card. Bumps `dateModified` and sitemap `lastmod` on affected pages. Pushes direct to `main`.

**Expanded scan (25–49 bp):** normal run + greps article bodies for literal old-rate references and writes a candidate-list report. Human reviews; auto-edits do NOT happen on article prose.

**Full audit (≥ 50 bp):** agent does NOT push updates. Writes a report describing every location that would change and every article with stale references. Halts for a human content pass.

## Failure modes and what they mean

- **Verification failure** — two sources disagree by > 10 bp. Halt, report. Usually means one source is stale; human triages.
- **Regex miss** — the site's HTML changed structure and a manifest regex no longer matches. Halt, report. Fix the manifest pattern; rerun.
- **JSON-LD validation fail** — a schema block broke after edits. Revert, report. Usually a malformed replacement; fix the manifest regex.
- **Git push fail** — repository state unexpected. Halt, report.

## Manually triggering a run

The agent is designed for autonomous operation but can be invoked by:

```
# From a Claude Code session in this repo:
"Read .claude/rate-agent/runbook.md and execute a rate update."
```

Or via the remote-agent schedule (see `schedule` skill in Claude Code).

## Adding or removing a tracked location

When new content with rate-dependent numbers is added to the site, update `manifest.json`'s `locations` array with:
- `id` (unique slug)
- `description` (human-readable)
- `scope` (which files)
- `find_regex` (how to locate and extract the current value)
- `depends_on` (which rate(s) this value is a function of)

If the new value is computed from rates, also add a `derived` entry with `formula` and current value.

Do NOT add a location without verifying the regex matches exactly once in every file in scope. A bad regex is the most common source of silent skip-failures.

## The heloc-rates-2026.html exception

This article is explicitly OUT of scope for the agent. It's the current-rates article — its prose is densely rate-dependent and is written to reflect a specific reporting moment (Fed forecasts, YoY comparisons, etc.). When rates move materially, this article should be updated by a human author — the agent would produce stilted prose if it tried.

The agent WILL still update the masthead rate bar at the top of this article (since that's a site-wide component), and will bump its `dateModified` if the masthead changed.
