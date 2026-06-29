---
title: Permissions Method Group
description: TrUAPI method group for declaring, querying, and gating on Product capabilities, including the ChainSubmit, ExternalRequest, and Microphone surfaces.
categories: Apps, Reference
---

# Permissions

## Introduction

The Permissions method group is the gate every other method group implicitly passes through. Before a Product can sign a transaction, make an outbound request, or access the microphone, the Host checks two things: did the Product declare the required permission, and did the user grant it? This method group is how a Product reads its own permission state, and how the Host enforces it.

Most Products do not call these methods explicitly. Declarations live in the Product's manifest, and gating happens at the boundary of the methods that actually need a permission, such as signing, network, and media. The Permissions method group exposes the runtime query surface for checking whether a permission is granted.

## Conceptual Contract

Three things sit in this group:

- **Permission queries**: A Product can check whether a given capability is granted, such as with `isGranted("ChainSubmit")`. The shape lets a Product branch on permission state without trying the capability and catching `PermissionDenied`.
- **Permission grants and re-prompts**: The Host can expose runtime prompts for capabilities the user can elect at runtime rather than at install. The set of runtime-elective permissions versus install-time-only permissions is part of the Host's policy.
- **Permission-denied error reporting**: Every capability-gated method group bubbles up consistently, so a Product can treat `PermissionDenied` as a uniform failure mode wherever it happens.

!!! note "Permission names: spec vs. Host-side aliases"
    Some permission names in this documentation are Host-side normalizations, not the literal identifiers in the TrUAPI v0.2 spec. In particular, `ExternalRequest` (outbound network access) is a Polkadot Desktop alias; the protocol-level construct is `RemotePermission::Remote(Vec<String>)`, which carries the list of permitted hosts. A Host implementer reading the spec should map the friendly names used here to their spec enum variants.

For the conceptual model, see the [Polkadot Desktop Permissions](/reference/apps/hosts/polkadot-desktop/permissions/) reference.

!!! warning "Provisional"
    The exhaustive permission taxonomy and the exact runtime-query surface (method names, parameter shapes, return values) are still being finalized. This page documents the conceptual contract; the per-method specifics will be added as the surface confirms.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Polkadot Desktop Permissions**

    ---

    Host-side enforcement: capability types, manifest declaration, and the denial UX.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/permissions/)

</div>
