---
title: Set Up Your AI Agent
description: Point your AI coding agent at the right skills, repos, and docs so it produces idiomatic Polkadot Product code instead of generic boilerplate.
categories: Apps
page_badges:
  tutorial_badge: Beginner
---

# Set Up Your AI Agent

## Introduction

Many developers build Polkadot Products with an AI coding agent. Out of the box, an agent does not know that Products run inside a Host, that chain access routes through the SDK rather than a direct RPC, or where the skills and repos live — so it falls back on generic patterns that do not work here. A few minutes of setup points the agent at the right context and tilts it toward correct, idiomatic code.

This page gives you a paste-ready setup prompt, then the resources to wire in: the skills, the repos, and the machine-readable docs.

## The Setup Prompt

Paste this at the start of a session to orient your agent. It states the toolchain, the repos, the docs, and the rules that most often trip agents up:

```text
You are helping me build a Polkadot Product: a sandboxed web app (HTML/JS/CSS)
that runs inside a Polkadot Host (Polkadot Desktop, the Polkadot App, or Polkadot
Web) and is addressed by a .dot name.

Toolchain:
- Build app code with @parity/product-sdk (TypeScript). Install its skills first.
- Deploy with the playground CLI (`pg` / `playground`).
- For smart contracts, use the Contract Dependency Manager (`cdm`); contracts compile
  to PolkaVM on pallet-revive (Asset Hub). Author them in Rust or Solidity (Solidity
  via resolc, Foundry, or Hardhat). Do not target mainnet-EVM/Ethereum tooling or
  legacy ink!/Wasm.

Docs (read before answering; append `.md` to any page URL for raw markdown):
- Guides: https://docs.polkadot.com/apps/
- Full corpus: https://docs.polkadot.com/ai/llms-full.jsonl
- Index: https://docs.polkadot.com/llms.txt
- SDK API reference: https://paritytech.github.io/product-sdk/

Repos:
- https://github.com/paritytech/product-sdk (SDK packages + skills)
- https://github.com/paritytech/playground-cli (the deploy CLI)
- https://github.com/paritytech/contract-dependency-manager (contracts)

Rules to follow:
- All chain reads, signing, and storage route through the Host via @parity/product-sdk.
  Never open a direct WebSocket/RPC connection or dial a public IPFS gateway.
- Sign with a product account: getProductAccount(...).getSigner(). Approvals happen
  on the user's phone. On Paseo Next v2, do not use Polkadot.js-style signing (the
  AsPgas signed extension breaks it) — use the product-account signer.
- Most fallible SDK calls return a Result; check `.ok` before reading `.value`. Two
  exceptions: a contract read, `contract.method.query()`, returns `{ success, value }`,
  so check `.success`; and the `createApp` facade is not Result-typed except for
  `app.cloudStorage` — `app.wallet` and `app.chain` throw, and `app.localStorage`
  returns plain values. Prefer the individual packages (`signer`, `chain-client`,
  `local-storage`), which are Result-typed throughout.
- `createApp({ name })` passes `name` through as the dotNS identifier the Host derives
  the product account from. If it is not a registered `.dot` name, `wallet.connect()`
  resolves with zero accounts rather than erroring, so always check `accounts.length`.
- Storage: put files/blobs on the Bulletin Chain (content-addressed by CID, retained
  ~2 weeks, renewable). Keep bulk data OUT of contracts; store only small enforced
  state on-chain. Service allowances are granted per account.
- Prefer the SDK packages and the installed skills over generic JavaScript. If you are
  unsure how a surface works, read the docs page or the package README rather than guessing.
```

Trim the sections your project does not need. If you scaffolded from a template, much of this is already encoded in the project's agent files (see below).

## Install the Skills

The [Product SDK skills](/reference/apps/skills/) are modular instruction sets that teach an agent how to work across the Products stack (chain connections, storage, contracts, and more). They tilt the agent toward idiomatic answers instead of generic boilerplate.

In Claude Code, add the Parity marketplace and install the plugin:

```text
/plugin marketplace add paritytech/product-sdk
/plugin install product-sdk@paritytech
```

For other agents (Cursor, Codex, Cline, Windsurf, or a custom harness), clone `paritytech/product-sdk` and register the skills under `product-sdk/skills/` with your agent's context mechanism. The [Skills reference](/reference/apps/skills/) covers the full list, how to register them, and how to keep them current.

!!! tip "Keep skills current"
    Product surfaces are in active development. A stale skill teaches stale API patterns, which is worse than no skill. Refresh after major releases.

## Start From a Template

The official Playground starter template ships agent-instruction files, so an agent picks up the conventions automatically:

- `CLAUDE.md` for Claude Code, `AGENTS.md` for Codex and other `AGENTS.md`-aware tools.
- `.clinerules`, `.windsurfrules`, and `.github/copilot-instructions.md` for Cline, Windsurf, and GitHub Copilot.

Coverage varies by app: a moddable app you clone with `pg mod` may ship all of these, only `CLAUDE.md`, or none, so check the project. If it includes a `setup.sh`, `pg mod` runs it for you to install dependencies and fetch the latest skills; many apps do not ship one.

## Give Your Agent the Docs

This documentation publishes machine-readable versions for AI tools:

- **`/llms.txt`**: An index of the documentation, following the [llms.txt convention](https://llmstxt.org/).
- **`/ai/llms-full.jsonl`**: Every page, pre-chunked by section, one JSON object per line.
- **Per-page markdown**: Append `.md` to any page path (for example, `/apps/quick-start.md`) to get its raw markdown, or use the **Markdown for LLMs** button on any page to copy it or hand the URL to your agent.

The [AI Resources](/ai-resources/) page collects these downloads.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Quick Start**

    ---

    With your agent set up, deploy your first Product from the terminal or the browser.

    [:octicons-arrow-right-24: Quick Start](/apps/quick-start/)

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    The capability recipes your agent will lean on, one per SDK package.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

-   <span class="badge learn">Learn</span> **Skills Reference**

    ---

    The full skills list, how to register them, and how to keep them current.

    [:octicons-arrow-right-24: Skills](/reference/apps/skills/)

</div>
