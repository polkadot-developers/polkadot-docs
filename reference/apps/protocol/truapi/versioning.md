---
title: TrUAPI Versioning
description: How TrUAPI versions evolve, what compatibility a Product can rely on across Host versions, and how to target a specific version range safely.
categories: Apps, Reference
---

# Versioning

## Introduction

TrUAPI is versioned. A Host implements a specific version of the protocol; a Product is built against a specific version range; the SDK abstracts most version differences but cannot bridge across breaking changes. This page documents the versioning model so a Product developer knows what to declare and what to expect.

!!! warning "Provisional"
    The detailed compatibility rules between TrUAPI versions, the canonical version number a Product manifest declares, and the deprecation policy for older versions are still being finalized. This page documents the conceptual model; the operational reference will be added once those details are confirmed.

## What a Version Number Identifies

A TrUAPI version identifies the set of method groups, their signatures, and their semantics as a single coherent surface. Two Hosts running the same version of TrUAPI must accept the same calls with the same parameters and return values with the same shape; a Product targeting that version can rely on consistent behavior across them.

A change between two versions can be:

- **Additive**: New methods or new optional parameters. A Product targeting the older version still works against a Host on the newer version.
- **Behavioral**: Same signature, different behavior. This is surfaced as a version bump with a documented behavior change; a Product targeting the older version may need to retest.
- **Breaking**: Removed or renamed methods, changed parameter shapes. A Product targeting an incompatible older version will not run on a Host that has dropped that version.

## What a Product Targets

A Product declares the TrUAPI version range it requires. The Host inspects the declaration on load and either runs the Product (compatibility OK) or refuses to load it (compatibility mismatch, with a user-visible explanation).

Most Products will target a single version line and let the SDK abstract the per-call wrapping. Reaching directly into TrUAPI in code that bypasses the SDK is the most common reason a Product breaks across a version change, because the SDK is the layer that smooths over compatible changes.

## How the SDK Maps to Versions

The [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} family of packages is versioned in lockstep with the TrUAPI versions they wrap. A given SDK version targets a specific TrUAPI version line; pinning your SDK pins your TrUAPI surface implicitly.

When TrUAPI introduces a behavioral change, the SDK absorbs it where it can; where it cannot (a removed method, an incompatible parameter), it bumps a major version, and your Product upgrade path is to update the SDK pin and re-test against the new TrUAPI surface.

For the package map, see [Packages](/reference/apps/protocol/truapi/packages/){target=\_blank}.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Packages**

    ---

    Which SDK package wraps which TrUAPI method group, and how SDK versions map to TrUAPI versions.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/packages/)

</div>
