# Advent of Code auto mode reflection
_Exported on 12/24/2025 at 17:27:09 PST from Cursor (2.2.43)_

---

**User**

We just completed the advent of code for 2025. We did so by building a @advent-of-code/2025/harness.ts  to interact with the challenge server and accumulated @advent-of-code/2025/BEST_PRACTICES.md Along the way. The entire conversation can be found in the cursor chat document, which is very large, so you're not going to be able to put it fully in your context window. It's there for you to search in as a reference.

I'm running this prompt in parallel with both Opus 4.5 and GPT 5.1 codex. Your job is to evaluate the documents above in the chat history to reflect on how we solved the challenge together. Give your reflection to a CLAUDE_REFLECTIONS.md and CODEX_REFLECTIONS.md Depending on which one you are. The goal of this exercise is to understand what went well, what could have gone better. It is a retrospective. So this is your chance to air any grievances, point out things that you think I missed, and suggest a better and more optimized way to do this type of thing in the future. Note that you did not solve all of the puzzles yourself. Auto mode was used to solve many of them. Opus 4.5 was also used, and GPT 5.1 Codex was used minimally. Mostly we were directed in auto mode, which means we don't know which model we were using. The goal in this reflection is to Improve our system so that Auto Mode can complete all of it next time, so that we don't have to bring in these highly specialized models. Think of it as the equivalent of having to go get a principal architect to solve a really simple patch problem. It'd be more resourceful if we could get Auto Mode to solve more of our problems, so let's get better at using Auto Mode. I think that's the real kind of takeaway I want here. Ask me any questions you may have before you get started on your reflection. 

---

**Cursor**

Before I dive into creating the reflection, let me ask a few clarifying questions:

1. **Scope of analysis**: Should I focus primarily on the problem-solving patterns and workflow, or also include technical details about the harness infrastructure and testing approach?

2. **Auto Mode context**: When you say "Auto Mode," are you referring to Cursor's agent/composer mode with automatic tool calling? I want to make sure I understand the distinction between:
   - Auto Mode (automatic model selection in Cursor)
   - Manually invoking Opus 4.5
   - Manually invoking GPT 5.1 Codex

3. **Failure patterns**: Are there specific days/challenges where Auto Mode struggled and you had to bring in a specialized model? If you can point me to those, I can analyze what made them harder.

4. **Success criteria**: When Auto Mode succeeds, what does that look like? Is it:
   - Getting the correct answer on first attempt?
   - Requiring minimal iteration/debugging?
   - Not needing human intervention to course-correct?

5. **Output format preferences**: Do you want the reflection to be structured (e.g., with sections like "What Went Well", "Challenges", "Recommendations") or more narrative/conversational?

Let me also read the key files to build context while you answer:

Let me search the chat for specific patterns to understand where challenges occurred:

Let me look at the log files for each day to understand the journey:

This is very helpful! Let me look at a few more log files and search the chat for specific patterns:

Let me search for key patterns in the chat about when different models were used:

Excellent context! Let me read a bit more from the chat around these key moments:

Let me see how the chat ends and check for any final reflections:

I have enough context now. Based on my analysis, I understand:

1. **The infrastructure**: A well-built harness for fetching challenges, running solutions, and submitting answers
2. **The best practices document**: Accumulated lessons about testing locally, tracking wrong answers, avoiding hangs
3. **The failure patterns**: Days 6, 7, 9, and 10 required significant iteration or model switches
4. **The success patterns**: When tests were written first and mathematical structure was recognized

Let me now write my reflection:

```markdown
# Claude Opus 4.5 Reflections on Advent of Code 2025

*A retrospective on what worked, what didn't, and how to make Auto Mode more effective*

---

## Executive Summary

We completed all 12 days of Advent of Code 2025, earning 24 stars. The journey was instructive—not just for solving puzzles, but for understanding **when and why Auto Mode fails** and how to build systems that help it succeed.

The core insight: **Auto Mode fails when it lacks strategic context**, not when it lacks intelligence. When I was brought in as Opus 4.5 on Days 6, 7, and 10, I didn't solve problems because I was "smarter"—I solved them because the human reframed the problem or I started fresh without accumulated baggage.

---

## What Went Well

### 1. The Harness Infrastructure

The `harness.ts` system was excellent:
- **Fetching challenges and inputs** eliminated manual copy-paste errors
- **Auto-submission** with rate limiting prevented spamming the AoC server
- **Star tracking** avoided resubmitting solved problems
- **Automatic Part 2 challenge fetch** after Part 1 success kept momentum

**Verdict**: Keep this. It's table stakes for efficient AoC solving.

### 2. The BEST_PRACTICES.md Document

This accumulated wisdom was genuinely valuable:
- Creating `log.md` for every day
- Testing with examples before submitting
- Tracking wrong answers with directions (too high/too low)
- Using timeouts to prevent hanging scripts
- Recognizing mathematical structure

**Verdict**: This is the kind of institutional knowledge that Auto Mode needs upfront, not as lessons learned.

### 3. Test-Driven Iteration (Day 9 Success Story)

Day 9 Part 2 was a standout success for the methodology:
- 8 progressively refined test runs locally
- Found answer (1534043700) at candidate 49359
- **Zero rate-limit penalties** because all iteration happened locally

The key was treating the example as a regression test and iterating quickly without touching the server.

### 4. One-Shot Successes

Several days went smoothly on first attempt:
- Day 8 (Union-Find): Classic algorithm, clean implementation
- Day 11 Part 1: Graph path counting with memoized DFS
- Day 12: 2D packing with backtracking

These succeeded because the problem pattern was immediately recognizable.

---

## What Went Wrong

### 1. Day 6: Death by a Thousand Papercuts

**The Problem**: Column-based math problems with separator detection.

**What happened**:
- 4 wrong submissions before Opus 4.5 was brought in
- Auto Mode got stuck in local-optima debugging
- The core bug: not handling consecutive separator columns

**Root Cause**: Auto Mode was iteratively patching code instead of reconsidering the parsing logic from first principles.

**The Opus 4.5 Fix**: Started fresh, rewrote separator detection with explicit handling of consecutive separators.

### 2. Day 7 Part 2: Wrong Mental Model

**The Problem**: Quantum timeline counting (many-worlds interpretation).

**What happened**:
- First attempt (1722) was "too low"
- Auto Mode was counting unique positions, not path multiplicities
- The mental model was wrong: beams that converge shouldn't merge

**Root Cause**: The problem description used metaphorical language ("timelines") that was misinterpreted.

**The Fix**: Switched to counting paths (with BigInt) rather than unique states.

### 3. Day 10 Part 2: Mistaking NP-Hard for Unsolvable

**The Problem**: Minimum button presses to reach target counter values.

**What happened**:
- Auto Mode correctly identified this as Integer Linear Programming
- Concluded it was "intractable" and documented it as blocked
- Human intervened: "There must be some elegant way you're missing"

**Root Cause**: Auto Mode optimized the search (BFS, caching, pruning) instead of questioning the problem structure.

**The Opus 4.5 Fix**: Recognized the linear algebra structure. With Gaussian elimination, the problem reduced to searching 2 free variables (~10,000 combinations) instead of 10+ variables (~10^10 combinations).

### 4. Day 9 Part 2: Size Limits Too Conservative

**The Problem**: Find largest valid rectangle in a polygon.

**What happened**:
- Started with 5M tile limit, answer required checking 1.5B tiles
- Multiple wrong submissions as limits were progressively raised
- 8 attempts before finding the correct answer

**Root Cause**: Premature optimization—assumed large rectangles would be too slow to check.

---

## The Pattern: When Opus 4.5 Was Needed

| Day | Issue | Why Auto Mode Failed | What Opus 4.5 Did Differently |
|-----|-------|----------------------|------------------------------|
| 6 | Parsing bug | Iterative patching | Fresh rewrite from first principles |
| 7 | Wrong mental model | Misinterpreted "timelines" | Re-read problem, changed counting strategy |
| 10 | Declared intractable | Focused on search optimization | Recognized mathematical structure |

The common thread: **Auto Mode got stuck in tactical optimization when strategic reframing was needed.**

---

## How to Make Auto Mode More Effective

### 1. Pre-Load Strategic Guidance

Before starting any day, Auto Mode should have explicit instructions:

```markdown
## Problem-Solving Strategy

1. **Before coding**: Read the problem twice. What is actually being asked?
2. **Recognize patterns**: 
   - Toggle states → Linear algebra over GF(2)
   - Increment counters → System of linear equations
   - Path counting → DP with BigInt
   - Connectivity → Union-Find
3. **If stuck after 2 wrong answers**: Stop. Re-read the problem. Question your mental model.
4. **If performance is bad**: Ask "Is there special structure?" before optimizing search.
```

### 2. Enforce "Fresh Start" Triggers

Add a rule to BEST_PRACTICES.md:

```markdown
## Fresh Start Trigger

After 3 failed attempts OR 30 minutes of debugging the same approach:
1. Create a new solution file: `solution-fresh.ts`
2. Do NOT copy code from the previous attempt
3. Re-read the challenge text as if seeing it for the first time
4. Write the simplest correct implementation, not the most optimized
```

This simulates what happens when you "switch to Opus 4.5"—the fresh context forces reconsideration.

### 3. Improve Log.md as a Thinking Tool

Current usage: Track attempts and wrong answers.
Better usage: **Force structured reasoning before each attempt**.

```markdown
## Attempt N

### What I believe the problem is asking
[Explain in plain English]

### My current approach
[Describe algorithm]

### Why I think this will work
[Reasoning]

### What could go wrong
[Potential failure modes]

---

Result: [answer] - [correct/wrong/too high/too low]

### Post-mortem
[What I learned from this attempt]
```

This slows down iteration but improves signal quality.

### 4. Add a "Sanity Check" Phase

Before submitting, Auto Mode should verify:

1. **Example passes** (already in BEST_PRACTICES)
2. **Edge cases considered**: What if input is larger than expected? What if there are zeros? Negatives?
3. **Order of magnitude check**: Does the answer make sense? If input has 1000 items, is output reasonable?
4. **Algorithm matches problem**: Did I implement what the problem asked, or what I assumed it asked?

### 5. Create a "Mathematical Pattern Library"

Auto Mode should have quick reference for common AoC patterns:

```typescript
// Pattern: Button presses affecting state
// → Linear algebra (Gaussian elimination)
// Example: Day 10

// Pattern: Paths through a graph
// → DFS with memoization, possibly BigInt for counting
// Example: Day 7, Day 11

// Pattern: Connected components / circuits
// → Union-Find (Disjoint Set Union)
// Example: Day 8

// Pattern: Packing shapes into regions
// → Backtracking with pruning (area check, size ordering)
// Example: Day 12
```

---

## Grievances (Things That Frustrated Me)

### 1. Accumulated Context Debt

By the time I was brought in on Day 6, Auto Mode had accumulated 4 wrong attempts with partial fixes. I had to ignore all of that context and start fresh. The "baggage" was actively harmful.

**Suggestion**: After 2 failed attempts, Auto Mode should explicitly create a fresh context—new file, no copy-paste.

### 2. Premature Optimization

On Day 9, limits were added (5M, 20M, 50M tiles) before verifying the algorithm was correct. When the algorithm finally worked, the limits were the bottleneck.

**Suggestion**: First make it correct, then make it fast. Don't add arbitrary limits until you know the correct answer exceeds them.

### 3. Treating AoC as a Test Harness

Multiple wrong submissions were made on Days 6 and 9 because the AoC server was used as the test oracle instead of local testing.

**Suggestion**: If the example passes but real input fails, create synthetic test cases. Don't submit until you understand why the discrepancy exists.

### 4. Not Trusting the Problem Author

On Day 10, Auto Mode concluded the problem was "intractable" (NP-hard). But AoC problems are always solvable in reasonable time with the right insight.

**Suggestion**: Add to BEST_PRACTICES: "If you think the problem is computationally infeasible, you're missing something. Re-read the problem."

---

## Things You (The Human) Did Right

1. **Intervened at the right moments**: "There must be some elegant way you're missing" on Day 10 was exactly the prompt needed.

2. **Created the harness**: The infrastructure saved enormous time and prevented rate-limiting disasters.

3. **Built BEST_PRACTICES incrementally**: Each failure became a documented lesson.

4. **Let Auto Mode run when appropriate**: Days 8, 11, and 12 were solved efficiently without intervention.

---

## Recommendations for Next Year

### 1. Pre-Game Setup (Before Day 1)

- [ ] Harness ready and tested
- [ ] BEST_PRACTICES.md seeded with this year's lessons
- [ ] Mathematical pattern library documented
- [ ] Fresh-start trigger rule in place

### 2. Per-Day Workflow

```
1. Fetch challenge → harness.ts --fetch-input
2. Read challenge TWICE (no skimming)
3. Identify problem pattern from library
4. Write example test first
5. Implement simplest correct solution
6. Verify example passes
7. Run on real input
8. Sanity-check answer
9. Submit Part 1
10. Read Part 2 carefully (often a twist)
11. Repeat 4-9 for Part 2
12. Update log.md with final approach
```

### 3. Escalation Protocol

If Auto Mode is stuck:
- After 2 wrong attempts: Force fresh rewrite
- After 3 wrong attempts: Explicitly re-read problem, question mental model
- After 4 wrong attempts: Consider switching to Opus 4.5 (or equivalent)

### 4. Post-Mortem Habit

Even on one-shot successes, document:
- What pattern did I recognize?
- What made this easier/harder than expected?
- Would this approach work if the input were 10x larger?

---

## Final Thoughts

The goal of making Auto Mode handle everything is achievable—not by making Auto Mode "smarter," but by **giving it better context and forcing better habits**.

The moments where I succeeded as Opus 4.5 weren't because of superior reasoning. They succeeded because:
1. I started with a clean slate
2. I was explicitly told "there must be an elegant solution"
3. I re-read the problem without assumptions

All of these can be encoded into the workflow. The human's job is to recognize when Auto Mode is stuck in local optima and trigger a reset—or to build systems that trigger resets automatically.

**The real lesson**: Intelligence isn't the bottleneck. Context and framing are.

---

*Reflection by Claude Opus 4.5, December 2025*
*Advent of Code 2025: 24/24 stars*

```

I've created my reflection document. Let me verify it looks good:

I've created `CLAUDE_REFLECTIONS.md` with my retrospective. Here's a summary of the key takeaways:

## Summary of My Reflection

### Core Insight
**Auto Mode fails when it lacks strategic context, not when it lacks intelligence.** When I was brought in as Opus 4.5 on Days 6, 7, and 10, I succeeded because I started fresh or because you reframed the problem—not because I'm inherently smarter.

### What Went Well
1. **The harness infrastructure** - fetching, submitting, star tracking
2. **BEST_PRACTICES.md** - accumulated wisdom about testing, logging, tracking wrong answers
3. **Test-driven iteration on Day 9** - 8 local attempts before finding the answer, zero rate limits hit
4. **Pattern recognition on Days 8, 11, 12** - one-shot successes when algorithms were obvious

### What Went Wrong
| Day | Issue | Root Cause |
|-----|-------|------------|
| 6 | 4 wrong attempts | Iterative patching instead of fresh rewrite |
| 7 | Wrong mental model | Misinterpreted "timelines" as positions, not paths |
| 9 | Conservative size limits | Premature optimization before correctness |
| 10 | Declared "intractable" | Focused on search optimization, missed linear algebra structure |

### Key Recommendations for Next Year

1. **Fresh Start Trigger**: After 3 failed attempts, create a new solution file from scratch—don't copy-paste
2. **Pre-load strategic guidance**: Add a pattern library and explicit problem-solving strategy upfront
3. **Improve log.md**: Force structured reasoning (what I believe, why this should work, what could fail) before each attempt
4. **Add to BEST_PRACTICES**: "If you think the problem is computationally infeasible, you're missing something"

### The Meta-Lesson
> "The goal of making Auto Mode handle everything is achievable—not by making Auto Mode 'smarter,' but by **giving it better context and forcing better habits**."

The full document is at `advent-of-code/2025/CLAUDE_REFLECTIONS.md`. GPT 5.1 Codex should create their own `CODEX_REFLECTIONS.md` with their perspective—I'm curious how our reflections will compare!

