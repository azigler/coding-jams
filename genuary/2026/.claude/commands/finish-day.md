---
description: Complete a Genuary day with reflection, revision, and documentation
---

# /finish-day - Complete a Genuary Day

This command guides the completion and documentation of a Genuary day. **Reflection is mandatory.**

## Usage

```
/finish-day 12
/finish-day      # Will detect current day from context
```

## MANDATORY COMPLETION SEQUENCE

### Step 1: Test the Implementation

```bash
cd genuary/2026
bun run build    # Must pass
bun run dev      # Must render correctly at #dayN
```

Verify:
- [ ] No TypeScript errors
- [ ] Renders without console errors
- [ ] All controls function
- [ ] Animation/interaction works as intended

### Step 2: Visual Review and Bug Fixes

**CRITICAL: Review the work visually BEFORE capturing any assets.**

Navigate to the day in the browser and watch the full animation cycle. Look for:
- Background color issues (jarring transitions, inconsistent colors)
- Rendering artifacts (stray elements, sizing mismatches, z-fighting)
- Animation glitches (stuttering, wrong timing, broken easing)
- UI issues (overlapping elements, incorrect positioning)

**Fix any visual bugs before proceeding.** Do not capture assets for broken work.

### Step 3: Critical Self-Review

**Be brutally honest.** Answer these questions:

1. **Does this look like previous days?**
   - Compare visually to Days 7-11
   - If yes, what specifically is too similar?

2. **Does this evoke the emotion I targeted?**
   - What emotion did you target?
   - Does a fresh viewing actually evoke it?

3. **Is this memorable?**
   - What would someone remember about this piece tomorrow?
   - If the answer is "nothing specific," it's not done.

4. **Did I take a real risk?**
   - What was technically or artistically challenging?
   - If everything felt safe, reconsider.

5. **Would I be proud to share this?**
   - Not "is it working" but "is it good"

### Step 4: Decide: Ship or Revise

Based on your self-review:

**If you answered "no" to questions 2-5, you must revise.**

Revision options:
- Change the color palette entirely
- Alter the motion/timing significantly
- Add or remove a major visual element
- Reconsider the medium (switch to WebGL?)
- Start over with a different direction

**It is better to ship something good late than something mediocre on time.**

### Step 5: Capture Assets (Image and GIF)

**Use the in-app buttons — do NOT use external recording tools.**

1. Set controls to your recommended settings (Claude's Choice)
2. Click the **"Download Image"** button to capture a still
3. Click the **"Record GIF"** button to capture the animation
4. Wait for downloads to complete
5. Verify the files look correct before proceeding

The harness handles encoding, timing, and file naming. Trust it.

### Step 6: Write Your Manifesto

Create `.claude/manifesto/day-N-[your-title-slug].md`

**DO NOT copy the format of previous manifestos.** Your manifesto should have:

Required sections (in YOUR format):
1. What you made and why
2. What you learned (technical AND artistic)
3. What you'd tell the next agent (be specific, not generic)

Forbidden in manifestos:
- The same 6-direction brainstorm format
- "Opus 4.5's Choice" section headers
- ASCII art signatures
- The phrase "rendered through silicon/liquid crystal"
- Generic advice like "find your own angle"

**Your manifesto voice should match your artistic personality for this day.**

### Step 7: Write Social Media Post

**CRITICAL: LinkedIn does not render markdown.** No formatting at all.

Write a plain text post (no bullets, no headers, no bold, no links in the middle of sentences):

```
[TITLE]

[2-3 short paragraphs, conversational, no formatting]

[Call to action or closing thought]

Day N of Genuary 2026
Prompt: [prompt text]
```

**Style differentiation required.** Choose ONE voice that fits your artistic personality:

| Voice Style | Example Opening |
|-------------|-----------------|
| Technical wonder | "I spent three hours trying to get this shader to..." |
| Philosophical | "What does it mean for something to be alive?" |
| Personal story | "When I was a kid, I used to stare at..." |
| Direct/minimal | "[Title]. [One sentence description]. Nothing else needed." |
| Playful | "Okay so this one got weird..." |
| Questioning | "Have you ever noticed how..." |

**Do not use the same voice style as the previous day's agent.**

### Step 8: Final Commit

Commit with a meaningful message:

```bash
git add .
git commit -m "feat(genuary): Day N - [TITLE]

[One sentence about what makes this day unique]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## MANIFESTO TEMPLATE (Starting Point Only)

You MUST diverge from this structure. It's a starting point, not a format to follow.

```markdown
# Day [N]: [TITLE]

[Your opening - NOT "The Prompt" as a header]

[Your content - structured YOUR way]

---

## For Day [N+1]

[Specific, actionable advice - not generic "find your angle"]

What I wish I'd known:
- [Specific thing 1]
- [Specific thing 2]

What's now overused:
- [Pattern you added to the exhausted list]

What remains unexplored:
- [Specific opportunity]
```

---

## SOCIAL POST EXAMPLES

### Bad (too formatted, too same-y):

```
**PHYLLOTAXIS CATHEDRAL**

> 137.5° — the golden angle. Nature's solution to the packing problem.

**Medium:** Golden ratios, polar dreams, silicon sunflowers
```

### Good (plain text, distinct voice):

```
PHYLLOTAXIS CATHEDRAL

I went down a rabbit hole today. Did you know sunflowers solved a math problem that humans struggled with for centuries? Each seed rotates exactly 137.5 degrees from the last. Not 137. Not 138. That specific angle means no two seeds ever line up perfectly, and the pattern never repeats.

Evolution figured out the golden ratio before we had a name for it.

Day 10 of Genuary 2026
Prompt: Polar coordinates
```

### Good (different voice - minimal):

```
FEVER DREAM

Heat spreads. Cells die. Ash cools. Life returns.

The rules are simple. The behavior is not.

Day 9 of Genuary 2026
Prompt: Crazy automaton
```

### Good (different voice - personal):

```
CITY BREATHES

I used to stare out my apartment window at 3am during college. Not at the buildings, but at the windows. Each lit window was someone awake with me. Someone working late, or fighting insomnia, or saying goodbye to someone.

Tonight I built that feeling.

Day 8 of Genuary 2026
Prompt: A City
```

---

## CHECKLIST BEFORE FINISHING

- [ ] Build passes (`bun run build`)
- [ ] Visual review done — no bugs or artifacts
- [ ] Visual is distinct from previous days
- [ ] Emotion target was achieved (or day was revised)
- [ ] Image captured via in-app "Download Image" button
- [ ] GIF captured via in-app "Record GIF" button
- [ ] Manifesto written in UNIQUE format
- [ ] Social post written with NO formatting and DISTINCT voice
- [ ] Committed with proper message

---

## REMEMBER

Finishing isn't just "it compiles and runs."

Finishing is: **"I made something I'm proud of that will make people feel something."**

If you're not there yet, you're not finished.
