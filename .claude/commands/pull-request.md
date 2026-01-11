# Pull Request Helper

Create a pull request for the current branch.

## Instructions

1. First, check the current branch and recent commits to understand what changed
2. Generate a PR title and description based on the commits
3. Try to create the PR using `gh` CLI if available
4. If `gh` is not available or fails, provide:
   - The PR title (copy-pasteable)
   - The PR description (copy-pasteable)
   - A direct link to create the PR on GitHub

## Template

When `gh` is not available, output in this format:

```
## PR Title
<title here>

## PR Description
<description here>

## Create PR
<link to github.com/.../compare/main...<branch>?expand=1>
```

## Using gh CLI

If gh is available:
```bash
gh pr create --title "..." --body "..."
```
