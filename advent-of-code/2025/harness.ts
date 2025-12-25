#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-run --allow-env

/**
 * Advent of Code Harness
 *
 * Automates running solutions, submitting answers, and tracking progress.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-net --allow-run harness.ts --day 1 --part 1 --submit
 *   deno run --allow-read --allow-write --allow-net --allow-run harness.ts --day 1 --part 2 --print
 *   deno run --allow-read --allow-write --allow-net --allow-run harness.ts --day 1 --auto
 */

import { join } from "std/path"

// Load environment variables from .env file
async function loadEnv() {
  try {
    const envFile = await Deno.readTextFile(".env").catch(() => null)
    if (envFile) {
      for (const line of envFile.split("\n")) {
        const [key, ...valueParts] = line.split("=")
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim()
          if (!value.startsWith("#") && key.trim()) {
            Deno.env.set(key.trim(), value.replace(/^["']|["']$/g, ""))
          }
        }
      }
    }
  } catch {
    // .env file doesn't exist, that's okay
  }
}

await loadEnv()

const AOC_SESSION = Deno.env.get("AOC_SESSION")
const AOC_BASE_URL = Deno.env.get("AOC_BASE_URL") || "https://adventofcode.com"
const RATE_LIMIT_MS = parseInt(Deno.env.get("RATE_LIMIT_MS") || "60000", 10)

interface HarnessConfig {
  day: number
  part?: 1 | 2
  submit: boolean
  print: boolean
  auto: boolean
  year: number
  refreshStars: boolean
  fetchInput: boolean
}

interface StarStatus {
  [day: number]: {
    part1: boolean
    part2: boolean
  }
}

// Helper to get the base path for the advent-of-code directory
// Handles cases where we're in the root, in a year directory (2025/), or elsewhere
function getBasePath(year: number): string {
  const cwd = Deno.cwd()
  // Check if we're already in a year directory (e.g., .../2025/)
  const yearMatch = cwd.match(/(.*[/\\])(\d{4})([/\\]?)$/)
  if (yearMatch && parseInt(yearMatch[2]) === year) {
    // We're in the year directory, go up one level
    return yearMatch[1].replace(/[/\\]$/, "") || yearMatch[1]
  }
  // Check if we're in advent-of-code root
  if (cwd.endsWith("advent-of-code")) {
    return cwd
  }
  // Check if advent-of-code is a subdirectory
  if (cwd.includes("advent-of-code")) {
    const parts = cwd.split(/[/\\]/)
    const adventIndex = parts.indexOf("advent-of-code")
    if (adventIndex !== -1) {
      return parts.slice(0, adventIndex + 1).join("/")
    }
  }
  // Default: assume advent-of-code is a sibling or child
  return join(cwd, "advent-of-code")
}

const getCachePath = (year: number) => {
  const cwd = Deno.cwd()
  // Check if we're already in a year directory (e.g., .../2025/)
  const yearMatch = cwd.match(/(.*[/\\])(\d{4})([/\\]?)$/)
  if (yearMatch && parseInt(yearMatch[2]) === year) {
    // We're in the year directory, save cache here
    return join(cwd, ".stars-cache.json")
  }
  // Otherwise, save in the year-specific directory
  const basePath = getBasePath(year)
  return join(basePath, String(year), ".stars-cache.json")
}

// Helper functions for file operations
async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path)
    return true
  } catch {
    return false
  }
}

async function readTextFile(path: string): Promise<string> {
  return await Deno.readTextFile(path)
}

async function writeTextFile(path: string, content: string): Promise<void> {
  await Deno.writeTextFile(path, content)
}

class AOCClient {
  private lastSubmissionTime = 0
  private sessionCookie: string

  constructor(sessionCookie: string) {
    this.sessionCookie = sessionCookie
  }

  async getStars(year: number, useCache = true): Promise<StarStatus> {
    const cacheFile = getCachePath(year)
    // Try to load from cache first
    if (useCache && (await fileExists(cacheFile))) {
      try {
        const cached = JSON.parse(await readTextFile(cacheFile))
        if (cached.year === year && cached.timestamp > Date.now() - 3600000) {
          // Cache is less than 1 hour old
          return cached.stars || {}
        }
      } catch (error) {
        // Cache invalid, continue to fetch
      }
    }

    try {
      const response = await fetch(`${AOC_BASE_URL}/${year}`, {
        headers: {
          Cookie: `session=${this.sessionCookie}`,
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch stars: ${response.statusText}`)
        return (await this.loadCachedStars(year)) || {}
      }

      const html = await response.text()
      const status: StarStatus = {}

      // Parse HTML to find completed days
      // AoC calendar shows stars in various ways - try multiple patterns
      for (let day = 1; day <= 25; day++) {
        status[day] = { part1: false, part2: false }

        // Pattern 1: Look for calendar completion classes
        // Format: <span class="calendar-daycomplete"> or similar
        const completePatterns = [
          new RegExp(`calendar-daycomplete[^>]*>.*?day-${day}`, "gi"),
          new RegExp(`calendar-verycomplete[^>]*>.*?day-${day}`, "gi"),
          new RegExp(`day-${day}[^>]*calendar-daycomplete`, "gi"),
          new RegExp(`day-${day}[^>]*calendar-verycomplete`, "gi"),
        ]

        let starCount = 0
        for (const pattern of completePatterns) {
          const matches = html.match(pattern)
          if (matches) {
            starCount = Math.max(starCount, matches.length)
          }
        }

        // Pattern 2: Check if the day link shows as completed
        // Look for "Both parts" or completion indicators near the day number
        const dayLinkPattern = new RegExp(
          `day-${day}[^<]*<[^>]*>(?:[^<]*Both parts|.*?\\*\\*)[^<]*`,
          "gi"
        )
        if (dayLinkPattern.test(html)) {
          starCount = Math.max(starCount, 2)
        }

        // Use calendar parsing
        if (starCount > 0) {
          status[day].part1 = starCount >= 1
          status[day].part2 = starCount >= 2
        }
      }

      // For more accurate results, check individual day pages
      // But only do this if calendar parsing didn't find anything (to avoid extra requests)
      // We'll check specific days on-demand when needed

      // Save to cache
      await this.saveStarsCache(year, status)

      return status
    } catch (error) {
      console.warn(`Error fetching stars: ${error}`)
      return (await this.loadCachedStars(year)) || {}
    }
  }

  private async loadCachedStars(year: number): Promise<StarStatus | null> {
    const cacheFile = getCachePath(year)
    if (!(await fileExists(cacheFile))) return null
    try {
      const cached = JSON.parse(await readTextFile(cacheFile))
      return cached.stars || null
    } catch {
      return null
    }
  }

  async saveStarsCache(year: number, stars: StarStatus): Promise<void> {
    try {
      const cacheFile = getCachePath(year)
      await writeTextFile(
        cacheFile,
        JSON.stringify({ year, stars, timestamp: Date.now() }, null, 2)
      )
    } catch (error) {
      // Ignore cache write errors
    }
  }

  async markStarComplete(
    year: number,
    day: number,
    part: 1 | 2
  ): Promise<void> {
    const cached = (await this.loadCachedStars()) || {}
    if (!cached[day]) {
      cached[day] = { part1: false, part2: false }
    }
    cached[day][part === 1 ? "part1" : "part2"] = true
    await this.saveStarsCache(year, cached)
  }

  async fetchInput(year: number, day: number): Promise<string> {
    try {
      const response = await fetch(`${AOC_BASE_URL}/${year}/day/${day}/input`, {
        headers: {
          Cookie: `session=${this.sessionCookie}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch input: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      throw new Error(
        `Error fetching input: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async fetchChallengeText(year: number, day: number): Promise<string> {
    try {
      const response = await fetch(`${AOC_BASE_URL}/${year}/day/${day}`, {
        headers: {
          Cookie: `session=${this.sessionCookie}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch challenge: ${response.statusText}`)
      }

      const html = await response.text()

      // Extract challenge text from HTML
      // The challenge is in <article> tags - there may be multiple articles (Part 1 and Part 2)
      const articleMatches = html.matchAll(
        /<article[^>]*>([\s\S]*?)<\/article>/g
      )
      const articles = Array.from(articleMatches).map((m) => m[1])

      if (articles.length === 0) {
        throw new Error("Could not find challenge text in HTML")
      }

      // Combine all articles (Part 1 and Part 2)
      let challengeText = articles.join("\n\n")

      // Clean up HTML tags and convert to plain text
      // Remove script and style tags
      challengeText = challengeText.replace(
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        ""
      )
      challengeText = challengeText.replace(
        /<style[^>]*>[\s\S]*?<\/style>/gi,
        ""
      )

      // Convert common HTML elements to plain text
      challengeText = challengeText.replace(/<h2[^>]*>/g, "\n## ")
      challengeText = challengeText.replace(/<p[^>]*>/g, "\n")
      challengeText = challengeText.replace(/<pre[^>]*><code[^>]*>/g, "\n```\n")
      challengeText = challengeText.replace(/<\/code><\/pre>/g, "\n```\n")
      challengeText = challengeText.replace(/<code[^>]*>/g, "`")
      challengeText = challengeText.replace(/<\/code>/g, "`")
      challengeText = challengeText.replace(/<em[^>]*>/g, "*")
      challengeText = challengeText.replace(/<\/em>/g, "*")
      challengeText = challengeText.replace(/<strong[^>]*>/g, "**")
      challengeText = challengeText.replace(/<\/strong>/g, "**")
      challengeText = challengeText.replace(/<ul[^>]*>/g, "\n")
      challengeText = challengeText.replace(/<li[^>]*>/g, "- ")
      challengeText = challengeText.replace(/<\/li>/g, "\n")
      challengeText = challengeText.replace(/<\/ul>/g, "\n")
      challengeText = challengeText.replace(/<ol[^>]*>/g, "\n")
      challengeText = challengeText.replace(/<\/ol>/g, "\n")

      // Remove all remaining HTML tags
      challengeText = challengeText.replace(/<[^>]+>/g, "")

      // Decode HTML entities
      challengeText = challengeText.replace(/&lt;/g, "<")
      challengeText = challengeText.replace(/&gt;/g, ">")
      challengeText = challengeText.replace(/&amp;/g, "&")
      challengeText = challengeText.replace(/&quot;/g, '"')
      challengeText = challengeText.replace(/&#39;/g, "'")
      challengeText = challengeText.replace(/&nbsp;/g, " ")

      // Clean up whitespace
      challengeText = challengeText.replace(/\n{3,}/g, "\n\n")
      challengeText = challengeText.trim()

      return challengeText
    } catch (error) {
      throw new Error(
        `Error fetching challenge: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async checkDayCompletion(
    year: number,
    day: number
  ): Promise<{ part1: boolean; part2: boolean }> {
    // Check the actual day page for accurate completion status
    try {
      const dayResponse = await fetch(`${AOC_BASE_URL}/${year}/day/${day}`, {
        headers: {
          Cookie: `session=${this.sessionCookie}`,
        },
      })
      if (dayResponse.ok) {
        const dayHtml = await dayResponse.text()

        // Look for various completion indicators
        // AoC shows different messages depending on completion status
        const completionPatterns = {
          part1: [
            /You have completed the first part/i,
            /Both parts of this puzzle are complete/i,
            /You have completed both parts/i,
            /<p>Both parts of this puzzle are complete/i,
            /<p class="day-success">/i,
            // Check for the absence of "answer" input (means completed)
            !dayHtml.includes('name="answer"') &&
              dayHtml.includes("--- Part Two ---"),
          ],
          part2: [
            /Both parts of this puzzle are complete/i,
            /You have completed both parts/i,
            /<p>Both parts of this puzzle are complete/i,
            // If part 2 is complete, there's no answer input
            !dayHtml.includes('name="answer"') &&
              dayHtml.includes("--- Part Two ---"),
          ],
        }

        const part1Complete = completionPatterns.part1.some((pattern) => {
          if (typeof pattern === "boolean") return pattern
          if (pattern instanceof RegExp) return pattern.test(dayHtml)
          return dayHtml.includes(pattern as string)
        })

        const part2Complete = completionPatterns.part2.some((pattern) => {
          if (typeof pattern === "boolean") return pattern
          if (pattern instanceof RegExp) return pattern.test(dayHtml)
          return dayHtml.includes(pattern as string)
        })

        // Also check: if there's no answer form, both parts are likely complete
        // If there's only one answer form, part 1 is complete
        const hasAnswerForm = dayHtml.includes('name="answer"')
        const hasPart2Header = dayHtml.includes("--- Part Two ---")

        if (!hasAnswerForm && hasPart2Header) {
          return { part1: true, part2: true }
        } else if (
          hasPart2Header &&
          dayHtml.match(/name="answer"/g)?.length === 1
        ) {
          // Only one answer form means part 1 is done, part 2 is not
          return { part1: true, part2: false }
        }

        return {
          part1: part1Complete,
          part2: part2Complete,
        }
      }
    } catch (error) {
      console.warn(`Error checking day ${day} completion: ${error}`)
    }
    return { part1: false, part2: false }
  }

  async submitAnswer(
    year: number,
    day: number,
    part: 1 | 2,
    answer: string | number
  ): Promise<{ success: boolean; message: string }> {
    const client = this
    // Rate limiting
    const now = Date.now()
    const timeSinceLastSubmission = now - this.lastSubmissionTime
    if (timeSinceLastSubmission < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastSubmission
      console.log(
        `⏳ Rate limit: waiting ${Math.ceil(waitTime / 1000)} seconds...`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    try {
      const response = await fetch(
        `${AOC_BASE_URL}/${year}/day/${day}/answer`,
        {
          method: "POST",
          headers: {
            Cookie: `session=${this.sessionCookie}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `level=${part}&answer=${encodeURIComponent(String(answer))}`,
        }
      )

      this.lastSubmissionTime = Date.now()

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const html = await response.text()

      // Parse response
      if (html.includes("That's the right answer")) {
        // Mark as complete in cache
        await this.markStarComplete(year, day, part)

        // If part 1 was just completed, update challenge file to include part 2
        if (part === 1) {
          try {
            const dayStr = String(day).padStart(2, "0")
            const basePath = getBasePath(year)

            // Always use the new semantic structure: ${year}/${dayStr}/
            const challengeDir = join(basePath, `${year}/${dayStr}`)
            const challengeFile = join(challengeDir, "challenge.txt")

            // Create directory if it doesn't exist
            try {
              await Deno.mkdir(challengeDir, { recursive: true })
            } catch (error) {
              // Directory might already exist, that's fine
              if (!(error instanceof Deno.errors.AlreadyExists)) {
                throw error
              }
            }

            console.log("\n🔄 Updating challenge file with Part 2...")
            const challengeText = await this.fetchChallengeText(year, day)
            await writeTextFile(challengeFile, challengeText + "\n")
            console.log("✅ Challenge file updated with Part 2")
          } catch (error) {
            // Non-fatal, just log
            console.warn(`⚠️  Could not update challenge file: ${error}`)
          }
        }

        return { success: true, message: "✅ Correct answer!" }
      } else if (html.includes("That's not the right answer")) {
        const tooLow = html.includes("too low")
        const tooHigh = html.includes("too high")
        return {
          success: false,
          message: `❌ Wrong answer${
            tooLow ? " (too low)" : tooHigh ? " (too high)" : ""
          }`,
        }
      } else if (html.includes("You gave an answer too recently")) {
        const waitMatch = html.match(/You have ([\d]+) ([\w]+) left to wait/)
        return {
          success: false,
          message: `⏳ Too soon! ${
            waitMatch ? waitMatch[0] : "Please wait before submitting again."
          }`,
        }
      } else if (
        html.includes("You don't seem to be solving the right level")
      ) {
        return {
          success: false,
          message: "⚠️ Part 1 must be completed before Part 2",
        }
      } else {
        return {
          success: false,
          message: "❓ Unknown response from server",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }
    }
  }
}

class AnswerParser {
  static parse(output: string): { part1?: string; part2?: string } {
    const result: { part1?: string; part2?: string } = {}

    // Try various patterns
    const patterns = [
      /Part\s*1[:\s]+(\d+)/i,
      /part\s*1[:\s]+(\d+)/i,
      /Part\s*1[:\s]+(\S+)/i,
      /^(\d+)$/m, // Just a number on its own line
    ]

    for (const pattern of patterns) {
      const match = output.match(pattern)
      if (match) {
        result.part1 = match[1]
        break
      }
    }

    const part2Patterns = [
      /Part\s*2[:\s]+(\d+)/i,
      /part\s*2[:\s]+(\d+)/i,
      /Part\s*2[:\s]+(\S+)/i,
    ]

    for (const pattern of part2Patterns) {
      const match = output.match(pattern)
      if (match) {
        result.part2 = match[1]
        break
      }
    }

    return result
  }
}

class SolutionRunner {
  static async run(day: number, year: number): Promise<string> {
    // Try different file naming patterns (new semantic structure first)
    const dayStr = String(day).padStart(2, "0")
    const basePath = getBasePath(year)

    const possiblePaths = [
      // New semantic structure: 01/solution.ts
      join(basePath, `${year}/${dayStr}/solution.ts`),
      join(basePath, `${year}/${day}/solution.ts`),
      join(basePath, `${year}/${dayStr}/code.ts`),
      join(basePath, `${year}/${day}/code.ts`),
      // Legacy structures for backwards compatibility
      join(basePath, `${year}/day-${dayStr}/day.${dayStr}.code.ts`),
      join(basePath, `${year}/day-${dayStr}/day.${dayStr}.ts`),
      join(basePath, `${year}/day-${day}/day.${day}.code.ts`),
      join(basePath, `${year}/day-${day}/day.${day}.ts`),
      join(basePath, `${year}/day${dayStr}.code.ts`),
      join(basePath, `${year}/day${dayStr}.ts`),
      join(basePath, `${year}/day${day}.code.ts`),
      join(basePath, `${year}/day${day}.ts`),
    ]

    const pathChecks = await Promise.all(
      possiblePaths.map(async (p) => ({ path: p, exists: await fileExists(p) }))
    )
    const codePath = pathChecks.find(({ exists }) => exists)?.path

    if (!codePath) {
      throw new Error(
        `Solution file not found. Tried:\n${possiblePaths
          .map((p) => `  - ${p}`)
          .join("\n")}`
      )
    }

    try {
      // Run from the directory containing the solution file so relative paths work
      const solutionDir = join(codePath, "..")
      const command = new Deno.Command("deno", {
        args: ["run", "--allow-read", "--allow-write", "--allow-net", codePath],
        cwd: solutionDir,
        stdout: "piped",
        stderr: "piped",
      })

      const { code, stdout, stderr } = await command.output()
      const output = new TextDecoder().decode(stdout)
      const errorOutput = new TextDecoder().decode(stderr)

      if (code !== 0) {
        throw new Error(
          `Execution failed with code ${code}:\n${errorOutput}\n${output}`
        )
      }

      return output
    } catch (error: any) {
      throw new Error(
        `Execution failed: ${error.message}\n${error.stdout || ""}\n${
          error.stderr || ""
        }`
      )
    }
  }
}

function parseArgs(): HarnessConfig {
  const args = process.argv.slice(2)
  const config: HarnessConfig = {
    day: 1,
    submit: false,
    print: true,
    auto: false,
    year: 2025,
    refreshStars: false,
    fetchInput: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case "--day":
      case "-d":
        config.day = parseInt(nextArg, 10)
        i++
        break
      case "--part":
      case "-p":
        config.part = parseInt(nextArg, 10) as 1 | 2
        i++
        break
      case "--submit":
      case "-s":
        config.submit = true
        break
      case "--print":
        config.print = true
        break
      case "--auto":
      case "-a":
        config.auto = true
        break
      case "--year":
      case "-y":
        config.year = parseInt(nextArg, 10)
        i++
        break
      case "--refresh-stars":
      case "-r":
        config.refreshStars = true
        break
      case "--fetch-input":
      case "-f":
        config.fetchInput = true
        break
      case "--help":
      case "-h":
        console.log(`
Advent of Code Harness

Usage:
  deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts [options]

Options:
  --day, -d <number>     Day to run (1-25)
  --part, -p <number>    Part to run (1 or 2)
  --submit, -s           Submit answer to AoC
  --print                 Print answer (default: true)
  --auto, -a              Auto-detect and submit both parts
  --year, -y <number>     Year (default: 2025)
  --refresh-stars, -r     Force refresh star cache from server
  --fetch-input, -f       Fetch input file from AoC
  --help, -h              Show this help

Examples:
  deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts --day 1 --part 1 --print
  deno run --allow-read --allow-write --allow-net --allow-run --allow-env harness.ts --day 1 --part 2 --submit
  tsx harness.ts --day 1 --auto
        `)
        Deno.exit(0)
    }
  }

  return config
}

async function main() {
  const config = parseArgs()
  const client = new AOCClient(String(AOC_SESSION))

  console.log(`🎄 Advent of Code ${config.year} - Day ${config.day}\n`)

  // Fetch input and challenge if requested
  if (config.fetchInput) {
    const dayStr = String(config.day).padStart(2, "0")
    const basePath = getBasePath(config.year)

    // Always use the new semantic structure: ${year}/${dayStr}/
    const targetDir = join(basePath, `${config.year}/${dayStr}`)

    // Create the directory if it doesn't exist
    try {
      await Deno.mkdir(targetDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's fine
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error
      }
    }

    // Use new semantic filenames
    const inputFile = join(targetDir, "input.txt")
    const challengeFile = join(targetDir, "challenge.txt")

    try {
      console.log("📥 Fetching input from AoC...")
      const input = await client.fetchInput(config.year, config.day)
      await writeTextFile(inputFile, input.trimEnd() + "\n")
      console.log(`✅ Input saved to: ${inputFile}`)

      console.log("📥 Fetching challenge text from AoC...")
      const challengeText = await client.fetchChallengeText(
        config.year,
        config.day
      )
      await writeTextFile(challengeFile, challengeText + "\n")
      console.log(`✅ Challenge text saved to: ${challengeFile}\n`)
      return
    } catch (error) {
      console.error(`❌ Failed to fetch: ${error}`)
      Deno.exit(1)
    }
  }

  // Check star status
  let stars = await client.getStars(config.year, !config.refreshStars)
  let dayStars = stars[config.day] || { part1: false, part2: false }

  // If refresh requested or if we don't have accurate data, check the specific day
  if (config.refreshStars || (!dayStars.part1 && !dayStars.part2)) {
    console.log("🔍 Checking day completion status...")
    const accurateStatus = await client.checkDayCompletion(
      config.year,
      config.day
    )
    dayStars = accurateStatus
    // Update cache
    stars[config.day] = accurateStatus
    await client.saveStarsCache(config.year, stars)

    if (accurateStatus.part1 || accurateStatus.part2) {
      console.log(
        `⭐ Day ${config.day} status: Part 1: ${
          accurateStatus.part1 ? "✅" : "❌"
        }, Part 2: ${accurateStatus.part2 ? "✅" : "❌"}\n`
      )
    }
  }

  if (config.refreshStars) {
    console.log("🔄 Star cache refreshed from server\n")
  }

  if (dayStars.part1 && dayStars.part2) {
    console.log("⭐ Both parts already completed!")
    if (!config.submit && !config.auto) {
      Deno.exit(0)
    }
    // If auto mode and both parts done, still run solution to show output, then exit
    if (config.auto && !config.print) {
      // In auto mode with both parts done, just exit
      Deno.exit(0)
    }
  } else if (dayStars.part1 && config.part === 1) {
    console.log("⭐ Part 1 already completed!")
    if (!config.submit && !config.auto) {
      Deno.exit(0)
    }
  } else if (dayStars.part2 && config.part === 2) {
    console.log("⭐ Part 2 already completed!")
    if (!config.submit && !config.auto) {
      Deno.exit(0)
    }
  }

  // Run solution
  console.log("🚀 Running solution...")
  let output: string
  try {
    output = await SolutionRunner.run(config.day, config.year)
  } catch (error) {
    console.error(`❌ Failed to run solution: ${error}`)
    Deno.exit(1)
    return // TypeScript doesn't know Deno.exit() never returns
  }

  // Parse answers
  const answers = AnswerParser.parse(output)

  if (!answers.part1 && !answers.part2) {
    console.warn(
      "⚠️  No answers found in output. Make sure your solution prints 'Part 1: <answer>' and/or 'Part 2: <answer>'"
    )
  }

  if (!answers.part1 && !answers.part2) {
    console.warn(
      "⚠️  No answers found in output. Make sure your solution prints 'Part 1: <answer>' and/or 'Part 2: <answer>'"
    )
  }

  if (config.print) {
    console.log("\n📊 Output:")
    console.log(output)
    console.log("\n📝 Parsed answers:")
    if (answers.part1) console.log(`  Part 1: ${answers.part1}`)
    if (answers.part2) console.log(`  Part 2: ${answers.part2}`)
  }

  // Submit if requested
  if (config.submit || config.auto) {
    if (config.auto) {
      let submittedAny = false

      // Submit both parts if we have answers
      if (answers.part1 && !dayStars.part1) {
        console.log(`\n📤 Submitting Part 1: ${answers.part1}`)
        const result = await client.submitAnswer(
          config.year,
          config.day,
          1,
          answers.part1
        )
        console.log(result.message)

        if (result.success) {
          console.log(`\n🎉 Part 1 complete!`)
          submittedAny = true
          // Wait before submitting part 2
          console.log(
            `⏳ Waiting ${
              RATE_LIMIT_MS / 1000
            } seconds before submitting Part 2...`
          )
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS))
        }
      }

      if (answers.part2 && !dayStars.part2) {
        console.log(`\n📤 Submitting Part 2: ${answers.part2}`)
        const result = await client.submitAnswer(
          config.year,
          config.day,
          2,
          answers.part2
        )
        console.log(result.message)

        if (result.success) {
          console.log(`\n🎉 Part 2 complete!`)
          submittedAny = true
        }
      }

      // Auto mode complete, exit cleanly
      if (!submittedAny && dayStars.part1 && dayStars.part2) {
        console.log("\n✅ All parts already completed, nothing to submit.")
      }
      Deno.exit(0)
    } else if (config.part) {
      const answer = config.part === 1 ? answers.part1 : answers.part2
      if (!answer) {
        console.error(`❌ No answer found for Part ${config.part}`)
        Deno.exit(1)
      }

      console.log(`\n📤 Submitting Part ${config.part}: ${answer}`)
      const result = await client.submitAnswer(
        config.year,
        config.day,
        config.part,
        answer!
      )
      console.log(result.message)

      if (!result.success && result.message.includes("too recently")) {
        console.log("\n💡 Tip: Wait a minute before trying again")
      }

      if (result.success) {
        console.log(`\n🎉 Part ${config.part} complete!`)
      }

      // Submit mode complete, exit cleanly
      Deno.exit(result.success ? 0 : 1)
    } else {
      console.error("❌ --part required when using --submit")
      Deno.exit(1)
    }
  }

  // If we get here and nothing was submitted, exit cleanly
  Deno.exit(0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  Deno.exit(1)
})
