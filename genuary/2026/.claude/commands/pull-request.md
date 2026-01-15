---
description: Create a pull request for the current branch following project standards
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(git remote:*), Bash(gh pr create:*), Bash(which gh:*)
---

# Create Pull Request

Create a pull request for the current branch following project standards.

## Instructions

1. **Verify branch state**
   - Ensure all changes are committed
   - Confirm branch is pushed to remote
   - Check branch is not `main`

2. **Gather context**
   - Run `git log origin/main..HEAD --oneline` to see all commits
   - Run `git diff origin/main...HEAD --stat` to see changed files
   - Identify the task ID if this PR is for a task (check branch name, commits, or task files changed)

3. **Determine task association**
   - Look for task IDs in commit messages (e.g., DEPLOY-01, DESIGN-02)
   - Check if `.claude/tasks/` files were modified
   - Check if task was archived (indicates completion)

4. **Check for GitHub CLI**
   - Run `which gh` to check if `gh` is available
   - If available: use `gh pr create`
   - If not available: print the title and body for manual creation

5. **Create PR with standard format**

### If `gh` is available:

```bash
gh pr create --title "[TASK-ID] Brief description" --body "$(cat <<'EOF'
## Summary

[2-4 bullet points describing what this PR does]

## Task

Completes: [TASK-ID] ([Task Name](.claude/tasks/archive/TASK-ID-name.task.md))
Or: `.claude/tasks/TASK-ID-name.task.md` (if not archived)
Or: "No associated task"

## Changes

[List of key files/areas changed]

## Testing

- [ ] `npm run build` passes
- [ ] [Any specific verification steps from task]

## Notes

[Any additional context, decisions made, or follow-up work needed]

---
Generated with Claude Code
EOF
)"
```

### If `gh` is NOT available:

Print the PR details with **separate code blocks** for easy copying:

1. Show the comparison URL
2. Show the title in a code block
3. Show the body in a code block

Format:

```
**Create PR at:** https://github.com/<owner>/<repo>/compare/main...<branch-name>

**Title:**
```
```
[TASK-ID] Brief description
```

**Body:**
```markdown
## Summary

[2-4 bullet points]

## Task

[task info]

## Changes

[file list]

## Testing

- [ ] `npm run build` passes
- [ ] [verification steps]

## Notes

[context]

---
Generated with Claude Code
```

6. **After PR creation/display**
   - Return the PR URL (if created) or the comparison URL (if manual)
   - Note any follow-up tasks that are now unblocked

## PR Title Conventions

| Type | Format | Example |
|------|--------|---------|
| Task work | `[TASK-ID] Description` | `[DEPLOY-01] Implement Vercel deployment` |
| Feature | `feat: Description` | `feat: Add knowledge sources hub` |
| Fix | `fix: Description` | `fix: Resolve N+1 query in sources` |
| Chore | `chore: Description` | `chore: Reorganize folder structure` |
| Docs | `docs: Description` | `docs: Update CLAUDE.md` |
| Genuary Day | `feat(genuary): Day N - TITLE` | `feat(genuary): Day 12 - SHATTERED GRID` |

## Example Output (no gh)

```
**Create PR at:** https://github.com/azigler/coding-jams/compare/main...claude/deploy-local-setup-abc123

**Title:**
```
```
[DEPLOY-01] Implement Vercel deployment workflow
```

**Body:**
```markdown
## Summary

- Implement local build + Vercel deployment using Build Output API
- Add SPA fallback routing for client-side navigation
- Configure security headers and cache control
- Disable auto-deployments (manual deploys only)

## Task

Completes: DEPLOY-01 ([Vercel Setup](.claude/tasks/archive/DEPLOY-01-vercel-setup.task.md))

## Changes

- `src/scripts/prepare-vercel-output.ts` - Build Output API converter
- `scripts/deploy.sh` - Deployment script
- `public/*/vercel.json` - Site-specific configs
- `.claude/docs/DEPLOY-VERCEL.md` - Documentation

## Testing

- [ ] `npm run build` passes
- [ ] `npm run deploy:preview` succeeds
- [ ] Redirects work (`/blog` -> `/feed?type=article`)
- [ ] SPA routing works (direct URL access)

## Notes

- Unblocks: DEPLOY-02 (Automations)
- Created: DEPLOY-03 (Static Site Generation task for future SSG migration)

---
Generated with Claude Code
```
