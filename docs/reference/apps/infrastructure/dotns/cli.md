---
title: dotNS CLI Reference
description: Reference for the dotNS command-line tool, covering name registration, contenthash updates, record management, and ownership transfers.
categories: Apps, Reference
---

# CLI

## Introduction

[`@parity/dotns-cli`](https://www.npmjs.com/package/@parity/dotns-cli) is the command-line tool for interacting with the dotNS registry: registering a `.dot` name, updating its `contenthash`, and transferring ownership. It is the canonical tool for these operations; the higher-level [Register and Publish](/apps/deploy-your-app/) flow wraps it for the Polkadot Product setup track.

Names carry the TLD of the network the CLI targets: `.paseo` on the Paseo testnet, and `.dot` on a Polkadot deployment. Registrations do not expire and there is no renewal step. A name stays with its owner until it is transferred or deliberately released.

A Product developer building a typical publishing pipeline rarely calls the CLI directly — the setup track handles the common path. The CLI is the right tool when you need a fine-grained, scriptable interaction (CI publishing, batch operations across multiple names, debugging a registration failure).

!!! info "CLI version"
    This page targets `@parity/dotns-cli` `0.10.0`, aligned with dotNS contracts `1.0.0` and compatible with `0.8.0`; deployments older than `0.8.0` are no longer supported. The CLI is in active development and breaking changes between versions are expected.

## Command Families

The CLI groups its commands into five families that map onto the dotNS contract responsibilities:

- **Registration**: Commands that create a name record:

    - Register a name on the public path. Registration checks `PopRules` eligibility for the label and account before it commits, so an ineligible name fails before any transaction is sent.
    - Register a subname beneath a name you own.
    - Resume, inspect, or discard a commitment left by an interrupted registration.

- **Records management**: Commands that read or change an existing name's records:

    - Set the `contenthash` to a new CID. This is what a Product owner runs after publishing a new bundle, so the `.dot` name points at the new version.
    - Set text records, and choose the primary name shown for an account.
    - Look up a name's owner and records, and check an account's personhood status.

- **Lifecycle**: Commands that change who controls a name or its escrow position:

    - Transfer a name that is not soulbound to another account.
    - Let another account manage and transfer a name on your behalf, and revoke that delegation.
    - Release a name into escrow, inspect its position, redeem it, withdraw the deposit, and claim it. See [Escrow and Deposits](/reference/apps/infrastructure/dotns/escrow/).

- **Accounts**: Commands that manage the signing account and its on-chain mapping:

    - Manage the encrypted keystore the CLI signs with.
    - Show balances, map a Substrate account to its EVM address, and check a name's governance grant.

- **Bulletin storage**: Commands that upload a Product bundle to the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/) and track what was uploaded, producing the CID a `contenthash` points at.

## Installing and Authenticating

The CLI is distributed as an npm package and installs the `dotns` command. Install it globally or run it with `npx`. It targets one environment at a time, set with `--env`: `paseo-v2` (the default), `previewnet`, or `devnet`.

Operations that mutate state (registration, record updates, transfers) need an account that can sign the resulting Polkadot Hub transaction. The CLI signs with one of the following:

- **An encrypted keystore**: The default. `dotns auth` creates and manages keystore accounts, and `--account` selects one.
- **A mnemonic or key URI**: Passed with `--mnemonic` or `--key-uri`, or through the matching environment variables, which suits CI pipelines.
- **The Polkadot App**: `--signer qr` pairs the CLI with the Polkadot App by QR code, so the App signs each transaction. This signer is experimental.

The `PopRules` check reads the personhood status of the account the name is registered to: the signing account, or the account passed with `register domain --owner`.

## Command Surface

The table lists every command in `0.10.0`. Run `dotns <command> --help` for each command's flags.

| Command | Subcommands | Purpose |
|:--------|:------------|:--------|
| `register` | `domain`, `subname`, `retry`, `clear`, `list` | Register a name or subname, and manage commitments cached by an interrupted registration. |
| `lookup` | `name`, `owner-of`, `transfer` | Show a name's records and owner, and transfer a name. |
| `content` | `view`, `set` | Read and set a name's `contenthash`. |
| `text` | `view`, `set` | Read and set a name's text records. |
| `primary` | `set`, `status` | Set and show the primary name for an account. |
| `delegate` | `set`, `revoke`, `status`, `records`, `records-status` | Let another account manage a name, or edit records on all of an owner's names. |
| `escrow` | `status`, `positions`, `release`, `redeem`, `withdraw`, `claim-withdrawal`, `balance`, `refunds list`, `refunds claim`, `refunds claim-batch` | Manage deposits, the release lifecycle, the pull-payment balance, and the time-locked refund ledger. |
| `pop` | `info` | Show an account's personhood status. There is no command to set a tier. |
| `store` | `claim`, `info`, `list`, `names`, `cids`, `get`, `set`, `delete`, `sync` | Manage the account's User Store and the names in its label store. |
| `account` | `address`, `info`, `map`, `is-mapped`, `grant` | Show account details and balances, map a Substrate account to its EVM address, and show a name's governance grant. |
| `auth` | `set`, `list`, `use`, `remove`, `clear` | Manage the encrypted keystore. |
| `bulletin` | `authorize`, `refresh`, `upload`, `status`, `history`, `history:remove`, `history:clear`, `verify` | Upload content to the Bulletin Chain and track the uploads. |

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The higher-level publishing flow that wraps the most common CLI operations.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-your-app/)
    
- <span class="badge learn">Learn</span> **TestNet Contracts**

    ---

    The current TestNet contract addresses the CLI targets when operating in TestNet mode.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>
