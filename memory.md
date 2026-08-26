# Project memory

Durable decisions and reference values from past work that aren't obvious from reading the code, so they don't have to be re-derived. Append to this over time; don't let it go stale — if something here turns out wrong, fix it in place rather than leaving a contradiction. For comprehensive architecture/conventions, see `CLAUDE.md` — this file is for the "why," not the "what."

## WCAG contrast reference (navy `#0F1F3D` / white text pairs)

The brand palette (`--navy: #0F1F3D`, admin light-mode background effectively white/`#f7fafc`) has different amounts of contrast headroom depending on which direction you're compositing:

- **Navy text on white/near-white** (admin light mode, `html.light` overrides in `app/globals.css`): the WCAG AA 4.5:1 floor for normal text sits at **~0.60–0.61 alpha**. Below that, no amount of tuning keeps normal-size text compliant — there is only room for ~2 visually-distinct compliant tiers above the floor (`/80` → 9.3:1, `/70` → 6.6:1) before hitting the wall. `/60` down to `/20` in light mode all share one floor color (`rgba(15,31,61,0.62)`, 4.7:1) as a result — see the comment block in `globals.css` above that rule.
- **White text on navy** (public funnel, always dark, no override table — literal Tailwind opacity classes): the same 4.5:1 floor sits at **~0.47–0.48 alpha**, much more forgiving since navy is far darker than white. `/50` (5.0:1), `/60` (6.6:1), `/70` (8.7:1) are all safely compliant and stay visually distinct from each other, so opacity-based emphasis scales (like the HNW comparison table) can keep 3 real tiers instead of collapsing to 1.

Rule of thumb for future additions: **on the admin's light background, don't use anything below `/70` for real text content; on the dark funnel, don't use anything below `/50`.** Both floors were derived by relative-luminance calculation (WCAG formula), not eyeballed — see commits `2c18cff` and `bd59626` for the full per-tier ratio tables if the palette ever changes and this needs re-deriving.

## Established UI conventions (added 2026-08, keep consistent)

- **Press feedback**: interactive CTAs use `active:scale-[0.98]` + `transform` added to the `transition-[...]` property list (never bare `transition-colors` per the existing `CLAUDE.md` rule — always name properties explicitly).
- **Modals**: use `components/ui/Modal.tsx` (`ModalBackdrop` + `ModalPanel`, wrapped in `AnimatePresence` at the call site) rather than hand-rolling a `fixed inset-0` div. Panel enters from `scale-0.97`/`opacity-0`/`y:8`, never from `scale-0` (nothing in the real world pops in from nothing). Ease curve: `[0.23, 1, 0.32, 1]`.
- **Progress bars**: animate `transform: scaleX()` from a fixed-width track (`origin-left`), not `width` — `width` triggers layout, `transform` doesn't.
- **Shared decorative chrome** (grid overlay, header, footer): lives in `components/landing/`, imported by both the landing page and the segment page template so there's exactly one copy. If you add another piece of chrome shared by both, put it there too rather than inlining it twice.

## Known unresolved issue

Admin light-mode `<input>`/`<select>`/`<textarea>` borders render far too faint (~1.3:1, need 3:1) because the generic `.border-white\/10` light-mode override (two class selectors) beats the more-specific-looking `html.light input {...}` rule (one class + one type selector) in CSS specificity, regardless of source order. Flagged in `handoff.md`, not yet fixed.

## Automation flow graphs are data, not code — and unvalidated

`automation_flows.flow_json` (nodes + edges) is hand-built via the Flow Builder canvas or AI-generated, then saved as-is to Supabase. **Nothing validates that every non-terminal node has an outgoing edge.** A dead-end node (e.g. a `wait` node with no edge out) doesn't error — the cron walker (`app/api/funnel/cron/sequence/route.ts`) just detects the wait is satisfied, looks for a next node, finds none, and silently stops advancing that lead forever. No error, no log, cron returns 200 every day. This exact bug shipped once already (2026-08 — a `condition` node's "no" branch dead-ended into a `wait` node with no edge to the final `send_email`, so unengaged leads got 2 of 4 followups and then nothing). If leads seem stuck in a flow again: don't assume it's a code bug — pull `flow_json.edges` directly from Supabase and check every node id appears as a `source` unless it's meant to be a true terminal (last email in a branch).

## Debugging the cron sequence walker: use Vercel runtime logs, not local simulation

Local simulation of the walker logic against copied production data can look correct while the deployed function still fails, because the actual state (flow graph, `lead_flow_state` rows) only exists in production Supabase. The effective loop for this class of bug: add scoped `console.log` at each decision point in the walker → let it run on the daily cron → pull with the Vercel MCP `get_runtime_logs` tool (`projectId` for this repo is `prj_SU7v2ytAuy9IMmqyHKlWoLeJGNoH`, `teamId` is `zerotherm27-8336s-projects`), filtering by the log text — then cross-reference against the flow's actual `edges` array read straight from Supabase (`execute_sql` against project `xcifmbfxatkunsjoozyv` — direct read access works fine despite older guidance that it's permission-denied; only confirm before running any `UPDATE`/DDL). Revert the temporary logging once root cause is confirmed; keep any error-handling it incidentally added (e.g. checking upsert results that were previously discarded).

## Nurture template segment targeting

`nurture_templates.segments` must contain the **raw `FunnelSegment` value** (`pro`, `family`, `ofw`, `entrepreneur`, `business`, `hnw`), never a display label — the admin UI's "Young Pro" etc. labels (`NurtureSeriesTab.tsx` → `SEGMENTS` const) are cosmetic only. An empty `segments` array means "all segments"; a non-empty array is an exact-match allowlist, not a superset. **`position` is one counter shared globally across every segment's templates**, not per-segment — the "AI Series" generator computes `startPosition` as `(last template's position) + 1` regardless of which segment you're generating for, so segments end up in contiguous non-overlapping blocks (as of 2026-08-26: pro 1–9, business 10–18, family 19–27, ofw 28–36, entrepreneur 37–45, hnw 46–54). The matching lookup filters by segment first then takes the lowest remaining position, so this global numbering doesn't break anything — just don't expect "position 1" to mean the same thing across segments.

## Product/business context worth remembering

- Real end-to-end testing of the funnel (lead capture → email) has to happen against **production** (`https://safetymargin.app`), not locally — `.env.local` is all placeholder secrets by design. Use a unique `+alias` Gmail and mobile number per test (dedup matches email first, then mobile), and mark test leads `closed_lost` afterward or the daily 8 PM PHT cron will keep drip-emailing them.
- Resend's **open tracking** must be toggled on per-domain in the Resend dashboard (Domains → `safetymargin.app`) for `email.opened` webhook events to fire at all — this is separate from the webhook's event subscription checkboxes, and being off was the root cause of a "why don't I ever see the green 'Opened' badge" question earlier. If that question comes up again, check this first.
