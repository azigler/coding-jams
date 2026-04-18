# Devlog

Micro-blog posts written during LD59. Each post is a short snapshot — what
changed, what broke, what we learned — to accompany the jam entry on
[ldjam.com/users/zigtalk](https://ldjam.com/users/zigtalk).

## File naming

`YYYY-MM-DD-HHmm-slug.md` — timestamp keeps them sorted, slug makes them
readable.

## Front matter

```markdown
---
title: Signals at the edge of dark
subtitle: day 0 — concept lock
tags: [devlog, ld59, signal]
---

Body in markdown. Keep it short. Follow `/zig-voice` for tone.
```

## Publishing

See `.claude/skills/ldjam/SKILL.md` for the `publish-post.sh` flow.

## ⚠ Open loop — publish-post is dry-run only

`publish-post.sh` is currently a **scaffold**. It can parse front matter and
preview payloads, but it won't actually hit `api.ldjam.com/vx/node/add` yet —
that endpoint's payload shape is not publicly documented and we'd rather not
guess blind.

**To close this loop** (owned by Zig, tracked as bead `bd-1l9`):

1. Log in to ldjam.com as `zigtalk` in a browser.
2. Open devtools → Network → filter `api.ldjam.com`.
3. Manually publish ONE short test post on your profile.
4. Copy the `POST /vx/node/add` request (headers + body) into
   `.claude/analysis/ldjam-post-request.txt`.
5. Come back and tell Claude — Claude will wire the script, verify with
   `--dry-run`, and publish for real from then on.

Until that's done, keep writing drafts here; don't try to publish.
