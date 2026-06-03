---
title: Polkadot Product Skills
description: Reference for the Claude Code product-skills repo, modular skills that teach the agent how to work effectively across the Polkadot Products stack.
categories: Apps, Reference
---

# Skills

## Introduction

Product Skills is a repository of [Claude Code](https://www.anthropic.com/claude-code){target=\_blank} skills, small, modular instructions and code references that teach the Claude Code agent how to work effectively across specific parts of the Polkadot Products stack. A skill bundles together what the agent needs to know about one slice of the surface (the Triangle architecture, the Bulletin Chain SDK, the design system, the test SDK, and so on) so that when you ask Claude Code for help in that area, it has the right context loaded.

If you are working on a Polkadot Product with Claude Code, installing the relevant skills tilts the agent toward correct, idiomatic answers instead of generic boilerplate. If you are not using Claude Code, this page is informational; the skills documented here are not standalone tools.

The repository lives at [`paritytech/product-skills`](https://github.com/paritytech/product-skills){target=\_blank}.

## Skills List

| Skill                                                                                                                                   | What It Covers                                                                                                                                                                                                      |
|:---------------------------------------------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| [`polkadot-triangle`](https://github.com/paritytech/product-skills/tree/main/polkadot-triangle){target=\_blank}                         | Host API, PAPI chain interactions, wallet connection, signing, CID deployment, DotNS. Foundational context for any Polkadot Product work.                                                                           |
| [`bulletin-storage`](https://github.com/paritytech/product-skills/tree/main/bulletin-storage){target=\_blank}                           | Content-addressed storage, CID computation, chunked storage, authorization, data renewal. Useful when the agent is writing or reviewing code that interacts with the Bulletin Chain storage layer.                  |
| [`bulletin-sdk`](https://github.com/paritytech/product-skills/tree/main/bulletin-sdk){target=\_blank}                                   | `@parity/bulletin-sdk` (JS) and `bulletin-sdk-rust` provide the preferred SDK for Bulletin Chain storage in Products. Lower-level than `bulletin-storage`; reach for it when the agent needs the API-level details. |
| [`polkadot-design-system`](https://github.com/paritytech/product-skills/tree/main/polkadot-design-system){target=\_blank}               | UI tokens, typography, interaction patterns, copy quality, light/dark themes. Useful when the agent is writing UI code that should look like a Polkadot Product.                                                    |
| [`polkadot-product-engineering`](https://github.com/paritytech/product-skills/tree/main/polkadot-product-engineering){target=\_blank}   | Web3 architecture compliance, four-layer classification, forbidden dependency detection. The "how a Polkadot Product project is shaped" skill.                                                                      |
| [`host-api-test-sdk`](https://github.com/paritytech/product-skills/tree/main/host-api-test-sdk){target=\_blank}                         | Playwright E2E tests for Polkadot dApps, test host fixtures, dev accounts, chain connections. Useful when the agent is writing tests against a Product's TrUAPI consumption.                                        |
| [`statement-store-and-allowance`](https://github.com/paritytech/product-skills/tree/main/statement-store-and-allowance){target=\_blank} | Statement Store ephemeral messaging, allowance provisioning, SDK usage patterns. Useful when the agent is writing pub/sub code or budgeting against the allowance limits.                                           |
| [`product-readme`](https://github.com/paritytech/product-skills/tree/main/product-readme){target=\_blank}                               | Generating polished, product-quality README files for open source projects. Useful for generating or reviewing Product READMEs.                                                                                     |

## How to Install

Pick the path that matches your setup.

### Claude Code Users

Run these slash commands inside Claude Code.

1. Register the repo as a skill marketplace:

    ```text
    /plugin marketplace add paritytech/product-skills
    ```

2. Install all skills at once:

    ```text
    /plugin install polkadot-skills@product-skills
    ```

To pick individual skills instead, run `/plugin marketplace add paritytech/product-skills`, select **Browse and install plugins**, select **product-skills**, choose the skills you want, and select **Install now**.

Skills auto-trigger based on context. You can also invoke any skill directly with `/<skill-name>`. For example, before asking the agent for help chunking a large upload to the Bulletin Chain, load the relevant SDK context up front:

```text
/bulletin-sdk how do I chunk a 50 MB file across multiple transactions?
```

The agent now has the SDK's API patterns and best practices loaded before it answers, instead of falling back on generic JavaScript knowledge.

### Other Agents (Cursor, Codex, Custom Harnesses)

If your agent loads skills from disk, install with [`npx skills`](https://www.npmjs.com/package/skills){target=\_blank} from a local clone:

```bash
git clone https://github.com/paritytech/product-skills.git
npx skills add product-skills
```

This registers the skills locally so any compatible agent can discover them.

## Updating

!!! tip "Keep skills current"
    Polkadot Products surfaces are in active development. A skill that has not been refreshed for a while will teach the agent stale API patterns, which is worse than no skill at all. Refresh after major releases, or enable auto-update in Claude Code so it happens at startup.

**Claude Code:** refresh the marketplace.

```text
/plugin marketplace update product-skills
```

If you have auto-update enabled, skills update automatically at startup.

**Other agents:** pull the latest from your clone and re-register.

```bash
git pull
npx skills add product-skills
```

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **App Development How-To**

    ---

    The how-to guides themselves, the same conceptual content the skills above index into.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/install-and-pair/){target=\_blank}

- <span class="badge external">External</span> **product-skills repo**

    ---

    The source of truth for the skills documented above, including install commands, per-skill README files, and updates.

    [:octicons-arrow-right-24: Visit Repo](https://github.com/paritytech/product-skills){target=\_blank}

</div>
