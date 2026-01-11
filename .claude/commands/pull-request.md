# Pull Request Helper

Create a pull request for the current branch.

## Instructions

1. First, check the current branch and recent commits to understand what changed
2. Generate a PR title and description based on the commits
3. Try to create the PR using `gh` CLI if available
4. If `gh` is not available or fails, provide:
   - The PR title (copy-pasteable)
   - The PR description (copy-pasteable)
   - A direct link to create the PR on GitHub with title and body encoded in URL

## IMPORTANT: URL Encoding

When encoding the PR body in the URL:
- AVOID backticks in the description - they break URL encoding
- Use plain text instead of code blocks where possible
- If you must reference code, describe it in words or use quotes

## Template

When `gh` is not available, output in this format:

```
## PR Title
<title here>

## PR Description
<description here - NO BACKTICKS>

## Create PR
<link to github.com/.../compare/main...<branch>?expand=1&title=...&body=...>
```

## Using gh CLI

If gh is available:
```bash
gh pr create --title "..." --body "..."
```
