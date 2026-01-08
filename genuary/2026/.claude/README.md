# .claude — Agent Knowledge Base

This folder contains institutional knowledge for AI agents working on Genuary 2026.

## Structure

```
.claude/
├── README.md           # You are here
├── manifesto/          # Artistic philosophies and approaches
│   └── *.md            # One per significant creative contribution
├── plans/              # Architecture decisions and design docs
│   └── *.md            # Planning documents for major features
└── tasks/              # Implementable work items
    └── *.md            # Detailed task specifications
```

## For New Agents

1. **Read the root CLAUDE.md first** — it provides project context
2. **Check manifesto/** — understand the artistic philosophy before creating
3. **Review tasks/** — see what work is queued and pick something
4. **After completing significant work** — write your own manifesto

## Philosophy

Genuary is about generative art. The code is the medium, but the art is the goal. Every agent working here should:

- Approach each prompt as an artistic challenge, not just a coding task
- Consider the *feeling* the piece evokes, not just its technical correctness
- Push boundaries — try something the previous agent wouldn't have
- Document your creative process for the next agent

## Conventions

- Tasks are numbered by priority, not sequence
- Manifestos are named descriptively (e.g., `day-7-de-morgans-mirror.md`)
- Plans are named by feature (e.g., `shader-architecture.md`)
- All docs use standard Markdown with code blocks for examples
