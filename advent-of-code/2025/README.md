# Advent of Code Harness

An automated harness for running Advent of Code solutions, submitting answers, and tracking progress.

## Features

- 🚀 **Run solutions** - Execute TypeScript solutions automatically
- 📤 **Submit answers** - Submit to Advent of Code API with rate limiting
- ⭐ **Track stars** - Automatically skip completed days/parts
- 🔄 **Auto mode** - Detect and submit both parts automatically
- 📊 **Answer parsing** - Extracts Part 1/Part 2 from console output

## Setup

1. Install Deno (if not already installed):

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Or use your package manager
brew install deno  # macOS
```

1. Create a `.env` file from the example:

```bash
cp .env.example .env
```

1. Edit `.env` and add your session cookie:
   - Get your session cookie from your browser when logged into adventofcode.com
   - Look for the "session" cookie in your browser's developer tools

## Usage

### Basic Commands

```bash
# Print answers for day 1, part 1
deno task day 1 --part 1

# Submit answer for day 1, part 2
deno task day 1 --part 2 --submit

# Auto-detect and submit both parts (just pass the day number)
deno task day:auto 1

# Fetch input and challenge text (just pass the day number)
deno task day:fetch 1

# Refresh star cache from server (just pass the day number)
deno task day:refresh 1

# Or use the full command directly
deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts --day 1 --part 1 --print
```

### Flags

- `--day, -d <number>` - Day to run (1-25)
- `--part, -p <number>` - Part to run (1 or 2)
- `--submit, -s` - Submit answer to AoC
- `--print` - Print answer (default: true)
- `--auto, -a` - Auto-detect and submit both parts
- `--year, -y <number>` - Year (default: 2025)
- `--refresh-stars, -r` - Force refresh star cache from server
- `--help, -h` - Show help

### File Naming

The harness looks for solution files in these formats:

- `day01.code.ts` (preferred)
- `day01.ts`
- `day1.code.ts`
- `day1.ts`

Place your solution files in `advent-of-code/YYYY/` directory.

### Output Format

Your solution should print answers in one of these formats:

```
Part 1: 12345
Part 2: 67890
```

Or:

```
part 1: 12345
part 2: 67890
```

The harness will automatically parse these from your console output.

## Environment Variables

Create a `.env` file with:

```env
AOC_SESSION=your_session_cookie_here
AOC_BASE_URL=https://adventofcode.com
RATE_LIMIT_MS=60000
```

## Rate Limiting

The harness automatically respects Advent of Code's rate limit of 1 submission per minute. If you try to submit too quickly, it will wait automatically.

## Star Tracking

The harness caches your star status locally in `.stars-cache.json`. It will:

- Skip days/parts you've already completed
- Update the cache when you successfully submit answers
- Refresh from the server if cache is older than 1 hour
- Check individual day pages for accurate completion status

To force refresh the star cache:

```bash
deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts --day 1 --refresh-stars
```

## Examples

```bash
# Just see the answer
deno task day 1 --part 1

# Submit part 1
deno task day 1 --part 1 --submit

# Auto-submit both parts (if not already completed)
deno task day:auto 1

# Refresh stars and check status
deno task day:refresh 1

# Run day 5 for year 2024 (need full command for year flag)
deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts -d 5 -y 2024 -a
```

## Future Enhancements

Potential features for an agentic loop:

- Automatic code fixing based on wrong answers
- Test case generation from examples
- Solution template generation
- Performance benchmarking
- Solution comparison across years
