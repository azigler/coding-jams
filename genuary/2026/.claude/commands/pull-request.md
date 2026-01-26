---
description: Create a pull request for the current branch following project standards
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(git remote:*), Bash(gh pr create:*), Bash(which gh:*), Bash(bun:*), Bash(bunx:*), Bash(lsof:*), Bash(kill:*), Bash(pkill:*), Bash(ls:*), Bash(cat:*)
---

# Create Pull Request

Create a full-service pull request for a Genuary day with media assets.

## Overview

This command creates a complete PR that includes:
1. The implementation code
2. A PNG screenshot of the artwork
3. A GIF recording of the animation
4. The social post text in the PR description
5. All files properly committed and ready for review

## Instructions

### Step 1: Verify Branch State

```bash
git status
git log origin/main..HEAD --oneline
```

Ensure:
- [ ] All changes are committed
- [ ] Branch is not `main`
- [ ] Branch name follows pattern: `feat/genuary-day-N-*`

### Step 2: Determine Day Number

Extract the day number from the branch name or recent commits:

```bash
git branch --show-current
git log --oneline -3
```

### Step 3: Install Playwright (If Needed)

Check if Playwright is installed, install if not:

```bash
# Check for playwright
ls node_modules/playwright 2>/dev/null || echo "Not installed"

# If not installed:
bun add -D playwright && bunx playwright install chromium
```

For headless servers (no display), also run:
```bash
bunx playwright install-deps chromium
```

### Step 4: Ensure Port is Free

Kill any existing dev servers:

```bash
lsof -i :3000 | grep -v PID | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
```

### Step 5: Capture Assets

Run the capture script:

```bash
bun run capture <DAY_NUMBER>
```

This will:
1. Start the dev server
2. Navigate to the day
3. Capture a PNG screenshot
4. Record and download the GIF
5. Save files to `outputs/` directory
6. Clean up the server

**Expected output files:**
- `outputs/genuary-2026-day-XX-YYYYMMDD.png`
- `outputs/genuary-2026-day-XX-YYYYMMDD.gif`

### Step 6: Verify Captures

```bash
ls -la outputs/
```

Ensure both PNG and GIF exist and have reasonable file sizes:
- PNG: typically 50KB - 500KB
- GIF: typically 1MB - 10MB

### Step 7: Get Social Post Text

Find the manifesto and extract the social post:

```bash
ls .claude/manifesto/day-<DAY>-*.md
```

Read the manifesto and copy the social post section.

### Step 8: Commit Outputs

```bash
git add outputs/
git status
```

If there are new output files:

```bash
git commit -m "chore: add Day <N> captures (PNG + GIF)

Automated capture using Playwright headless browser

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### Step 9: Push Branch

```bash
git push -u origin $(git branch --show-current)
```

### Step 10: Create PR

Use `gh pr create` with embedded media:

```bash
gh pr create --title "feat(genuary): Day <N> - <TITLE>" --body "$(cat <<'EOF'
## Summary

Day <N> implementation for Genuary 2026.

**Prompt:** "<PROMPT_TEXT>"

## Preview

### Screenshot
![Day <N> Screenshot](outputs/genuary-2026-day-<NN>-<TIMESTAMP>.png)

### Animation
![Day <N> Animation](outputs/genuary-2026-day-<NN>-<TIMESTAMP>.gif)

## Social Post

```
<PASTE SOCIAL POST TEXT HERE - NO MARKDOWN FORMATTING>
```

## Implementation Details

- **Medium:** <p5.js / WebGL / Three.js / etc.>
- **Key techniques:** <Brief description>
- **Manifesto:** `.claude/manifesto/day-<N>-<title>.md`

## Checklist

- [ ] `bun run build` passes
- [ ] PNG capture looks correct
- [ ] GIF shows the full animation
- [ ] Social post is ready to copy-paste to LinkedIn

---
Generated with Claude Code
EOF
)"
```

### Step 11: Return PR URL

After creating the PR, output the URL so the user can review it.

## Troubleshooting

### Playwright Installation Fails

On headless servers, you may need system dependencies:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2
```

Or use the Playwright helper:
```bash
bunx playwright install-deps chromium
```

### WebGL Not Working

The capture script uses SwiftShader for software WebGL rendering. If you see WebGL errors:

1. Ensure Chromium is fully installed: `bunx playwright install chromium`
2. Check the `--use-gl=swiftshader` flag is being passed

### GIF Recording Times Out

GIF recording takes 10-15 seconds for capture plus encoding time. If it times out:

1. Check if the day has recording enabled (`config.recording.enabled`)
2. Increase `GIF_TOTAL_TIMEOUT_MS` in `scripts/capture.ts` if needed
3. Try running in headed mode for debugging

### Port 3000 Already in Use

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or kill all node/bun processes
pkill -f "bun|node"
```

## PR Title Conventions

| Type | Format | Example |
|------|--------|---------|
| Genuary Day | `feat(genuary): Day N - TITLE` | `feat(genuary): Day 12 - SHATTERED GRID` |
| Fix | `fix(genuary): Description` | `fix(genuary): Resolve WebGL crash on Day 15` |
| Docs | `docs(genuary): Description` | `docs(genuary): Update Day 8 manifesto` |

## Example Complete Workflow

```bash
# 1. Ensure everything is committed
git status

# 2. Install Playwright if needed
bun add -D playwright && bunx playwright install chromium

# 3. Kill any stale servers
pkill -f "bun run dev" || true

# 4. Capture assets for Day 26
bun run capture 26

# 5. Verify outputs
ls -la outputs/

# 6. Commit the outputs
git add outputs/
git commit -m "chore: add Day 26 captures (PNG + GIF)

Automated capture using Playwright headless browser

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 7. Push and create PR
git push -u origin $(git branch --show-current)
gh pr create --title "feat(genuary): Day 26 - ZONING" --body "..."
```

## Notes

- The capture script handles dev server lifecycle automatically
- PNG is captured directly from the canvas element for best quality
- GIF is captured by clicking the "Record GIF" button and intercepting the download
- Both files use timestamps to avoid conflicts
- Always verify captures before creating the PR
