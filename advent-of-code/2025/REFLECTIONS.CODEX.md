# CODEX Reflections — AoC 2025

## What Worked

- Harness covered end-to-end flow: fetch challenge/input, run solution, parse answers, submit, cache stars, update challenge text after part 1 success (`--auto` path submits both parts with rate-limit wait) – solid foundation for unattended runs.
- Directory/filename discovery was robust; handled legacy layouts plus the new `year/day/solution.ts` convention, reducing manual wiring.
- Best-practices doc captured critical hygiene (logs, local tests, timeouts, wrong-answer tracking) and a math-patterns crib sheet that accelerated later days.
- Consistent logging on Day 12 (packing) and challenge completion confirmed the workflow can scale to harder puzzles once the algorithm is right.

```829:906:advent-of-code/2025/harness.ts
  console.log("🚀 Running solution...")
  let output: string
  try {
    output = await SolutionRunner.run(config.day, config.year)
  } catch (error) {
    console.error(`❌ Failed to run solution: ${error}`)
    Deno.exit(1)
  }
  const answers = AnswerParser.parse(output)
  if (config.submit || config.auto) {
    if (config.auto) {
      // submits part 1 then waits RATE_LIMIT_MS before part 2
      ...
      Deno.exit(0)
    }
  }
```

## What Hurt

- Auto mode still needed human babysitting: answer parsing depended on inconsistent stdout formats; missing `Part 1:`/`Part 2:` strings stalled submissions.
- Fetch/submit loops weren’t fully self-healing: a bad run (throw/hang) required manual restart instead of automatic retry with captured stderr.
- Limited observability: no structured logs/metrics of attempts, durations, wrong answers, or failure modes; hard to triage when Auto Mode stalled.
- Example tests weren’t auto-generated from challenge text; we manually built `test-example.ts`, slowing the initial feedback loop and risking format mistakes.
- Safety gaps: timeouts and resource guards were ad hoc per test script, not enforced centrally by the harness; a stuck solution blocked the loop.

## Auto Mode Gaps to Close

- **Answer extraction:** enforce a single stdout contract (`AOCPART1=<val>`, `AOCPART2=<val>`) and have the harness reject/guide when absent.
- **Retries & resilience:** wrap solution runs with timeouts/retries and capture stderr/stdout to `log.md`; auto-rerun after transient failures before paging a human.
- **Wrong-answer memory:** persist wrong answers per day, automatically skip resubmits, and bound-search when “too high/low” is returned.
- **Progress telemetry:** emit JSONL events (run started/ended, durations, submit results, cache hits) so Auto Mode can decide to continue, back off, or escalate.
- **Artifact hygiene:** auto-create day scaffold (challenge.txt, input.txt, log.md, test-example.ts shell) on fetch to reduce manual setup error.

## Recommendations for Next Season

- **Standard output contract:** require solutions to print `AOCPART1=` / `AOCPART2=`. Add a tiny helper module to emit these reliably; make harness reject non-conforming output with a clear message.
- **Auto-generated tests:** extend harness to parse the first example block from `challenge.txt` and generate/refresh `test-example.ts` + expected outputs; run them before submission.
- **Centralized timeouts:** run solutions via a wrapper that enforces CPU/time/memory limits and kills on hang; surface last stderr lines in the log.
- **Self-healing loop:** on failure, back off with jitter, refresh stars, rerun once, then only escalate. On success, update `log.md` and wrong-answer cache automatically.
- **Template + tasks:** `deno task day:init 13` to create scaffold, add checklist, and stub tests; align with `BEST_PRACTICES.md` so the workflow is encoded, not remembered.
- **Math playbook integration:** bake the patterns table into a “first-5-mins” prompt for Auto Mode; nudge toward algebra/graph reductions before brute force.
- **Observability:** write JSONL to `year/.aoc-runs.log` with run id, args, duration, answers, submit result, error summaries; add a `--resume` flag to continue after interruptions.
- **Submission guards:** refuse submit if example test fails or if answer matches a known-bad value; prompt for human override only then.

## Prompting/Process Tweaks for Auto Mode

- Start each day with a fixed macro: fetch → parse summary → auto-generate tests → run example → run real input with timeout → parse outputs → submit → log.
- Use a standing prompt reminding Auto Mode of the stdout contract, wrong-answer file, and timeout budget; keep it short and reused.
- Keep edits atomic: one change-set per hypothesis, run tests, record result in `log.md`. Auto Mode should write the log itself.
- Prefer small scaffolding scripts over inline reasoning—teach the agent to scaffold then iterate, not to hand-edit everything.

## Quick Experiments to Try Early

- Build the stdout-contract helper + enforcement and run it against a few past days to ensure the harness can fully auto-submit when answers are correct.
- Prototype example-parser → test-file generator to shrink time-to-first-run.
- Add JSONL telemetry and a minimal dashboard (or grep scripts) to spot stuck runs fast.
- Dry-run `--auto` on completed days to validate the self-healing loop without risking rate limits.
