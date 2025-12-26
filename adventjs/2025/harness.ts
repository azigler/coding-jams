#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-run --allow-env

/**
 * AdventJS 2025 Harness
 *
 * Automates fetching challenges, running tests, submitting solutions, and tracking progress.
 * Supports JavaScript, TypeScript, and Python solutions.
 *
 * Usage:
 *   deno task fetch 1          # Fetch challenge 1
 *   deno task submit 1 js      # Submit challenge 1 in JavaScript
 *   deno task submit 1 ts      # Submit challenge 1 in TypeScript
 *   deno task submit 1 py      # Submit challenge 1 in Python
 *   deno task auto 1           # Solve challenge 1 in all languages
 *   deno task status           # Show completion status
 *   deno task test 1 js        # Test challenge 1 locally (JS)
 */

import { join } from "std/path"

// ============================================================================
// Configuration
// ============================================================================

interface EnvConfig {
  sessionToken: string
  rateLimitMs: number
  year: number
}

interface AdviceFeedback {
  score: number
  breakdown: {
    correctness: number
    complexity: number
    style: number
    algorithmic_quality: number
    maintainability: number
  }
  weaknesses: string[]
  action_items: string[]
}

interface ImprovementAttempt {
  timestamp: number
  previousScore: number
  newScore: number
  strategyUsed: string
  success: boolean
}

interface CacheData {
  year: number
  buildId: string | null
  lastBuildIdFetch: number | null
  lastSubmissionTime: number | null // Timestamp of last submission for rate limiting
  challenges: Record<
    string,
    {
      title: string
      stars: Record<string, number> // language -> stars
      solved: Record<string, boolean> // language -> solved
      advice: Record<string, AdviceFeedback> // language -> advice feedback
      wrongAnswers: string[]
      improvementAttempts?: Record<string, ImprovementAttempt[]> // language -> attempts
    }
  >
  achievements: Record<string, boolean>
  timestamp: number | null
}

// ============================================================================
// Complexity Improvement Patterns
// ============================================================================

interface ImprovementPattern {
  name: string
  keywords: string[] // Keywords to match in feedback
  suggestion: string
  codeHint: string
  example?: {
    before: string
    after: string
  }
}

const IMPROVEMENT_PATTERNS: ImprovementPattern[] = [
  {
    name: "extract_helper_function",
    keywords: [
      "extract helper",
      "helper function",
      "separate function",
      "modular",
    ],
    suggestion: "Extract complex logic into a separate helper function",
    codeHint: `// Before: Inline complex logic
if (x >= 0 && x < width && y >= 0 && y < height && grid[y][x] !== '#') { ... }

// After: Extract to helper
const isValid = (x, y) => x >= 0 && x < width && y >= 0 && y < height && grid[y][x] !== '#';
if (isValid(x, y)) { ... }`,
  },
  {
    name: "simplify_return",
    keywords: [
      "simplify return",
      "return statement",
      "final return",
      "return logic",
    ],
    suggestion:
      "Simplify the return statement using early returns or ternary chains",
    codeHint: `// Before: Nested conditionals at end
if (a <= 0 && b <= 0) return 0;
if (a <= 0) return 2;
if (b <= 0) return 1;
return a > b ? 1 : b > a ? 2 : 0;

// After: Using Math.sign or lookup
return a <= 0 && b <= 0 ? 0 : a <= 0 ? 2 : b <= 0 ? 1 : Math.sign(b - a) + 1 || 0;`,
  },
  {
    name: "reduce_nesting",
    keywords: [
      "reduce nesting",
      "nested",
      "nesting",
      "flatten",
      "conditional chain",
    ],
    suggestion:
      "Reduce nesting by using early returns, guard clauses, or lookup tables",
    codeHint: `// Before: Deep nesting
if (move1 === 'A') {
  if (move2 === 'B') { ... }
  else if (move2 === 'A') { ... }
}

// After: Lookup table
const damage = { 'A': { 'A': [1,1], 'B': [0,0], 'F': [2,1] }, ... };
const [d1, d2] = damage[move1]?.[move2] || [0, 0];`,
  },
  {
    name: "use_lookup_table",
    keywords: ["lookup", "map", "direction", "damage", "movement"],
    suggestion: "Replace conditional chains with a lookup table/object",
    codeHint: `// Before: Switch or if-else chain
if (dir === 'U') { dy = -1; }
else if (dir === 'D') { dy = 1; }
else if (dir === 'L') { dx = -1; }
else if (dir === 'R') { dx = 1; }

// After: Lookup table
const moves = { U: [0,-1], D: [0,1], L: [-1,0], R: [1,0] };
const [dx, dy] = moves[dir] || [0, 0];`,
  },
  {
    name: "consolidate_loops",
    keywords: ["consolidate", "redundant", "repetitive", "duplicate", "unify"],
    suggestion: "Consolidate repetitive loop logic into a single unified loop",
    codeHint: `// Before: Separate loops for horizontal/vertical/diagonal
for (let r = 0; r < rows; r++) checkHorizontal(r);
for (let c = 0; c < cols; c++) checkVertical(c);
for (...) checkDiagonal1();
for (...) checkDiagonal2();

// After: Single loop with direction vectors
const directions = [[0,1], [1,0], [1,1], [1,-1]];
for (const [dr, dc] of directions) { ... }`,
  },
  {
    name: "functional_style",
    keywords: ["functional", "reduce", "filter", "map", "chain"],
    suggestion: "Use functional array methods instead of imperative loops",
    codeHint: `// Before: Imperative loop
let result = [];
for (const item of items) {
  if (item.valid) result.push(item.value);
}

// After: Functional chain
const result = items.filter(x => x.valid).map(x => x.value);`,
  },
  {
    name: "early_return",
    keywords: ["early return", "guard clause", "base case"],
    suggestion: "Use early returns/guard clauses to handle edge cases first",
    codeHint: `// Before: Everything in one block
function process(x) {
  if (x) {
    // lots of code
  }
  return null;
}

// After: Early return
function process(x) {
  if (!x) return null;
  // main logic here
}`,
  },
  {
    name: "line_length",
    keywords: ["line length", "maxLen", "long line", "readability"],
    suggestion: "Break long lines into multiple shorter lines",
    codeHint: `// Before: One long line
const result = someArray.filter(x => x.condition).map(x => x.transform).reduce((a, b) => a + b, 0);

// After: Multi-line for clarity
const result = someArray
  .filter(x => x.condition)
  .map(x => x.transform)
  .reduce((a, b) => a + b, 0);`,
  },
]

interface ChallengeInfo {
  id: number
  title: string
  difficulty: string
  description: string
  examples: string
  functionName: string
  defaultCode: {
    javascript: string
    typescript: string
    python: string
  }
  availableLanguages: string[]
}

interface SubmitResult {
  success: boolean
  stars: number
  message: string
  testResults?: {
    total: number
    passed: number
    failed: number
    secretFails: number
    details: Array<{
      ok: boolean
      secret: boolean
      info?: {
        msg: string
        expected: string
        actual: string
      }
    }>
  }
  advice?: {
    score: number
    breakdown: Record<string, number>
    violations: string[]
    feedback: {
      strengths: string[]
      weaknesses: string[]
      action_items: string[]
    }
  }
  alreadySaved: boolean
}

// ============================================================================
// Environment Loading
// ============================================================================

async function loadEnv(): Promise<EnvConfig> {
  const envPath = join(Deno.cwd(), ".env")
  let envContent = ""

  try {
    envContent = await Deno.readTextFile(envPath)
  } catch {
    console.error(
      "❌ .env file not found. Copy .env.example to .env and fill in your values."
    )
    Deno.exit(1)
  }

  const env: Record<string, string> = {}
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const [key, ...valueParts] = trimmed.split("=")
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "")
    }
  }

  const sessionToken = env.ADVENTJS_SESSION_TOKEN
  if (!sessionToken || sessionToken === "your_session_token_here") {
    console.error("❌ ADVENTJS_SESSION_TOKEN not set in .env")
    console.error("   Get it from your browser cookies at adventjs.dev")
    console.error("   Cookie name: __Secure-next-auth.session-token")
    Deno.exit(1)
  }

  return {
    sessionToken,
    rateLimitMs: parseInt(env.RATE_LIMIT_MS || "60000", 10),
    year: parseInt(env.ADVENTJS_YEAR || "2025", 10),
  }
}

// ============================================================================
// Cache Management
// ============================================================================

const CACHE_FILE = "cache.json"

async function loadCache(): Promise<CacheData> {
  try {
    const content = await Deno.readTextFile(CACHE_FILE)
    const cache = JSON.parse(content)
    // Ensure lastSubmissionTime exists for backward compatibility
    if (cache.lastSubmissionTime === undefined) {
      cache.lastSubmissionTime = null
    }
    return cache
  } catch {
    return {
      year: 2025,
      buildId: null,
      lastBuildIdFetch: null,
      lastSubmissionTime: null,
      challenges: {},
      achievements: {},
      timestamp: null,
    }
  }
}

async function saveCache(cache: CacheData): Promise<void> {
  cache.timestamp = Date.now()
  await Deno.writeTextFile(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ============================================================================
// HTTP Client with Cookie Handling
// ============================================================================

class AdventJSClient {
  private config: EnvConfig
  private cache: CacheData
  private userAgent = "azigler/coding-jams"

  constructor(config: EnvConfig, cache: CacheData) {
    this.config = config
    this.cache = cache
  }

  private getCookieHeader(): string {
    return `NEXT_LOCALE=en; __Secure-next-auth.session-token=${this.config.sessionToken}`
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const lastSubmission = this.cache.lastSubmissionTime

    if (lastSubmission !== null && lastSubmission > 0) {
      const elapsed = now - lastSubmission
      const baseWait = this.config.rateLimitMs

      if (elapsed < baseWait) {
        // Need to wait - add jitter (±10%) to avoid patterns
        const remainingWait = baseWait - elapsed
        const jitterPercent = 0.1 // ±10%
        const jitter = remainingWait * jitterPercent * (Math.random() * 2 - 1) // -10% to +10%
        const waitTime = Math.max(0, remainingWait + jitter)
        const waitSeconds = Math.ceil(waitTime / 1000)

        console.log(
          `⏳ Rate limit: waiting ${waitSeconds}s before next API call...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }

    // Update cache with current submission time
    this.cache.lastSubmissionTime = Date.now()
    await saveCache(this.cache)
  }

  async getBuildId(): Promise<string> {
    // Check cache first (valid for 1 hour)
    const cacheAge = this.cache.lastBuildIdFetch
      ? Date.now() - this.cache.lastBuildIdFetch
      : Infinity

    if (this.cache.buildId && cacheAge < 3600000) {
      return this.cache.buildId
    }

    console.log("🔍 Fetching current build ID...")

    try {
      const response = await fetch("https://adventjs.dev/", {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html",
          "Accept-Language": "en",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch homepage: ${response.status}`)
      }

      const html = await response.text()

      // Extract build ID from Next.js data
      // Look for: /_next/data/BUILD_ID/ or "buildId":"BUILD_ID"
      const buildIdMatch =
        html.match(/"buildId":"([^"]+)"/) ||
        html.match(/\/_next\/data\/([^/]+)\//)

      if (!buildIdMatch) {
        throw new Error("Could not extract build ID from homepage")
      }

      this.cache.buildId = buildIdMatch[1]
      this.cache.lastBuildIdFetch = Date.now()
      await saveCache(this.cache)

      console.log(`✅ Build ID: ${this.cache.buildId}`)
      return this.cache.buildId
    } catch (error) {
      if (this.cache.buildId) {
        console.warn(
          `⚠️ Could not refresh build ID, using cached: ${this.cache.buildId}`
        )
        return this.cache.buildId
      }
      throw error
    }
  }

  async fetchChallenge(challengeId: number): Promise<ChallengeInfo> {
    const buildId = await this.getBuildId()

    const url = `https://adventjs.dev/_next/data/${buildId}/en/challenges/${this.config.year}/${challengeId}.json?id=${challengeId}`

    console.log(`📥 Fetching challenge ${challengeId}...`)

    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
        "Accept-Language": "en",
        Cookie: this.getCookieHeader(),
        "x-nextjs-data": "1",
      },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch challenge: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    const pageProps = data.pageProps

    if (!pageProps) {
      throw new Error("Invalid challenge response structure: missing pageProps")
    }

    // AdventJS API structure:
    // - pageProps.title: challenge title
    // - pageProps.level: difficulty (easy/medium/hard)
    // - pageProps.description: HTML description
    // - pageProps.defaultCode: { javascript, typescript, python }
    // - pageProps.challengeId: 0-indexed ID

    const description = pageProps.description || ""
    const defaultCode = pageProps.defaultCode || {}

    // Split description into challenge and examples
    // Examples section has id="examples" in the h2 tag
    const examplesMatch = description.match(
      /<h2[^>]*id=["']examples["'][^>]*>/i
    )
    let challengeDesc = description
    let examplesDesc = ""

    if (examplesMatch && examplesMatch.index !== undefined) {
      challengeDesc = description.substring(0, examplesMatch.index).trim()
      examplesDesc = description.substring(examplesMatch.index).trim()
    }

    // Extract function name from default code
    let functionName = ""
    const jsCode = defaultCode.javascript || ""
    const fnMatch = jsCode.match(/function\s+(\w+)\s*\(/)
    if (fnMatch) {
      functionName = fnMatch[1]
    }

    // Update cache with all challenge titles from this response
    if (pageProps.challenges && Array.isArray(pageProps.challenges)) {
      for (let i = 0; i < pageProps.challenges.length; i++) {
        const id = String(i + 1) // challenges array is 0-indexed
        const challenge = pageProps.challenges[i]
        if (!this.cache.challenges[id]) {
          this.cache.challenges[id] = {
            title: challenge.title || "",
            stars: {},
            solved: {},
            advice: {},
            wrongAnswers: [],
          }
        } else if (!this.cache.challenges[id].title) {
          this.cache.challenges[id].title = challenge.title || ""
        }
      }
      await saveCache(this.cache)
    }

    return {
      id: challengeId,
      title: pageProps.title || `Challenge ${challengeId}`,
      difficulty: pageProps.level || "unknown",
      description: challengeDesc,
      examples: examplesDesc,
      functionName,
      defaultCode: {
        javascript: defaultCode.javascript || "",
        typescript: defaultCode.typescript || "",
        python: defaultCode.python || "",
      },
      availableLanguages: ["javascript", "typescript", "python"],
    }
  }

  // Fetch all challenge titles in one request
  async fetchAllChallengeTitles(): Promise<Record<string, string>> {
    const buildId = await this.getBuildId()
    // Fetch any challenge to get the challenges array
    const url = `https://adventjs.dev/_next/data/${buildId}/en/challenges/${this.config.year}/1.json?id=1`

    console.log("📝 Fetching all challenge titles...")

    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
        "Accept-Language": "en",
        Cookie: this.getCookieHeader(),
        "x-nextjs-data": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch challenges: ${response.status}`)
    }

    const data = await response.json()
    const pageProps = data.pageProps || {}
    const titles: Record<string, string> = {}

    if (pageProps.challenges && Array.isArray(pageProps.challenges)) {
      for (let i = 0; i < pageProps.challenges.length; i++) {
        const id = String(i + 1)
        const challenge = pageProps.challenges[i]
        titles[id] = challenge.title || `Challenge ${id}`

        // Update cache
        if (!this.cache.challenges[id]) {
          this.cache.challenges[id] = {
            title: challenge.title || "",
            stars: {},
            solved: {},
            advice: {},
            wrongAnswers: [],
          }
        } else {
          this.cache.challenges[id].title = challenge.title || ""
        }
      }
      await saveCache(this.cache)
      console.log(
        `   Updated ${Object.keys(titles).length} challenge titles in cache`
      )
    }

    return titles
  }

  async submitSolution(
    challengeId: number,
    code: string,
    language: "javascript" | "typescript" | "python"
  ): Promise<SubmitResult> {
    await this.rateLimit()

    const url = `https://adventjs.dev/api/challenge-${this.config.year}/${challengeId}`

    console.log(`📤 Submitting challenge ${challengeId} in ${language}...`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        Cookie: this.getCookieHeader(),
        Referer: `https://adventjs.dev/en/challenges/${this.config.year}/${challengeId}`,
      },
      body: JSON.stringify({ code, language, locale: "en" }),
    })

    if (!response.ok) {
      const text = await response.text()

      // Check for auth errors
      if (
        response.status === 401 ||
        response.status === 403 ||
        text.includes("Unauthorized")
      ) {
        console.error(
          "\n❌ Authentication failed - your session token may have expired."
        )
        console.error("   To fix:")
        console.error("   1. Open adventjs.dev in your browser and log in")
        console.error("   2. Open DevTools → Application → Cookies")
        console.error("   3. Copy __Secure-next-auth.session-token value")
        console.error("   4. Update ADVENTJS_SESSION_TOKEN in .env")
      }

      return {
        success: false,
        stars: 0,
        message: `HTTP ${response.status}: ${text}`,
        alreadySaved: false,
      }
    }

    const data = await response.json()

    // Parse response
    const allPassed =
      data.results?.failures === 0 && data.results?.secretFails === 0
    const alreadySaved = data.alreadySavedStars !== null

    const result: SubmitResult = {
      success: allPassed,
      stars: data.stars || 0,
      message: allPassed
        ? `✅ All tests passed! ${data.stars} stars earned.`
        : `❌ Tests failed: ${data.results?.failures || 0} failures, ${
            data.results?.secretFails || 0
          } secret failures`,
      testResults: data.results
        ? {
            total: data.results.total,
            passed:
              data.results.total -
              data.results.failures -
              data.results.secretFails,
            failed: data.results.failures,
            secretFails: data.results.secretFails,
            details: data.results.details || [],
          }
        : undefined,
      advice: data.advice,
      alreadySaved,
    }

    // Update cache
    if (!this.cache.challenges[challengeId]) {
      this.cache.challenges[challengeId] = {
        title: "",
        stars: {},
        solved: {},
        advice: {},
        wrongAnswers: [],
      }
    }

    if (allPassed) {
      this.cache.challenges[challengeId].stars[language] = data.stars || 0
      this.cache.challenges[challengeId].solved[language] = true
    }

    // Store advice feedback for improvement iterations
    if (data.advice) {
      this.cache.challenges[challengeId].advice =
        this.cache.challenges[challengeId].advice || {}
      this.cache.challenges[challengeId].advice[language] = {
        score: data.advice.score || 0,
        breakdown: {
          correctness: data.advice.breakdown?.correctness || 0,
          complexity: data.advice.breakdown?.complexity || 0,
          style: data.advice.breakdown?.style || 0,
          algorithmic_quality: data.advice.breakdown?.algorithmic_quality || 0,
          maintainability: data.advice.breakdown?.maintainability || 0,
        },
        weaknesses: data.advice.feedback?.weaknesses || [],
        action_items: data.advice.feedback?.action_items || [],
      }
    }

    // Track achievements
    if (data.achievements) {
      for (const [key, value] of Object.entries(data.achievements)) {
        if (value) {
          this.cache.achievements[key] = true
          console.log(`🏆 Achievement unlocked: ${key}`)
        }
      }
    }

    await saveCache(this.cache)

    return result
  }

  async fetchUserStatus(): Promise<{
    completedChallenges: Record<string, string>
    achievements: Record<string, boolean>
  }> {
    const buildId = await this.getBuildId()

    const url = `https://adventjs.dev/_next/data/${buildId}/en/achievements.json`

    console.log("📊 Fetching user status...")

    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
        "Accept-Language": "en",
        Cookie: this.getCookieHeader(),
        "x-nextjs-data": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch status: ${response.status}`)
    }

    const data = await response.json()
    const pageProps = data.pageProps || {}

    // Update cache with achievements
    if (pageProps.achievements) {
      this.cache.achievements = pageProps.achievements
    }

    // Update challenge completion
    if (pageProps.completedChallenges) {
      for (const [id, stars] of Object.entries(pageProps.completedChallenges)) {
        if (!this.cache.challenges[id]) {
          this.cache.challenges[id] = {
            title: "",
            stars: {},
            solved: {},
            advice: {},
            wrongAnswers: [],
          }
        }
        // completedChallenges shows total stars, not per-language
        this.cache.challenges[id].stars["total"] = parseInt(stars as string, 10)
      }
    }

    await saveCache(this.cache)

    return {
      completedChallenges: pageProps.completedChallenges || {},
      achievements: pageProps.achievements || {},
    }
  }

  getCache(): CacheData {
    return this.cache
  }
}

// ============================================================================
// File Operations
// ============================================================================

async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true })
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error
    }
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path)
    return true
  } catch {
    return false
  }
}

function getChallengeDir(challengeId: number): string {
  return join(Deno.cwd(), String(challengeId).padStart(2, "0"))
}

async function saveChallengeFiles(challenge: ChallengeInfo): Promise<void> {
  const dir = getChallengeDir(challenge.id)
  await ensureDir(dir)

  // Save challenge.html
  await Deno.writeTextFile(join(dir, "challenge.html"), challenge.description)
  console.log(`  ✅ challenge.html`)

  // Save examples.html
  await Deno.writeTextFile(join(dir, "examples.html"), challenge.examples)
  console.log(`  ✅ examples.html`)

  // Create log.md if it doesn't exist
  const logPath = join(dir, "log.md")
  if (!(await fileExists(logPath))) {
    const logTemplate = `# Challenge ${challenge.id}: ${challenge.title} - Solution Log

## Problem Summary
- **Difficulty:** ${challenge.difficulty}
- **Function:** \`${challenge.functionName}\`

## Attempts

### JavaScript
- [ ] Not started

### TypeScript
- [ ] Not started

### Python
- [ ] Not started

## Wrong Answers (DO NOT RESUBMIT)
<!-- Track wrong answers here to avoid resubmitting -->

## Approach
<!-- Document your algorithm here -->

## Key Insights
<!-- What made this problem tricky? -->
`
    await Deno.writeTextFile(logPath, logTemplate)
    console.log(`  ✅ log.md`)
  }

  // Create test.ts template if it doesn't exist
  const testPath = join(dir, "test.ts")
  if (!(await fileExists(testPath))) {
    const testTemplate = `// Test file for Challenge ${challenge.id}: ${challenge.title}
// Run with: deno run --allow-read test.ts

// TODO: Import solution and test against examples from examples.html

// Example test structure:
// import { ${challenge.functionName} } from "./solution.ts"
//
// const testCases = [
//   { input: [...], expected: ... },
// ]
//
// for (const { input, expected } of testCases) {
//   const result = ${challenge.functionName}(...input)
//   const pass = JSON.stringify(result) === JSON.stringify(expected)
//   console.log(\`Test: \${pass ? "✅" : "❌"} Expected: \${JSON.stringify(expected)}, Got: \${JSON.stringify(result)}\`)
// }

console.log("⚠️ Tests not yet implemented - review examples.html and implement tests")
`
    await Deno.writeTextFile(testPath, testTemplate)
    console.log(`  ✅ test.ts`)
  }

  // Create solution.js template if it doesn't exist
  const solutionJsPath = join(dir, "solution.js")
  if (!(await fileExists(solutionJsPath))) {
    const jsTemplate =
      challenge.defaultCode.javascript ||
      `/**
 * Challenge ${challenge.id}: ${challenge.title}
 */

function ${challenge.functionName || "solve"}() {
  // TODO: Implement solution
}
`
    await Deno.writeTextFile(solutionJsPath, jsTemplate)
    console.log(`  ✅ solution.js`)
  }

  // Create solution.ts template if it doesn't exist
  const solutionTsPath = join(dir, "solution.ts")
  if (!(await fileExists(solutionTsPath))) {
    const tsTemplate =
      challenge.defaultCode.typescript ||
      `/**
 * Challenge ${challenge.id}: ${challenge.title}
 */

function ${challenge.functionName || "solve"}(): unknown {
  // TODO: Implement solution
}
`
    await Deno.writeTextFile(solutionTsPath, tsTemplate)
    console.log(`  ✅ solution.ts`)
  }

  // Create solution.py template if it doesn't exist
  const solutionPyPath = join(dir, "solution.py")
  if (!(await fileExists(solutionPyPath))) {
    const pyTemplate =
      challenge.defaultCode.python ||
      `"""
Challenge ${challenge.id}: ${challenge.title}
"""

def ${
        challenge.functionName
          ? challenge.functionName
              .replace(/([A-Z])/g, "_$1")
              .toLowerCase()
              .replace(/^_/, "")
          : "solve"
      }():
    # TODO: Implement solution
    pass
`
    await Deno.writeTextFile(solutionPyPath, pyTemplate)
    console.log(`  ✅ solution.py`)
  }
}

async function readSolutionFile(
  challengeId: number,
  language: "javascript" | "typescript" | "python"
): Promise<string> {
  const dir = getChallengeDir(challengeId)
  const ext =
    language === "javascript" ? "js" : language === "typescript" ? "ts" : "py"
  const filePath = join(dir, `solution.${ext}`)

  try {
    return await Deno.readTextFile(filePath)
  } catch {
    throw new Error(`Solution file not found: ${filePath}`)
  }
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIArgs {
  command:
    | "fetch"
    | "submit"
    | "status"
    | "test"
    | "auto"
    | "titles"
    | "improve"
    | "help"
  challengeId?: number
  language?: "javascript" | "typescript" | "python"
  force?: boolean
  maxAttempts?: number
}

function parseArgs(): CLIArgs {
  const args = Deno.args
  const result: CLIArgs = { command: "help" }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case "--fetch":
      case "-f":
        result.command = "fetch"
        if (nextArg && !nextArg.startsWith("-")) {
          result.challengeId = parseInt(nextArg, 10)
          i++
        }
        break
      case "--submit":
      case "-s":
        result.command = "submit"
        if (nextArg && !nextArg.startsWith("-")) {
          result.challengeId = parseInt(nextArg, 10)
          i++
        }
        break
      case "--status":
        result.command = "status"
        break
      case "--titles":
        result.command = "titles"
        break
      case "--improve":
      case "-i":
        result.command = "improve"
        if (nextArg && !nextArg.startsWith("-")) {
          result.challengeId = parseInt(nextArg, 10)
          i++
        }
        break
      case "--max-attempts":
        if (nextArg && !nextArg.startsWith("-")) {
          result.maxAttempts = parseInt(nextArg, 10)
          i++
        }
        break
      case "--test":
      case "-t":
        result.command = "test"
        if (nextArg && !nextArg.startsWith("-")) {
          result.challengeId = parseInt(nextArg, 10)
          i++
        }
        break
      case "--auto":
      case "-a":
        result.command = "auto"
        if (nextArg && !nextArg.startsWith("-")) {
          result.challengeId = parseInt(nextArg, 10)
          i++
        }
        break
      case "--lang":
      case "-l":
        if (nextArg) {
          const lang = nextArg.toLowerCase()
          if (lang === "js" || lang === "javascript") {
            result.language = "javascript"
          } else if (lang === "ts" || lang === "typescript") {
            result.language = "typescript"
          } else if (lang === "py" || lang === "python") {
            result.language = "python"
          }
          i++
        }
        break
      case "--force":
      case "-F":
        result.force = true
        break
      case "--help":
      case "-h":
        result.command = "help"
        break
      default:
        // Positional argument - could be challenge ID
        if (!isNaN(parseInt(arg, 10)) && !result.challengeId) {
          result.challengeId = parseInt(arg, 10)
        }
    }
  }

  return result
}

function printHelp(): void {
  console.log(`
AdventJS 2025 Harness

Usage:
  deno task fetch <id>              Fetch challenge and create files
  deno task submit <id> <lang>      Submit solution (js/ts/py)
  deno task test <id> <lang>        Run local tests
  deno task auto <id>               Auto-solve in all languages
  deno task status                  Show completion status

Options:
  --fetch, -f <id>      Fetch challenge
  --submit, -s <id>     Submit solution
  --test, -t <id>       Run local tests
  --auto, -a <id>       Auto-solve challenge
  --lang, -l <lang>     Language: js/ts/py (default: js)
  --force, -F           Force resubmit even if solved (for quality improvement)
  --status              Show status
  --titles              Fetch and cache all challenge titles
  --improve, -i <id>    Show improvement suggestions for 4/5 solutions
  --max-attempts <n>    Max improvement attempts (default: 3)
  --help, -h            Show this help

Languages:
  js, javascript        JavaScript
  ts, typescript        TypeScript
  py, python            Python

Examples:
  deno task fetch 1                 # Fetch challenge 1
  deno task submit 1 js             # Submit JS solution for challenge 1
  deno task auto 1                  # Solve challenge 1 in all languages
  deno task status                  # Show progress
`)
}

// ============================================================================
// Commands
// ============================================================================

async function cmdFetch(
  client: AdventJSClient,
  challengeId: number
): Promise<void> {
  console.log(`\n🎄 AdventJS 2025 - Challenge ${challengeId}\n`)

  try {
    const challenge = await client.fetchChallenge(challengeId)
    console.log(`\n📝 ${challenge.title} (${challenge.difficulty})`)
    console.log(`   Function: ${challenge.functionName}`)
    console.log(`\n📁 Creating files...`)
    await saveChallengeFiles(challenge)
    console.log(`\n✅ Challenge ${challengeId} ready!`)
    console.log(`   Edit: ${getChallengeDir(challengeId)}/solution.js`)
  } catch (error) {
    console.error(`❌ Failed to fetch challenge: ${error}`)
    Deno.exit(1)
  }
}

async function cmdSubmit(
  client: AdventJSClient,
  challengeId: number,
  language: "javascript" | "typescript" | "python",
  force = false
): Promise<void> {
  console.log(`\n🎄 AdventJS 2025 - Challenge ${challengeId} (${language})\n`)

  // Check if already solved
  const cache = client.getCache()
  const challengeCache = cache.challenges[challengeId]
  const alreadySolved = challengeCache?.solved[language]
  const hasAdvice = challengeCache?.advice?.[language]?.score !== undefined
  const hasPerfectScore =
    hasAdvice && challengeCache?.advice?.[language]?.score === 5

  if (alreadySolved && !force) {
    // Check if we need to capture advice or improve score
    if (!hasAdvice) {
      console.log(
        `⭐ Already solved in ${language}, but no quality score cached.`
      )
      console.log(`   Resubmitting to capture code quality feedback...\n`)
      // Continue to submission
    } else if (!hasPerfectScore) {
      console.log(
        `⭐ Already solved in ${language} with ${challengeCache?.advice?.[language]?.score}/5 quality.`
      )
      console.log(`   Use --force to resubmit for improvement.\n`)
      console.log(`   Current weaknesses:`)
      for (const w of challengeCache?.advice?.[language]?.weaknesses || []) {
        console.log(`   • ${w}`)
      }
      return
    } else {
      console.log(`⭐ Already solved in ${language} with 5/5 quality! ✨`)
      console.log(`   Stars: ${challengeCache.stars[language]}`)
      console.log(`   Use --force to resubmit anyway.\n`)
      return
    }
  }

  if (alreadySolved && force && hasPerfectScore) {
    console.log(
      `🔄 Force resubmitting ${language} solution (currently 5/5 quality)...\n`
    )
  }

  // Read solution
  let code: string
  try {
    code = await readSolutionFile(challengeId, language)
  } catch (error) {
    console.error(`❌ ${error}`)
    Deno.exit(1)
    return // TypeScript doesn't know Deno.exit never returns
  }

  // Submit
  const result = await client.submitSolution(challengeId, code, language)

  console.log(`\n${result.message}`)

  if (result.testResults) {
    console.log(`\n📊 Test Results:`)
    console.log(`   Total: ${result.testResults.total}`)
    console.log(`   Passed: ${result.testResults.passed}`)
    console.log(`   Failed: ${result.testResults.failed}`)
    console.log(`   Secret Fails: ${result.testResults.secretFails}`)

    // Show failed test details
    if (!result.success) {
      console.log(`\n❌ Failed Tests:`)
      for (const detail of result.testResults.details) {
        if (!detail.ok && detail.info?.msg) {
          console.log(`   • ${detail.info.msg}`)
          console.log(`     Expected: ${detail.info.expected}`)
          console.log(`     Actual: ${detail.info.actual}`)
        }
      }
    }
  }

  if (result.advice && result.success) {
    const newScore = result.advice.score
    const isPerfect = newScore === 5
    const previousScore = challengeCache?.advice?.[language]?.score

    // Track improvement attempt if this was a resubmit
    if (force && previousScore !== undefined && previousScore < 5) {
      const updatedCache = client.getCache()
      if (!updatedCache.challenges[challengeId].improvementAttempts) {
        updatedCache.challenges[challengeId].improvementAttempts = {}
      }
      if (!updatedCache.challenges[challengeId].improvementAttempts[language]) {
        updatedCache.challenges[challengeId].improvementAttempts[language] = []
      }

      const attempt: ImprovementAttempt = {
        timestamp: Date.now(),
        previousScore,
        newScore,
        strategyUsed: "manual_refactor",
        success: newScore > previousScore,
      }

      updatedCache.challenges[challengeId].improvementAttempts[language].push(
        attempt
      )

      if (newScore > previousScore) {
        console.log(`\n🎉 IMPROVEMENT: ${previousScore}/5 → ${newScore}/5`)
      } else if (newScore === previousScore) {
        console.log(`\n📊 Score unchanged: ${newScore}/5`)
      }
    }

    console.log(
      `\n📈 Code Quality: ${newScore}/5 ${
        isPerfect ? "✨ PERFECT!" : "⚠️ Can improve"
      }`
    )

    // Show breakdown scores
    const breakdown = result.advice.breakdown
    if (breakdown) {
      console.log(`   Correctness:   ${breakdown.correctness}%`)
      console.log(`   Complexity:    ${breakdown.complexity}%`)
      console.log(`   Style:         ${breakdown.style}%`)
      console.log(`   Algorithm:     ${breakdown.algorithmic_quality}%`)
      console.log(`   Maintainable:  ${breakdown.maintainability}%`)
    }

    // Show improvement suggestions if not perfect
    if (!isPerfect && result.advice.feedback) {
      const { weaknesses, action_items } = result.advice.feedback

      if (weaknesses && weaknesses.length > 0) {
        console.log(`\n⚠️ Weaknesses (fix to get 5/5):`)
        for (const w of weaknesses) {
          console.log(`   • ${w}`)
        }
      }

      if (action_items && action_items.length > 0) {
        console.log(`\n🔧 Action Items:`)
        for (const a of action_items) {
          console.log(`   • ${a}`)
        }
      }

      // Show matched patterns for guidance
      const patterns = matchImprovementPatterns(
        weaknesses || [],
        action_items || []
      )
      if (patterns.length > 0) {
        console.log(`\n💡 Suggested patterns to try:`)
        for (const p of patterns) {
          console.log(`   • ${p.name.replace(/_/g, " ")}: ${p.suggestion}`)
        }
        console.log(
          `\n   Run 'deno task improve ${challengeId} ${language}' for detailed examples`
        )
      }

      console.log(
        `\n💡 TIP: Improve the solution and run 'deno task resubmit ${challengeId} ${language}'`
      )
    }
  }

  if (result.alreadySaved) {
    console.log(`\n⚠️ Note: Stars were already saved for this submission.`)
  }
}

async function cmdStatus(client: AdventJSClient): Promise<void> {
  console.log(`\n🎄 AdventJS 2025 - Status\n`)

  try {
    const status = await client.fetchUserStatus()

    console.log(`📊 Completed Challenges:`)
    const challenges = Object.entries(status.completedChallenges).sort(
      ([a], [b]) => parseInt(a) - parseInt(b)
    )

    if (challenges.length === 0) {
      console.log(`   No challenges completed yet.`)
    } else {
      const cache = client.getCache()
      for (const [id, stars] of challenges) {
        const title = cache.challenges[id]?.title || ""
        console.log(
          `   ${id.padStart(2, "0")}. ${
            title || `Challenge ${id}`
          }: ⭐ ${stars}`
        )
      }
    }

    console.log(`\n🏆 Achievements:`)
    const earned = Object.entries(status.achievements).filter(([_, v]) => v)
    const notEarned = Object.entries(status.achievements).filter(([_, v]) => !v)

    if (earned.length === 0) {
      console.log(`   No achievements earned yet.`)
    } else {
      for (const [name] of earned) {
        console.log(`   ✅ ${name}`)
      }
    }

    if (notEarned.length > 0) {
      console.log(`\n   Remaining:`)
      for (const [name] of notEarned) {
        console.log(`   ⬜ ${name}`)
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch status: ${error}`)
    Deno.exit(1)
  }
}

// ============================================================================
// Improvement Analysis and Suggestions
// ============================================================================

function matchImprovementPatterns(
  weaknesses: string[],
  actionItems: string[]
): ImprovementPattern[] {
  const allFeedback = [...weaknesses, ...actionItems].map((s) =>
    s.toLowerCase()
  )
  const matchedPatterns: ImprovementPattern[] = []

  for (const pattern of IMPROVEMENT_PATTERNS) {
    const matches = pattern.keywords.some((keyword) =>
      allFeedback.some((feedback) => feedback.includes(keyword.toLowerCase()))
    )
    if (matches) {
      matchedPatterns.push(pattern)
    }
  }

  return matchedPatterns
}

function generateImprovementReport(
  challengeId: number,
  language: string,
  advice: AdviceFeedback
): string {
  const lines: string[] = []

  lines.push(`\n🔧 IMPROVEMENT REPORT: Challenge ${challengeId} (${language})`)
  lines.push(`${"=".repeat(60)}\n`)

  // Current score breakdown
  lines.push(`📊 Current Score: ${advice.score}/5`)
  lines.push(`   Correctness:   ${advice.breakdown.correctness}%`)
  lines.push(`   Complexity:    ${advice.breakdown.complexity}%`)
  lines.push(`   Style:         ${advice.breakdown.style}%`)
  lines.push(`   Algorithm:     ${advice.breakdown.algorithmic_quality}%`)
  lines.push(`   Maintainable:  ${advice.breakdown.maintainability}%`)

  // Identify main issue
  const lowestMetric = Object.entries(advice.breakdown).reduce((a, b) =>
    a[1] < b[1] ? a : b
  )
  lines.push(`\n⚠️ Main Issue: ${lowestMetric[0]} (${lowestMetric[1]}%)`)

  // Weaknesses
  if (advice.weaknesses.length > 0) {
    lines.push(`\n❌ Weaknesses:`)
    for (const weakness of advice.weaknesses) {
      lines.push(`   • ${weakness}`)
    }
  }

  // Action items
  if (advice.action_items.length > 0) {
    lines.push(`\n🔧 Action Items:`)
    for (const item of advice.action_items) {
      lines.push(`   • ${item}`)
    }
  }

  // Match patterns
  const patterns = matchImprovementPatterns(
    advice.weaknesses,
    advice.action_items
  )

  if (patterns.length > 0) {
    lines.push(`\n💡 SUGGESTED REFACTORING PATTERNS:`)
    lines.push(`${"─".repeat(60)}`)

    for (const pattern of patterns) {
      lines.push(
        `\n📌 Pattern: ${pattern.name.replace(/_/g, " ").toUpperCase()}`
      )
      lines.push(`   ${pattern.suggestion}`)
      lines.push(`\n   Code Example:`)
      for (const line of pattern.codeHint.split("\n")) {
        lines.push(`   ${line}`)
      }
    }
  }

  // General tips based on complexity
  if (advice.breakdown.complexity < 80) {
    lines.push(`\n📋 COMPLEXITY REDUCTION CHECKLIST:`)
    lines.push(`   □ Extract boundary/validation checks into helper functions`)
    lines.push(`   □ Replace if-else chains with lookup tables/objects`)
    lines.push(`   □ Use early returns to handle edge cases first`)
    lines.push(`   □ Consolidate repetitive loop logic`)
    lines.push(
      `   □ Use functional methods (map, filter, reduce) where appropriate`
    )
    lines.push(`   □ Split complex expressions across multiple lines`)
  }

  lines.push(`\n${"=".repeat(60)}`)
  lines.push(
    `After making changes, run: deno task resubmit ${challengeId} ${language}`
  )
  lines.push(
    `To track attempts, the harness logs improvement history in cache.json`
  )

  return lines.join("\n")
}

async function cmdImprove(
  client: AdventJSClient,
  challengeId: number,
  language: "javascript" | "typescript" | "python"
): Promise<void> {
  console.log(
    `\n🎄 AdventJS 2025 - Improve Quality - Challenge ${challengeId}\n`
  )

  const cache = client.getCache()
  const challengeCache = cache.challenges[challengeId]

  if (!challengeCache) {
    console.error(`❌ Challenge ${challengeId} not found in cache.`)
    console.log(`   Run 'deno task fetch ${challengeId}' first.`)
    Deno.exit(1)
  }

  const advice = challengeCache.advice?.[language]

  if (!advice) {
    console.log(`⚠️ No quality feedback cached for ${language}.`)
    console.log(`   Run 'deno task submit ${challengeId} ${language}' first.`)
    Deno.exit(1)
  }

  if (advice.score >= 5) {
    console.log(`✨ Already at 5/5 quality for ${language}!`)
    return
  }

  // Generate and display improvement report
  const report = generateImprovementReport(challengeId, language, advice)
  console.log(report)

  // Show improvement history if exists
  const attempts = challengeCache.improvementAttempts?.[language] || []
  if (attempts.length > 0) {
    console.log(`\n📈 IMPROVEMENT HISTORY:`)
    for (const attempt of attempts) {
      const date = new Date(attempt.timestamp).toLocaleDateString()
      const status = attempt.success ? "✅" : "❌"
      console.log(
        `   ${status} ${date}: ${attempt.previousScore}/5 → ${attempt.newScore}/5 (${attempt.strategyUsed})`
      )
    }
  }

  // Read the current solution file
  const dir = getChallengeDir(challengeId)
  const ext =
    language === "javascript" ? "js" : language === "typescript" ? "ts" : "py"
  const solutionPath = join(dir, `solution.${ext}`)

  try {
    const code = await Deno.readTextFile(solutionPath)
    const lines = code.split("\n").length
    console.log(`\n📄 Current solution: ${solutionPath} (${lines} lines)`)
  } catch {
    console.log(`\n⚠️ Solution file not found: ${solutionPath}`)
  }
}

async function cmdTest(
  challengeId: number,
  language: "javascript" | "typescript" | "python"
): Promise<void> {
  console.log(`\n🧪 Testing Challenge ${challengeId} (${language})\n`)

  const dir = getChallengeDir(challengeId)
  const testFile = join(dir, "test.ts")

  if (!(await fileExists(testFile))) {
    console.error(`❌ Test file not found: ${testFile}`)
    console.log(`   Run 'deno task fetch ${challengeId}' first.`)
    Deno.exit(1)
  }

  try {
    const command = new Deno.Command("deno", {
      args: ["run", "--allow-read", testFile],
      cwd: dir,
      stdout: "inherit",
      stderr: "inherit",
    })

    const { code } = await command.output()

    if (code !== 0) {
      console.log(`\n❌ Tests failed with exit code ${code}`)
      Deno.exit(1)
    }

    console.log(`\n✅ Tests passed!`)
  } catch (error) {
    console.error(`❌ Failed to run tests: ${error}`)
    Deno.exit(1)
  }
}

async function cmdAuto(
  client: AdventJSClient,
  challengeId: number
): Promise<void> {
  console.log(`\n🎄 AdventJS 2025 - Auto Mode - Challenge ${challengeId}\n`)

  const cache = client.getCache()
  const languages: Array<"javascript" | "typescript" | "python"> = [
    "javascript",
    "typescript",
    "python",
  ]

  // Check which languages are already solved
  const challengeCache = cache.challenges[challengeId]
  const remainingLanguages = languages.filter(
    (lang) => !challengeCache?.solved[lang]
  )

  if (remainingLanguages.length === 0) {
    console.log(`✅ All languages already solved!`)
    for (const lang of languages) {
      console.log(`   ${lang}: ⭐ ${challengeCache?.stars[lang] || 0}`)
    }
    return
  }

  console.log(`📝 Languages to solve: ${remainingLanguages.join(", ")}`)

  for (const lang of remainingLanguages) {
    console.log(`\n${"─".repeat(60)}`)

    // Check if solution file exists
    const ext =
      lang === "javascript" ? "js" : lang === "typescript" ? "ts" : "py"
    const solutionPath = join(getChallengeDir(challengeId), `solution.${ext}`)

    if (!(await fileExists(solutionPath))) {
      console.log(`⏭️ Skipping ${lang}: solution.${ext} not found`)
      continue
    }

    await cmdSubmit(client, challengeId, lang)
  }

  console.log(`\n${"─".repeat(60)}`)
  console.log(`\n✅ Auto mode complete for Challenge ${challengeId}`)
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = parseArgs()

  if (args.command === "help") {
    printHelp()
    Deno.exit(0)
  }

  const config = await loadEnv()
  const cache = await loadCache()
  const client = new AdventJSClient(config, cache)

  switch (args.command) {
    case "fetch":
      if (!args.challengeId) {
        console.error("❌ Challenge ID required. Usage: deno task fetch <id>")
        Deno.exit(1)
        return
      }
      await cmdFetch(client, args.challengeId)
      break

    case "submit":
      if (!args.challengeId) {
        console.error(
          "❌ Challenge ID required. Usage: deno task submit <id> <lang>"
        )
        Deno.exit(1)
        return
      }
      await cmdSubmit(
        client,
        args.challengeId,
        args.language || "javascript",
        args.force
      )
      break

    case "status":
      await cmdStatus(client)
      break

    case "titles":
      await client.fetchAllChallengeTitles()
      break

    case "improve":
      if (!args.challengeId) {
        // Show all 4/5 solutions
        console.log(`\n🔍 Scanning for solutions needing improvement...\n`)
        const cache = client.getCache()
        const needsWork: Array<{ id: string; lang: string; score: number }> = []

        for (const [id, challenge] of Object.entries(cache.challenges)) {
          if (challenge.advice) {
            for (const [lang, advice] of Object.entries(challenge.advice)) {
              if (advice.score < 5 && advice.score > 0) {
                needsWork.push({ id, lang, score: advice.score })
              }
            }
          }
        }

        if (needsWork.length === 0) {
          console.log(`✨ All solutions are at 5/5 quality!`)
        } else {
          console.log(
            `📋 Solutions needing improvement (${needsWork.length} total):`
          )
          needsWork.sort((a, b) => parseInt(a.id) - parseInt(b.id))
          for (const { id, lang, score } of needsWork) {
            const title = cache.challenges[id]?.title || `Challenge ${id}`
            console.log(
              `   ${id.padStart(2, "0")}. ${title} (${lang}): ${score}/5`
            )
          }
          console.log(
            `\nRun: deno task improve <id> <lang>  for detailed suggestions`
          )
        }
      } else {
        await cmdImprove(
          client,
          args.challengeId,
          args.language || "javascript"
        )
      }
      break

    case "test":
      if (!args.challengeId) {
        console.error("❌ Challenge ID required. Usage: deno task test <id>")
        Deno.exit(1)
        return
      }
      await cmdTest(args.challengeId, args.language || "javascript")
      break

    case "auto":
      if (!args.challengeId) {
        console.error("❌ Challenge ID required. Usage: deno task auto <id>")
        Deno.exit(1)
        return
      }
      await cmdAuto(client, args.challengeId)
      break
  }

  Deno.exit(0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  Deno.exit(1)
})
