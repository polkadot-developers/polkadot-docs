---
title: Unlock Parachain
description: TODO
---

# Unlock Parachain

## Introduction

Parachain locks are designed in such way to ensure the decentralization of parachains. If parachains are not locked when it should be, it could introduce centralization risk for new parachains.

A parachain can be locked only with following conditions:

- Relaychain governance MUST be able to lock any parachain.
- A parachain MUST be able to lock its own lock.
- A parachain manager SHOULD be able to lock the parachain.
- A parachain SHOULD be locked when it successfully produced a block for the first time.

A parachain can be unlocked only with following conditions:
- Relaychain governance MUST be able to unlock any parachain.
- A parachain MUST be able to unlock its own lock.

## Check if a Parachain is Locked

To check if a parachain is locked, 