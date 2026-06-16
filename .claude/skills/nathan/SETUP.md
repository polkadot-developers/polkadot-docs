# Nathan — Setup Guide

Nathan is an AI-powered PR review system. When triggered, it collects PR metadata and sends it to an n8n workflow, which returns inline code suggestions posted directly to the pull request.

---

## How it works

```
Developer posts +Nathan on a PR
        ↓
Nathan Gate (nathan-gate.yml)
  - Checks caller has write+ permission
  - Skips cooldown for write+ users
        ↓
Nathan workflow (trigger-n8n-workflow.yml)
  - Gathers PR diff, files, commits
  - Sends payload to n8n webhook
        ↓
n8n processes the review
        ↓
Workflow receives response, verifies signature,
posts inline suggestions back to the PR
```

---

## Prerequisites

- A GitHub repository where you have admin access
- A running n8n instance accessible via HTTPS
- GitHub CLI (`gh`) installed locally for anyone using the `/nathan` slash command

---

## Step 1 — Add workflow files

Copy these two files into `.github/workflows/` in your repository:

| File | Purpose |
|------|---------|
| `nathan-gate.yml` | Listens for `+Nathan` comments and commit pushes; checks permissions; dispatches the main workflow |
| `trigger-n8n-workflow.yml` | Gathers PR data and sends it to n8n; receives and posts the review |

Both files are already present in this repository and require no editing — all configuration is done via secrets and environments.

---

## Step 2 — Create GitHub environments

Go to **Settings → Environments** in your repository and create two environments:

### `n8n-sending`
Secrets to add:

| Secret | Value |
|--------|-------|
| `N8N_WEBHOOK_URL` | Full HTTPS URL of your n8n webhook (e.g. `https://n8n.example.com/webhook/...`) |
| `N8N_SENDING_TOKEN` | Shared secret used to sign outbound payloads (generate a strong random string) |
| `N8N_ALLOWED_HOST` | Hostname only from `N8N_WEBHOOK_URL` (e.g. `n8n.example.com`) — used to prevent SSRF |

### `n8n-receiving`
Secrets to add:

| Secret | Value |
|--------|-------|
| `N8N_RECEIVING_TOKEN` | Shared secret used to verify signatures on n8n's response (can be the same as or different from `N8N_SENDING_TOKEN`) |

---

## Step 3 — Add optional repository secret

Go to **Settings → Secrets → Actions** and optionally add:

| Secret | Purpose |
|--------|---------|
| `ERROR_WEBHOOK_URL` | HTTPS URL to receive a JSON POST when the workflow fails (Slack, Discord, etc.) |

---

## Step 4 — Configure n8n

In your n8n instance:

1. Create a webhook node that accepts POST requests — this is your `N8N_WEBHOOK_URL`.
2. Configure the workflow to verify the incoming `X-Signature` header (HMAC-SHA256 using `N8N_SENDING_TOKEN`).
3. When returning a response, sign the response body with `N8N_RECEIVING_TOKEN` and include the signature as the `X-Response-Signature` header.
4. Return a JSON body with at least `{ "status": "completed", "token": "<run_token>" }`.

---

## Step 5 — Set up local tooling (per developer)

Anyone who wants to use the `/nathan` slash command in Claude Code needs:

1. **GitHub CLI** — install from https://cli.github.com
2. **Authentication** — run `gh auth login` and follow the prompts
3. **Write access** on the repository — required to post comments and trigger workflows

To verify access is working:
```bash
gh auth status
gh repo view --json nameWithOwner
```

---

## Access control

| Permission level | Can trigger Nathan | Cooldown between triggers |
|-----------------|-------------------|--------------------------|
| admin | Yes | None |
| maintain | Yes | None |
| write | Yes | None |
| triage / read | No | — |

Write and above bypass the cooldown entirely. The cooldown (currently 2 minutes) only applies if access is ever opened to lower permission levels.

---

## Triggering a review

There are three ways to trigger Nathan:

**1. Slash command (Claude Code)**
```
/nathan
```
Claude will find the open PR for the current branch and post the comment automatically.

**2. PR comment (manual)**
Post a comment containing `+Nathan` (case-insensitive) on any open PR.

**3. Commit message**
Include `+Nathan` anywhere in a commit message pushed to a PR branch.

---

## Troubleshooting

**Review doesn't start after posting `+Nathan`**
- Check that your account has write access or higher on the repository.
- Check the Actions tab for the "Nathan Gate" workflow run — it will show why it was skipped.

**Workflow runs but no comment is posted**
- Check the "Nathan" workflow run in the Actions tab for errors.
- Verify all secrets are set correctly in both environments.
- Confirm n8n is reachable and returning the expected response shape.

**`gh: command not found` when using `/nathan`**
- Install the GitHub CLI: https://cli.github.com

**Signature verification failure**
- Ensure `N8N_RECEIVING_TOKEN` in the `n8n-receiving` environment matches what n8n is using to sign its responses.
