# Handoff

Last updated: 2026-08-26 · Last commit: `35a10d3`

## State

Working tree is clean (aside from unrelated `ruflo`/`claude-flow` scaffolding files that aren't part of this project), `main` is up to date with `origin/main`. All code changes below are committed and pushed. One production **data** change (Supabase) is also live and is not represented in git history.

## What happened this session

Debugged and fixed the email automation drip sequence, which had silently stopped delivering `followup_4` to a whole branch of leads.

1. **Root cause investigation** (`ca3b234` → `35a10d3`): added temporary `[DIAG]` logging to `app/api/funnel/cron/sequence/route.ts` to trace why 8 leads were stuck at a "wait 7 days" node despite the wait being satisfied for weeks. Vercel runtime logs (`get_runtime_logs`) confirmed the walker correctly detected `ready=true` on the wait node but `findNextNode()` returned `null` — the node had no outgoing edge.
2. **Actual root cause**: not a code bug. The active flow's `flow_json` (in `automation_flows`, id `3ff0fc10-5f7d-4696-a605-92084c8748b4`) had a broken graph — the "not yet engaged" branch (`condition node 12 → "no" → wait node 14`) dead-ended. Node 14 had no edge to node 15 (`send followup_4`). Leads on that branch got `followup_1` and `followup_2` only, then silently stopped forever. The "engaged" branch (nodes 6→7→8→9) was fine.
3. **Fix applied directly in Supabase** (not a migration — a one-off data patch): appended `{"id":"e15","source":"14","target":"15","sourceHandle":null}` to `flow_json.edges` via SQL. Verified the edge landed. This is **not tracked in git** — the flow graph lives entirely in the `automation_flows` table.
4. **Cleanup** (`35a10d3`): removed all temporary `[DIAG]` console.log lines from the cron route. Kept the two error-handling checks the debug commit added on the `lead_flow_state` upserts (previously silently discarded), now logged via `console.error`.
5. **Separately discovered gap while verifying the fix**: the nurture email series (the drip that continues after a lead finishes the main flow) had **never sent a single email**, ever. All 9 existing `nurture_templates` rows were tagged `segments: ["pro"]` only — every other segment (`family`, `ofw`, `entrepreneur`, `business`, `hnw`) had zero matching content, so the nurture lookup always came back empty for them. This is a content gap, not a code bug — the segment-matching logic in the cron (`segs.length === 0 || segs.includes(lead.segment)`) works correctly.
6. **Fixed via the admin UI**: Jojo used the existing "AI Series" generator (Admin → Email Automation → Nurture Series) to generate a 9-email series for each of the 5 missing segments. Verified in Supabase afterward: all 6 segments now have 9 templates each, in contiguous non-overlapping `position` ranges (pro 1–9, business 10–18, family 19–27, ofw 28–36, entrepreneur 37–45, hnw 46–54), and no row has an empty subject/heading/cta_text/paragraphs.

## Known follow-ups (flagged, not fixed)

- **Carried over from 2026-08-14, still open**: Admin light-mode `<input>`/`<select>`/`<textarea>` borders are too faint (`border-white/10` ≈ 1.3:1 on white, needs 3:1) because a generic two-class utility rule beats the more-specific-looking `html.light input {...}` override on CSS specificity. See `memory.md` → "Known unresolved issue."
- **New**: the Flow Builder has no validation that catches dead-end nodes (a node with no outgoing edge that isn't meant to be terminal). This exact failure mode — a branch silently stops forever — could recur if a flow is hand-edited or AI-generated again without checking every node has an edge out (except intentionally terminal `send_email` nodes at the end of a path). Worth adding a "does every non-terminal node have an outgoing edge" check to the flow save/activate path if this becomes a recurring problem.
- **New**: the 5 newly generated nurture series (family/ofw/entrepreneur/business/hnw) have not been manually read through for tone yet, especially `hnw` which has strict voice constraints (no exclamation points, estate-liquidity-only framing) baked into the AI prompt. Recommended a skim in the admin editor before assuming they're publish-ready as-is.

## If you're picking this up next

- The 8 leads that were stuck (all segment `family`) will pick up automatically on the next 8 PM PHT cron run — no manual re-enrollment needed. They'll get `followup_4`, then roll into the `family` nurture series now that it exists.
- If leads seem stuck in the flow again in the future: check Vercel runtime logs for the cron route first (`get_runtime_logs`, filter by `/api/funnel/cron/sequence`), then inspect `automation_flows.flow_json` directly in Supabase — don't assume it's a code bug, the graph itself can be broken.
- `npm run dev` locally still only works for pages that don't need real Supabase/OpenAI/Resend/admin-auth — see `CLAUDE.md` → Development workflow.
