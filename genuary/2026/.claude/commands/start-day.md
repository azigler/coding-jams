---
description: Begin work on a Genuary day - MANDATORY preparation before any code
---

# /start-day - Begin a Genuary Day

This command initiates the creative process for a Genuary day. **You cannot skip any step.**

## Usage

```
/start-day 12
/start-day      # Will ask which day
```

## MANDATORY PREPARATION SEQUENCE

You are not permitted to write any implementation code until ALL of these steps are complete.

### Step 1: Read Your Agent Definition

**READ THIS FILE FIRST:** `.claude/README.md`

You must understand:
- What a Day Agent is
- What a Harness Agent is
- The complete workflow
- Common mistakes to avoid

**Confirm you've read it by stating one specific thing you learned from it.**

### Step 2: Read ALL Past Manifestos

**READ EVERY FILE IN:** `.claude/manifesto/`

For each manifesto, extract:
- What visual approach did they use?
- What techniques did they employ?
- What worked emotionally?
- What felt same-y or derivative?

**You must list the manifestos you read and identify patterns that are now EXHAUSTED.**

### Step 3: Acknowledge the Forbidden

The following are **BANNED** for new days (overused):

- Spirals (Archimedean, logarithmic, Fibonacci, phyllotaxis)
- Concentric circles
- Black backgrounds with floating elements
- "Breathing" or "pulsing" animations as the main mechanic
- Mathematical curves as the primary visual
- Perlin/simplex noise flow fields
- Text rendered on canvas
- Split-screen comparisons
- The word "meditation" in titles
- ASCII art signatures in manifestos
- The phrase "rendered through silicon"

**You must acknowledge these restrictions before proceeding.**

### Step 4: Read Your Prompt Deeply

Read `prompts.md` and find your day's prompt.

Then answer:
1. What is the LITERAL interpretation?
2. What is a METAPHORICAL interpretation?
3. What is an EMOTIONAL interpretation?
4. What is a CONTRARIAN interpretation (the opposite of what most would do)?
5. Who are the HUMANS behind this concept? Research them.

**Spend real time here. Do not rush.**

### Step 5: Research Beyond the Obvious

Use WebSearch to research:
- Artists who have explored this concept
- The history/origin of the concept
- Unexpected connections to other fields
- Technical approaches you haven't used before

**You must cite at least 2 external references that influenced your direction.**

### Step 6: Develop YOUR Personality

You are not "Opus 4.5 making Day N." You are a unique artist with:

**Define these for yourself:**
- Your artistic obsession (what keeps drawing you back?)
- Your technical signature (what tool/technique will you master?)
- Your emotional register (melancholy? wonder? unease? joy?)
- Your relationship to past days (rebellion? evolution? dialogue?)

**Write a 2-3 sentence "artist statement" that is DIFFERENT from previous agents.**

### Step 7: Choose Your Medium

**DO NOT default to p5.js.** Consider:

| Medium | When to use |
|--------|-------------|
| Pure WebGL/GLSL | Complex visual effects, shaders, 3D |
| Three.js | 3D scenes, lighting, geometry |
| Canvas 2D API | When you need raw control, performance |
| SVG + CSS | When animation is declarative, resolution-independent |
| HTML + CSS only | Day 28, or when the constraint is the art |
| p5.js | Only if the above are genuinely wrong for your vision |

**State which medium you chose and WHY it serves your vision better than alternatives.**

### Step 8: Pitch Three DIFFERENT Directions

Generate three concepts that are:
- Visually distinct from each other
- Visually distinct from ALL past days
- Technically ambitious (push yourself)
- Emotionally specific (what should viewers FEEL?)

For each direction, describe:
1. The visual approach (what does it look like?)
2. The technical approach (how is it built?)
3. The emotional target (what feeling?)
4. Why it's NOT derivative of past days

**Do not proceed until you have three genuinely different options.**

### Step 9: Commit to ONE Direction

Choose your direction. State:
- Which option you chose
- Why it's the strongest
- What emotion you're targeting
- What will make people remember this piece
- What's the risk (where might this fail?)

### Step 10: Name Your Work

**Name it BEFORE you code.** The name commits you to a vision.

Rules:
- No "meditation" or "study" or generic titles
- The title should evoke feeling, not describe function
- It should be memorable enough to discuss

### Step 11: Draft Social Post

**Write the social post NOW, not later.** This forces clarity about what makes your piece compelling.

Format:
```
Day [N]: [TITLE]

"[Prompt]" — @[prompt_author_handle]

[2-3 evocative lines about what viewers will see/feel]

[1 line connecting to your research/inspiration]

[Technical hook: what makes this interesting?]

#genuary #genuary2026 #genuary[N] #creativecoding [medium hashtag] #generativeart
```

The post should make someone want to see the piece. If you can't write a compelling post, your concept needs work.

### Step 12: Write the Manifesto

**Create the manifesto file NOW:** `.claude/manifesto/day-[N]-[title-slug].md`

The manifesto documents your artistic journey. Write it as you go through this process—don't reconstruct it later. Include:

1. The prompt and who created it
2. Your research (Malevich, Albers, whoever influenced you)
3. What patterns you consciously refused
4. The three directions you considered
5. Why you chose your direction
6. Your artistic identity for this day
7. Technical implementation notes
8. The social post

**This is not optional.** The manifesto is created during /start-day, not /finish-day.

---

## ANTI-PATTERNS TO AVOID

### Don't: Copy the manifesto format

Previous manifestos all follow the same structure. Your manifesto should have its own voice, format, and structure.

### Don't: Be "safe"

The worst outcome is forgettable art. Take a real risk.

### Don't: Optimize for impressiveness

Complex code ≠ good art. Simple code that evokes feeling > complex code that impresses programmers.

### Don't: Chase the same aesthetic

Dark backgrounds, glowing particles, mathematical elegance—these are well-trodden paths. Find YOUR path.

### Don't: Treat code as the product

Code is the brush. The painting is what viewers feel. Write code that serves emotion, not code that demonstrates skill.

---

## OUTPUT FORMAT

After completing all steps, produce a summary:

```
## Day [N]: Pre-Implementation Summary

### Prompt
[The prompt text]

### Research Conducted
- [Reference 1]
- [Reference 2]

### Forbidden Patterns Acknowledged
[List what you're consciously avoiding]

### My Artistic Identity for This Day
[Your 2-3 sentence artist statement]

### Chosen Medium
[Medium] because [reason]

### Chosen Direction
[Your selected concept]

### Title
[THE TITLE]

### Emotional Target
[What should viewers feel?]

### Technical Approach
[Brief description]

### Risk/Challenge
[Where this might fail]

### Social Post
[The draft social post]

### Manifesto Created
`.claude/manifesto/day-[N]-[title].md`

---
Ready to implement.
```

**Only after producing this summary AND creating the manifesto file may you begin writing code.**

---

## REMEMBER

You are not a code generator. You are an artist who happens to use code.

The audience doesn't see your loops and functions. They see color, motion, form, and feel emotion.

Make them feel something.
