---
name: nathan
description: Triggers the Nathan AI review workflow by posting "+Nathan" on the open GitHub PR for the current branch. Works for both direct contributors and fork contributors. Requires an open PR on the current branch and the GitHub CLI (gh) to be authenticated with write access or higher on the upstream repository.
chain-role: isolated
invocation: user
allowed-tools: Bash(git branch:*) Bash(gh repo view:*) Bash(gh api:*) Bash(gh pr list:*) Bash(gh pr comment:*)
---

# Nathan

Trigger the Nathan AI review by posting `+Nathan` on the open GitHub PR for the current branch. Works transparently whether you are working on the main repo or a fork.

## Instructions

### Step 1: Resolve current branch
Run `git branch --show-current`.

If output is empty (detached HEAD), stop: "Cannot determine the current branch — the repository is in detached HEAD state. Check out a branch first."

### Step 2: Detect fork and resolve target repo
Run:
```
gh repo view --json isFork,parent
```

- If `isFork` is `false`: the target repo is the current repo. Use `<branch-name>` as the head filter.
- If `isFork` is `true`: the target repo is `parent.nameWithOwner` (the upstream). Get the authenticated user's login to build the head filter:
  ```
  gh api user --jq '.login'
  ```
  Use `<login>:<branch-name>` as the head filter and `<parent.nameWithOwner>` as the repo.

### Step 3: Find open PR

**Not a fork:**
```
gh pr list --head "<branch-name>" --state open --json number,title,url --limit 1
```

**Fork:**
```
gh pr list --repo "<upstream-repo>" --head "<login>:<branch-name>" --state open --json number,title,url --limit 1
```

- If result is `[]`, stop: "No open PR found for branch '<branch-name>'. Please open a PR on GitHub before triggering a review."
- If command fails, report the error and stop.

Parse `number`, `title`, and `url` from the result.

### Step 4: Post +Nathan comment
Use the PR URL so the comment always targets the correct repo regardless of fork status:
```bash
gh pr comment "<url>" --body '+Nathan'
```

### Step 5: Confirm
```
✅ Nathan review triggered on PR #<number> (<title>)
<url>
The Nathan Gate workflow will begin shortly.
```

## Examples

### Example 1: Direct contributor (not a fork)
User says: `/Nathan`
Actions:
1. Gets branch → `feature/add-docs`
2. Repo is not a fork
3. Finds open PR → #23 "Add documentation"
4. Posts `+Nathan`
Result: "✅ Nathan review triggered on PR #23 (Add documentation)\nhttps://github.com/..."

### Example 2: Fork contributor
User says: `/Nathan`
Actions:
1. Gets branch → `fix/typo`
2. Repo is a fork of `upstream-org/repo`; user login is `contributor`
3. Searches upstream for PR with head `contributor:fix/typo` → #47 "Fix typo in README"
4. Posts `+Nathan` using the PR URL
Result: "✅ Nathan review triggered on PR #47 (Fix typo in README)\nhttps://github.com/upstream-org/repo/pull/47"

### Example 3: No open PR (edge case)
User says: `/Nathan`
Actions:
1. Gets branch → `old-branch`
2. No open PR found
Result: "No open PR found for branch 'old-branch'. Please open a PR on GitHub before triggering a review."

## Troubleshooting

### Error: `gh: command not found`
Cause: GitHub CLI not installed or not in PATH.
Solution: Install from https://cli.github.com and run `gh auth login`.

### Error: HTTP 401 / auth failure
Cause: GitHub CLI is not authenticated.
Solution: Run `gh auth login` and follow the prompts.

### Error: No open PR found
Cause: PR does not exist for this branch, or is closed/merged.
Solution: Open a PR on GitHub first, or switch to a branch with an active PR.

### Error: Nathan review does not start
Cause: Your account does not have write access or higher on the upstream repository.
Solution: Verify your permissions — the Nathan Gate workflow requires at least write access to dispatch.
