---
description: Authenticate with ldjam.com, fetch jam state, draft/publish devlog posts via the api.ldjam.com JSON API
---

# ldjam

Skill for interacting with [ldjam.com](https://ldjam.com) during a Ludum Dare jam.
ldjam.com is a thin SPA shell — the public HTML is ~2KB and all data lives on
`api.ldjam.com`. **Never WebFetch ldjam.com** — it returns an empty shell. Use
the scripts in this skill or hit `api.ldjam.com` directly.

## When to use this skill

- Before pushing a devlog: verify the session is still alive
- Fetching live jam metadata (theme, deadlines, grade config)
- Looking at another user's entries for inspiration
- Drafting + publishing a devlog post as a micro-blog entry under the user profile
- Uploading screenshots for use in devlog posts

## Session management

Credentials live in `.claude/.ldjam-credentials` (gitignored — JSON: `{"login":"…","pw":"…"}`).
Session cookie cached in `.claude/.ldjam-session` (gitignored — raw SIDS value).
Sessions last 7 days. If the session expires, `whoami.sh` fails; just re-run `login.sh`.

## Scripts

All scripts live in `.claude/skills/ldjam/scripts/` and are idempotent.

| Script | Purpose |
|---|---|
| `login.sh` | Authenticate, write `.claude/.ldjam-session` |
| `whoami.sh` | Print cached session's user id + slug; non-zero exit if invalid |
| `get-node.sh <id>` | Fetch a node by id, pretty-print JSON |
| `walk.sh <slug-path>` | Resolve a slug path (e.g. `events/ludum-dare/59`) to a node id |
| `jam-state.sh` | Dump LD59 event metadata (theme, deadlines, grades) |
| `publish-post.sh <draft.md>` | Publish a devlog markdown file as a post under the user profile |

## Typical flow

```bash
# One-time (or whenever the session expires)
.claude/skills/ldjam/scripts/login.sh

# Check status
.claude/skills/ldjam/scripts/whoami.sh
.claude/skills/ldjam/scripts/jam-state.sh

# Publish a devlog
.claude/skills/ldjam/scripts/publish-post.sh devlog/2026-04-18-1830-kickoff.md
```

## Writing devlog posts

Drafts live in `devlog/YYYY-MM-DD-HHmm-slug.md` with this front matter:

```markdown
---
title: Signals at the edge of dark
subtitle: day 0 — concept lock
tags: [devlog, ld59, signal]
---

body in markdown...
```

Follow the `/zig-voice` skill for tone. Short, specific, no generic hype.
`publish-post.sh` strips the front matter and POSTs the body + title.

## API notes (for when the scripts are not enough)

See `memory/reference_ldjam_api.md` for the authentication shape. Key endpoints:

- `POST /vx/user/login` with `login=<email>&pw=<password>` — returns `{id, mail}` + `SIDS` cookie
- `GET /vx/node2/get/<id>` — fetch any node
- `GET /vx/node2/walk/1/<slug-path>` — resolve a path to an id
- `POST /vx/node/add` — create a node (post, game, etc.) — requires auth
- `POST /vx/node/update/<id>` — edit a node — requires auth

When experimenting with new endpoints, log the response to `.claude/analysis/`
(gitignored) before wiring it into a script.
