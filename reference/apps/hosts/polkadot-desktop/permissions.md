---
title: Permissions in Polkadot Desktop
description: Reference for how Polkadot Desktop enforces sandbox permissions a Product declares, including capability types, manifest declaration, and denial UX.
categories: Apps, Reference
---

# Permissions

## Introduction

A Polkadot Product runs inside a Host-governed sandbox; it cannot reach the network, the chain, the user's microphone, or any other resource without an explicit permission. Permissions are declared in your Product's manifest and enforced by Polkadot Desktop at the Host API boundary. This page is the reference for what each permission means, how the declaration works, and what happens when the user denies a permission.

The Product-side how-to for requesting permissions is the [Request Permissions](/apps/build/request-permissions/){target=\_blank} guide.

## Capability Types

!!! warning "Provisional"
    The exact permission taxonomy on the active Desktop build is still being finalized. The capabilities below are the ones a Product developer encounters in this surface; the complete reference (every permission name, its scope, and its enforcement point) will be added once the taxonomy is confirmed.

The three permissions most Products will encounter:

- **`Microphone`**: Grants the Product audio-input access. Standard browser-style media permission.
- **`ExternalRequest`**: Grants the Product the ability to make outbound HTTP requests to URLs that match a declared pattern. The pattern is part of the declaration, not requested at runtime. Your manifest says "my Product needs to talk to `https://api.example.com/v1/*`", and Desktop blocks any request the Product makes to URLs outside that pattern, even if the user granted the permission. Pattern scoping is the boundary, not user consent.
- **`ChainSubmit`**: Grants the Product the ability to request a transaction signing. Despite the name, this does not authorize Desktop to sign for the user; every individual transaction still requires a per-request approval on the paired App. See [Signing](/reference/apps/hosts/polkadot-desktop/signing/){target=\_blank} for the full model.

## Declaring Permissions

Permissions are declared in your Product's manifest. The declaration is static: your Product cannot dynamically request new permission types at runtime. If a future feature needs a permission you did not declare, you publish a new bundle with an updated manifest and the user re-approves on first open of the new version.

On the first time a user opens your Product, Desktop presents the declared permissions as prompts. The user grants or denies each one. Their decision is persisted; subsequent opens of the same Product do not re-prompt unless the manifest changes.

## Denial UX

When a permission is denied:

- **Capability response**: The capability returns `PermissionDenied` every time the Product attempts to use it. Your Product code should handle this error explicitly: show the user why the feature cannot proceed and what they can do about it.
- **Desktop prompt**: Desktop surfaces an "Enable access in App Settings" prompt alongside your Product's error UI, pointing the user to the settings screen where they can flip the permission back on.

A Product that crashes on `PermissionDenied` (instead of falling through to a graceful "this feature needs X, enable it in Settings" state) is failing this contract. The denial path is part of the normal control flow, not an exception.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Request Permissions**

    ---

    The Product-side how-to: declaring permissions in your manifest, handling `PermissionDenied`, and designing the user-facing prompt copy.

    [:octicons-arrow-right-24: Get Started](/apps/build/request-permissions/){target=\_blank}

- <span class="badge learn">Learn</span> **Signing**

    ---

    The signing model that the `ChainSubmit` permission gates: what the permission grants and what it does not grant.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/signing/)

</div>
