# <jam-name>

<One sentence: what this jam is, who hosts it, what gets submitted.>

## The clock

- **Deadline:** <date + time + timezone — the single most important fact here>
- **Time-box:** <hours/days available>
- **Submission target:** <platform / form / repo URL>

## Deliverables

| Artifact | Required? | Where it goes |
|---|---|---|
| Code repo | <yes/no> | <public/judging repo URL> |
| Demo recording | <yes/no> | <upload target> |
| Writeup / paper | <yes/no> | <format + target> |
| Submission form | yes | <URL> |

## Conventions (inherited from the umbrella)

- `.beads/` for task tracking (`br init` with prefix `<jam-prefix>`)
- `refs/` at project root for jam rules, host docs, judging criteria
- `refs/session-handoff.md` written by /offboard each session
- Gitmoji + `Bead:` trailer on commits
- Worktree subagents for parallel work (orchestrator pattern)
- **Submission > polish.** A messy submission beats a clean unsubmitted
  project every time (see `../.claude/practices.md`).

## Jam-setup checklist (create these as beads, then delete this section)

- [ ] `br init` + first bead: "read the rules" (rules go in `refs/`)
- [ ] Deadline recorded above AND as a P1 bead with the date in the title
- [ ] Submission mechanics tested EARLY (account, form access, upload limits)
- [ ] Scope spike: smallest submittable thing, beaded as the first milestone
- [ ] POSTMORTEM.md placeholder committed (fill after the jam)
