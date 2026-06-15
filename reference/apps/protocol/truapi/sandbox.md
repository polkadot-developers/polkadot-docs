---
title: Sandbox and Sub-Accounts in TrUAPI
description: Why a Polkadot Product gets a per-domain sub-account, why the Host API is the only egress, and how permissions selectively relax that isolation.
categories: Apps, Reference
---

# Sandbox and Sub-Accounts

## Introduction

A Polkadot Product runs inside a sandbox enforced by the Host. The sandbox is what makes the platform meaningfully different from "run third-party code in a browser tab" — three deliberate constraints, none of which a Product can bypass:

- A Product gets a derived sub-account, not the user's root identity.
- The Host API is the only egress, meaning the only way a Product can reach the world outside its sandbox.
- Permissions selectively relax isolation for the capabilities the user has explicitly granted.

This page is the deep dive on what each constraint means and how it is enforced.

## Why Derived Sub-Accounts, Not Root Identity

A user has one root identity on the People Chain. If a Product could ask the Host for the user's root key, or for a single account that represents the user across everything, every Product would see the same user, and every Product would be a tracking surface.

Instead, each Product gets a per-domain sub-account, derived deterministically from the user's identity and the Product's `.dot` domain:

- The same user opening `app-a.dot` and `app-b.dot` sees a different account in each Product.
- The two Products cannot link those accounts back to a shared user without an explicit cross-domain permission grant.
- The derivation is local (no round trip to the paired App is needed to compute the address), so getting an account is instantaneous from the Product's perspective.

The trade-off is that the Product cannot accumulate "the user's full identity." It can only see the user's behavior in this Product. Cross-Product correlation is a permission the user grants explicitly, not a default.

For the Product-side how-to that consumes this surface, see [Sign and Submit Transactions](/apps/build/sign-and-submit/).

## Why the Host API Is the Only Egress

A Product running inside a Host has no other way to reach the world. The browser-level network stack, the chain-client, the storage backend, and the signing primitive are all behind the Host API. The Product asks the Host, and the Host decides.

This matters for two reasons:

- **Consistent sandbox boundary**: Any capability a Product attempts to use crosses TrUAPI. The Host applies permission checks, account scoping, and policy enforcement at that single point. There is no side channel to leak data through.
- **Backend substitution**: A Product calling `app.wallet.getAnonymousAlias()` gets the same answer whether the Host fetches it from a local cache, a paired phone, or a future Host implementation that resolves it some other way. The Product targets the API, not the implementation.

The corollary: a Product that wants to do anything not exposed through TrUAPI cannot. There is no escape hatch by design.

## How Permissions Selectively Relax Isolation

Isolation is the _default_, not the only mode. The user can grant permissions that selectively widen what a Product can do:

- A Product can request a cross-domain alias, which is an alias scoped to another Product's `.dot` domain. The user sees a consent modal and explicitly approves or denies.
- A Product can declare an `ExternalRequest` permission with a URL pattern, opening a specific outbound network path the sandbox would otherwise block.
- A Product can request `ChainSubmit` for the ability to ask the Host to present a signing prompt to the user. The grant covers only the ability to ask; per-transaction approval is still required.

Every permission is a narrow, declared widening, not a broad "trust this Product" toggle. Full isolation is the default when the user installs a new Product without granting anything.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    The Product-side how-to that consumes the sub-account surface: setting up the signer, building transactions, and submitting them through the Host.

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/)

- <span class="badge learn">Learn</span> **Signing in Polkadot Desktop**

    ---

    How the `ChainSubmit` permission grants ability-to-request without granting auto-sign, and how Desktop enforces that distinction.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/signing/)

</div>
