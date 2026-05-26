---
title: dotNS CLI Reference
description: Reference for @parity/dotns-cli — the command-line tool for managing .dot name registrations, contenthash updates, transfers, and renewals.
categories: Apps, Reference
---

# CLI

## Introduction

[`@parity/dotns-cli`](https://www.npmjs.com/package/@parity/dotns-cli){target=\_blank} is the command-line tool for interacting with the dotNS registry — registering a `.dot` name, updating its `contenthash`, transferring ownership, and renewing where applicable. It is the canonical way to perform these operations outside of the higher-level [Register and Publish](/apps/deploy-and-publish/register-and-publish/){target=\_blank} flow that the Polkadot Product set-up track wraps.

A Product developer building a typical publishing pipeline rarely calls the CLI directly — the set-up track handles the common path. The CLI is the right tool when you need a fine-grained, scriptable interaction (CI publishing, batch operations across multiple names, debugging a registration failure).

!!! info "CLI version"
    This page targets `@parity/dotns-cli` **`0.6.2`**. The CLI is in active development and breaking changes between versions are expected. To follow this reference, install this version (or check the page's last update against the latest release on npm).

## Command Families

The CLI exposes commands across three families that map onto the dotNS contract responsibilities:

**Registration.** Commands that create a name record:

- Register a new name with a starting contenthash.
- Check PopRules eligibility for a proposed name and account (preview the deposit / free-tier outcome before submitting).

**Records management.** Commands that mutate an existing name's fields:

- Update the `contenthash` to a new CID — this is what a Product owner runs when they publish a new bundle and want the `.dot` name to point at the new version.
- Set or unset administrative fields on the record.

**Lifecycle.** Commands that change ownership or extend the registration:

- Transfer the name to another account.
- Renew the registration where renewals apply.

## Installing and Authenticating

The CLI is distributed as an npm package. Install it globally or run via `npx`. Operations that mutate state (registration, update, transfer) require an account that can sign the resulting Asset Hub transaction — the CLI accepts a key file, a connected hardware signer, or a Polkadot App session via a pairing flow, depending on the operation and the security posture the operator chooses.

For day-to-day Product publishing, the recommended account is the same paired account a developer uses with Polkadot Desktop, so PopRules tier and any reserved-name claims continue to apply consistently across the CLI and Desktop paths.

## Command Surface

Each command — subcommand path, required flags, optional flags, and exit codes — is enumerated here.

!!! warning "Provisional"
    Per-flag details for each command are still being audited against the published surface. The table below lists the known top-level commands at `0.6.2`; the per-flag reference will be filled in once it is confirmed against the live package.

| Command                                  | Family            | Required flags | Optional flags | Notes      |
|:-----------------------------------------|:------------------|:---------------|:---------------|:-----------|
| `register domain`                        | Registration      | _Pending_      | _Pending_      | _Pending_  |
| `register subname`                       | Registration      | _Pending_      | _Pending_      | _Pending_  |
| `lookup`                                 | Records           | _Pending_      | _Pending_      | _Pending_  |
| `content view` / `content set`           | Records           | _Pending_      | _Pending_      | _Pending_  |
| `text view` / `text set`                 | Records           | _Pending_      | _Pending_      | _Pending_  |
| `pop set` / `pop info`                   | Records           | _Pending_      | _Pending_      | _Pending_  |
| `store`                                  | Records           | _Pending_      | _Pending_      | _Pending_  |
| `account`                                | Lifecycle         | _Pending_      | _Pending_      | _Pending_  |
| `bulletin`                               | Lifecycle         | _Pending_      | _Pending_      | _Pending_  |

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The higher-level publishing flow that wraps the most common CLI operations.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-and-publish/register-and-publish/){target=\_blank}

- <span class="badge learn">Learn</span> **Testnet Contracts**

    ---

    The current TestNet contract addresses the CLI targets when operating in TestNet mode.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>
