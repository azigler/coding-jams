# AdventJS 2025 Harness

An automated harness for solving [AdventJS 2025](https://adventjs.dev/) challenges in JavaScript, TypeScript, and Python.

## Features

- 🚀 **Fetch Challenges** - Download challenge descriptions and starter code
- 📤 **Submit Solutions** - Submit to AdventJS API with rate limiting
- ⭐ **Track Progress** - Monitor completion across all languages
- 🏆 **Achievement Tracking** - Track unlocked achievements
- 🔄 **Auto Mode** - Submit all unsolved languages for a challenge
- 📊 **Code Quality Feedback** - Get detailed feedback on submissions
- ✨ **Quality Tracking** - Store and track 5/5 quality scores in cache

## Setup

### 1. Install Deno

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Or use your package manager
brew install deno  # macOS
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your AdventJS session token:

1. Go to [adventjs.dev](https://adventjs.dev/) and log in
2. Open Developer Tools (F12) → Application → Cookies
3. Find `__Secure-next-auth.session-token`
4. Copy the value to `ADVENTJS_SESSION_TOKEN` in `.env`

## Usage

### Quick Start

```bash
# Fetch a challenge
deno task fetch 1

# Submit JavaScript solution
deno task submit 1 js

# Submit TypeScript solution
deno task submit 1 ts

# Submit Python solution
deno task submit 1 py

# Check your progress
deno task status
```

### All Commands

| Command | Description |
|---------|-------------|
| `deno task fetch <id>` | Fetch challenge and create files |
| `deno task submit <id> <lang>` | Submit solution (js/ts/py) |
| `deno task resubmit <id> <lang>` | Force resubmit to improve quality score |
| `deno task test <id>` | Run local tests |
| `deno task auto <id>` | Submit all unsolved languages |
| `deno task status` | Show completion status |
| `deno task improve-all` | List all solutions needing improvement |
| `deno task improve <id> <lang>` | Get detailed improvement suggestions |

### Direct Harness Usage

```bash
# Full command format
deno run --allow-read --allow-write --allow-net --allow-env harness.ts [options]

# Options
--fetch <id>       Fetch challenge
--submit <id>      Submit solution
--lang <lang>      Language: js/ts/py
--test <id>        Run local tests
--auto <id>        Auto-solve challenge
--status           Show status
--help             Show help
```

## Project Structure

```
adventjs/2025/
├── harness.ts          # Main automation harness
├── BEST_PRACTICES.md   # Guidelines for solving
├── PROMPT.md           # Auto Mode flight plan
├── README.md           # This file
├── .env                # Session configuration (gitignored)
├── .env.example        # Example configuration
├── .cache.json         # Progress cache (gitignored)
├── deno.json           # Deno configuration
├── package.json        # npm package info
└── 01/                 # Challenge 1
    ├── challenge.html  # Problem description
    ├── examples.html   # Examples section
    ├── log.md          # Solution log
    ├── test.ts         # Local tests
    ├── solution.js     # JavaScript solution
    ├── solution.ts     # TypeScript solution
    └── solution.py     # Python solution
```

## Workflow

### Solving a Challenge

1. **Fetch** - `deno task fetch 3`
2. **Read** - Open `03/challenge.html` and `03/examples.html`
3. **Implement** - Write solution in `03/solution.js`
4. **Test** - Update and run `03/test.ts`
5. **Submit** - `deno task submit 3 js`
6. **Repeat** - Port to TypeScript and Python

### Auto Mode (for Cursor)

Follow the instructions in `PROMPT.md` for automated solving with Cursor's Auto Mode.

## Rate Limiting

The harness automatically enforces rate limits:

- Default: 60 seconds between submissions
- Includes randomized jitter (±10%) to avoid patterns
- Configurable via `RATE_LIMIT_MS` in `.env`

## Achievements

AdventJS tracks achievements for completing challenges:

| Achievement | Requirement |
|-------------|-------------|
| `elfo-del-dom` | Complete first challenge |
| `santa-script` | Complete challenge in TypeScript |
| `piton-festivo` | Complete challenge in Python |
| `rey-de-la-nieve-multilingue` | Complete challenge in all languages |
| `primer-trineo-estelar` | Complete 5 challenges |
| `constelacion-navidena` | Complete 10 challenges |
| `arbol-navidad-estelar` | Complete 15 challenges |
| `santa-supremo` | Complete all 24 challenges |

## Tips

1. **Start with JavaScript** - It's the most forgiving language
2. **Test locally first** - Don't use submission as your test loop
3. **Read examples carefully** - They reveal edge cases
4. **Always aim for 5/5 quality** - See "Code Quality" section below
5. **Document your approach** - Update `log.md` for each challenge

## Code Quality

AdventJS scores your code on quality (1-5 scale). **We always aim for 5/5.**

### How It Works

After each submission, the harness:

1. Shows your quality score and breakdown
2. If <5/5, displays weaknesses and action items
3. Stores feedback in `.cache.json` for reference

### Getting 5/5

If your score is <5/5:

1. Run `deno task improve <id> <lang>` for detailed suggestions
2. Read the **Weaknesses** and **Matched Patterns** shown
3. Apply the refactoring patterns suggested
4. Resubmit with `deno task resubmit <id> <lang>`

### Improvement Workflow

```bash
# List all solutions needing improvement
deno task improve-all

# Get detailed suggestions for a specific solution
deno task improve 12 js

# After making changes, resubmit
deno task resubmit 12 js
```

The improve command provides:

- Current score breakdown (correctness, complexity, style, etc.)
- Matched refactoring patterns with code examples
- Complexity reduction checklist

### Common Patterns

| Issue | Pattern | Example |
|-------|---------|---------|
| Nested conditionals | Extract helper function | `const inBounds = (x,y) => ...` |
| If-else chains | Use lookup tables | `const moves = { U: [0,-1], ... }` |
| Complex returns | Ternary chains or Math.sign | `return a <= 0 ? 2 : b <= 0 ? 1 : 0` |
| Imperative loops | Functional methods | `.filter().map().reduce()` |

### Improvement Tracking

The harness tracks improvement attempts in `.cache.json`:

```bash
# View improvement history for a challenge
cat .cache.json | jq '.challenges["12"].improvementAttempts'
```

This prevents infinite loops and helps identify solutions that may have inherent complexity.

## Authentication

### Session Token

The harness requires only one token: `__Secure-next-auth.session-token`

This is a JWT from NextAuth that authenticates your session. It typically expires after **days to weeks** of inactivity.

### Getting Your Token

1. Open [adventjs.dev](https://adventjs.dev/) in your browser
2. Log in with GitHub (if not already)
3. Open Developer Tools (F12 or Cmd+Option+I)
4. Go to **Application** → **Cookies** → **adventjs.dev**
5. Find `__Secure-next-auth.session-token`
6. Copy the **Value** to your `.env` file

### When Tokens Expire

**Symptoms:**

- Empty responses from API
- Submissions fail silently
- "Unauthorized" errors

**Solution:** Get a fresh token from your browser (steps above)

> **Note:** OAuth tokens cannot be programmatically refreshed without user login. The harness will detect auth failures and provide clear instructions

## Troubleshooting

### Session Expired

Symptoms: Authentication errors on submission

Solution: Get fresh cookies from browser and update `.env`

### Build ID Changed

Symptoms: Fetch commands fail

Solution: The harness auto-refreshes the build ID. If persistent, check if adventjs.dev is accessible.

### Tests Pass Locally but Fail on Submit

Common causes:

- Edge cases not covered in examples
- Empty input handling
- Type coercion issues
- Very large/small numbers

## Contributing

This harness was built for learning and personal use. Feel free to adapt it for your own AdventJS solving!

## License

MIT
