# Ludum Dare 59 — rules summary

Source of truth: https://ldjam.com/events/ludum-dare/59. This is a local cache,
confirm against the event page before submission.

## Theme

**Signal** — confirmed via `api.ldjam.com/vx/node2/get/424249` (`event-theme`).

## Categories (pick one at submission)

| Category | Duration | AI assistance | Assets |
|---|---|---|---|
| **Compo** | 48h | **Not allowed** — everything from scratch, solo | All assets made during the jam |
| **Jam** | 72h | Allowed (including Claude) | Any you have rights to, pre-made OK |
| **Extra** | Flexible | Allowed | For entries that bend other rules |

We are entering **Jam** (72h, AI-assisted is allowed).

## Submission requirements

- A playable build accessible via URL (web is easiest — static hosting is fine)
- Source code available (link to the repo)
- A short writeup on the entry page
- At least one screenshot (used as the thumbnail)
- Optional but strongly encouraged: a short gameplay video

## Grades (each on a 1–5 scale, judged during voting period)

- Overall — the mandatory one
- Fun, Innovation, Theme — key taste metrics
- Graphics, Audio, Humor, Mood — optional; only rated if the entry declares them

Voting opens after submission closes and runs for ~3 weeks.

## Useful endpoints (see `memory/reference_ldjam_api.md`)

- `walk.sh events/ludum-dare/59` → node id
- `jam-state.sh` → live event meta
- `get-node.sh <id>` → any node

## Re-check before submission

- [ ] `jam-state.sh` shows `finished: 0` (still submitting) vs `1` (closed)
- [ ] `event-end` timestamp has not passed
- [ ] Category confirmed on the submit form
- [ ] Repo is public
- [ ] Build URL loads cleanly in an incognito window (no login walls)
