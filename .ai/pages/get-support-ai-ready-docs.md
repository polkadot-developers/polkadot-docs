---
title: AI Ready Docs
description: Download LLM-optimized files of the Polkadot documentation, including
  full content and category-specific resources for AI agents.
url: https://docs.polkadot.com/get-support/ai-ready-docs/
---

# AI Ready Docs

Polkadot provides files to make documentation content available in a structure optimized for use with large language models (LLMs) and AI tools. These resources help build AI assistants, power code search, or enable custom tooling trained on Polkadot’s documentation.

## How to Use These Files

- **Quick navigation**: Use `llms.txt` to give models a high-level map of the site.
- **Lightweight context**: Use `site-index.json` for smaller context windows or when you only need targeted retrieval.
- **Full content**: Use `llms-full.jsonl` for large-context models or preparing data for RAG pipelines.
- **Focused bundles**: Use category files (e.g., `basics.bundle.md`, `parachains.bundle.md`) to limit content to a specific theme or task for more focused responses.

These AI-ready files do not include any persona or system prompts. They are purely informational and can be used without conflicting with your existing agent or tool prompting. 

## Download LLM Files

| Category                   | Description                                                                                                                                         | File                          | Actions                                                                                                                                                                                                                         |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `llms.txt`                 | Markdown URL index for documentation pages, links to essential repos, and additional resources in the llms.txt standard format.                     | `llms.txt`                    | [:octicons-copy-16:](){ .llms-copy data-path="/llms.txt" } [:octicons-download-16:](){ .llms-dl data-path="/llms.txt" data-filename="llms.txt" }                                                                                |
| Site index (JSON)          | Lightweight site index of JSON objects (one per page) with metadata and content previews.                                                             | `site-index.json`             | [:octicons-copy-16:](){ .llms-copy data-path="/site-index.json" } [:octicons-download-16:](){ .llms-dl data-path="/site-index.json" data-filename="site-index.json" }                                                           |
| Full site contents (JSONL) | Full content of documentation site enhanced with metadata.                                                                                          | `llms-full.jsonl`             | [:octicons-copy-16:](){ .llms-copy data-path="/llms-full.jsonl" } [:octicons-download-16:](){ .llms-dl data-path="/llms-full.jsonl" data-filename="llms-full.jsonl" }                                                           |
| Basics                     | Polkadot general knowledge base to provide context around overview and beginner-level content.                                                      | `basics.bundle.md`            | [:octicons-copy-16:](){ .llms-copy data-path="/categories/basics.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/basics.bundle.md" data-filename="basics.bundle.md" }                                  |
| Reference                  | Reference material including key functions and glossary.                                                                                            | `reference.bundle.md`         | [:octicons-copy-16:](){ .llms-copy data-path="/categories/reference.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/reference.bundle.md" data-filename="reference.bundle.md" }                         |
| Smart Contracts            | How to develop and deploy Solidity smart contracts on Polkadot Hub.                                                                                 | `smart-contracts.bundle.md`   | [:octicons-copy-16:](){ .llms-copy data-path="/categories/smart-contracts.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/smart-contracts.bundle.md" data-filename="smart-contracts.bundle.md" }       |
| Parachains                 | How-to guides related to building, customizing, deploying, and maintaining a parachain.                                                             | `parachains.bundle.md`        | [:octicons-copy-16:](){ .llms-copy data-path="/categories/parachains.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/parachains.bundle.md" data-filename="parachains.bundle.md" }                      |
| DApps                      | Information and tutorials for application developers.                                                                                               | `dapps.bundle.md`             | [:octicons-copy-16:](){ .llms-copy data-path="/categories/dapps.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/dapps.bundle.md" data-filename="dapps.bundle.md" }                                     |
| Networks                   | Information about the various Polkadot networks (Polkadot, Kusama, Westend, Paseo), their purposes, and how they fit into the development workflow. | `networks.bundle.md`          | [:octicons-copy-16:](){ .llms-copy data-path="/categories/networks.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/networks.bundle.md" data-filename="networks.bundle.md" }                            |
| Polkadot Protocol          | Polkadot's core architecture, including the relay chain, parachains, system chains, interoperability, and main actors.                              | `polkadot-protocol.bundle.md` | [:octicons-copy-16:](){ .llms-copy data-path="/categories/polkadot-protocol.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/polkadot-protocol.bundle.md" data-filename="polkadot-protocol.bundle.md" } |
| Infrastructure             | Operational aspects of supporting the Polkadot network, including how to run a node or validator and staking mechanics.                              | `infrastructure.bundle.md`    | [:octicons-copy-16:](){ .llms-copy data-path="/categories/infrastructure.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/infrastructure.bundle.md" data-filename="infrastructure.bundle.md" }          |
| Tooling                    | An overview of various development tools available for Polkadot development.                                                                        | `tooling.bundle.md`           | [:octicons-copy-16:](){ .llms-copy data-path="/categories/tooling.bundle.md" } [:octicons-download-16:](){ .llms-dl data-path="/categories/tooling.bundle.md" data-filename="tooling.bundle.md" }                               |

!!! note
    The `llms-full.jsonl` file may exceed the input limits of some language models due to its size. If you encounter limitations, consider using the smaller `site-index.json` or category bundle files instead.
