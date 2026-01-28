# Multi-Year Support for Genuary

This document explains how to use this Genuary project for multiple years
(2026, 2027, 2028, etc.) without major reconfiguration.

## Overview

The Genuary project uses a **directory-per-year** approach:

```
coding-jams/
└── genuary/
    ├── 2026/    # First year
    ├── 2027/    # Second year (copy of 2026, bootstrapped)
    └── 2028/    # Third year, etc.
```

This approach was chosen because:
- Each year's art is preserved as-is
- No risk of overwriting previous years
- Easy to compare approaches between years
- Git history stays clean per year

## Year Detection

Scripts automatically detect the year from:

1. **`GENUARY_YEAR` environment variable** (highest priority)
2. **Directory path** (e.g., `/path/to/genuary/2027`)
3. **Current date** (if running in January)

You can explicitly set the year:

```bash
GENUARY_YEAR=2027 ./scripts/daily-agent.sh
```

## Setting Up a New Year

### Option 1: Bootstrap Script (Recommended)

Run the bootstrap script on January 1st (or before):

```bash
# Check what needs to be done
./scripts/bootstrap-year.sh --check

# Bootstrap for the current year
./scripts/bootstrap-year.sh

# Or specify a year
./scripts/bootstrap-year.sh 2027
```

The bootstrap script:
- Creates `src/days/` placeholders (01.ts - 31.ts)
- Updates `package.json` name
- Updates `vite.config.ts` base path
- Updates `index.html` title
- Creates template `prompts.md` (you add the actual prompts)

### Option 2: Manual Setup

1. **Copy the directory:**
   ```bash
   cp -r genuary/2026 genuary/2027
   cd genuary/2027
   ```

2. **Update year references:**
   ```bash
   # package.json
   sed -i 's/genuary-2026/genuary-2027/g' package.json

   # vite.config.ts
   sed -i 's/genuary-2026/genuary-2027/g' vite.config.ts

   # index.html
   sed -i 's/Genuary 2026/Genuary 2027/g' index.html
   ```

3. **Clear day implementations:**
   ```bash
   # Remove old day files, keep template
   rm -f src/days/*.ts
   ./scripts/bootstrap-year.sh 2027  # Creates placeholders
   ```

4. **Update prompts.md:**
   - Visit https://genuary.art/prompts (usually available late December)
   - Copy the new year's prompts into `prompts.md`

5. **Update manifestos (optional):**
   ```bash
   # Archive last year's manifestos
   mv .claude/manifesto/*.md .claude/manifesto/archive-2026/
   ```

## Systemd Timers

The systemd timers use the pattern `*-01-*` which means:
- `*` = any year
- `01` = January only
- `*` = any day

**Timer files don't need updates between years.**

Only update the **service files** to point to the new year's directory:

```bash
# Edit ~/.config/systemd/user/genuary-daily-agent.service
# Change: /genuary/2026/ → /genuary/2027/

systemctl --user daemon-reload
```

## Directory Structure Explanation

| Approach | Pros | Cons |
|----------|------|------|
| **Separate directories** (chosen) | Clear separation, preserved history, easy comparison | More disk space, paths change yearly |
| Symlink `genuary/current/` | Stable paths | Risk of overwriting, unclear which year |
| Single directory, year config | Simple structure | Complex state management, risky |

We chose separate directories because Genuary art is a snapshot in time.
Each year's creations should be preserved exactly as they were made.

## Key Files That Reference Year

These files have year-specific content and may need updates:

| File | What to Update |
|------|----------------|
| `package.json` | `name` field |
| `vite.config.ts` | `base` path |
| `index.html` | Title and header |
| `prompts.md` | The actual prompts |
| `CLAUDE.md` | Year references in examples |
| `src/days/*.ts` | Recording filenames (per-day) |
| `src/index.ts` | Filename generation |
| `src/utils/controls.ts` | localStorage key prefix |

The `bootstrap-year.sh` script handles most of these automatically.

## Year Configuration Library

The scripts use a shared library at `scripts/lib/year-config.sh`:

```bash
# In your script:
source "$(dirname "$0")/lib/year-config.sh"

echo "Year: $GENUARY_YEAR"
echo "Project: $GENUARY_PROJECT_NAME"
echo "File prefix: $GENUARY_FILE_PREFIX"

# Generate filename:
filename=$(genuary_filename 15 gif)
# Output: genuary-2027-day-15-20270115-123456.gif
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GENUARY_YEAR` | Override detected year | `2027` |
| `GENUARY_REPO_PATH` | Path to year directory | `/home/ubuntu/coding-jams/genuary/2027` |

## FAQ

### Q: Do I need to update the timers each year?
**A:** No, the timers use `*-01-*` which works for any year. Only update the
service files to point to the new year's directory.

### Q: What if the prompts aren't published yet?
**A:** Run `bootstrap-year.sh` anyway. It creates placeholder day files. You
can update `prompts.md` once the official prompts are published.

### Q: Can I run both years simultaneously?
**A:** Yes, each year is independent. They use different ports if you
configure them, or run one at a time with `bun run dev`.

### Q: Should I delete old years?
**A:** No! The art is part of the historical record. Disk space is cheap.

### Q: How do I compare my work between years?
**A:** Open both directories, run `bun run dev` with different ports, and
compare side by side. Or use git diffs.
