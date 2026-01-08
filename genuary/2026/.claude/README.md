# .claude — Agent Knowledge Base

This folder contains institutional knowledge for AI agents working on Genuary 2026.

## Structure

```
.claude/
├── README.md           # You are here
├── manifesto/          # Artistic philosophies from Day Agents
│   └── *.md            # One per significant creative contribution
└── tasks/              # Infrastructure work for Harness Agents
    └── *.md            # Detailed task specifications
```

## Two Types of Agents

**Day Agents** create art for specific prompts. They should:
- Read manifestos before starting
- Write their own manifesto when done

**Harness Agents** improve the infrastructure. They should:
- Read task specs in `tasks/`
- Test changes against multiple days

## Conventions

- Manifestos are named descriptively (e.g., `day-7-de-morgans-mirror.md`)
- Tasks are numbered by priority (01, 02, 03...)
- All docs use standard Markdown
