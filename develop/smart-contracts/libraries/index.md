---
title: Libraries
description: Compare libraries for interacting with smart contracts on Polkadot, including Ethers.js, Web3.js, viem, Wagmi, Web3.py, and their key differences.
template: index-page.html
---

# Libraries

Explore the key libraries for interacting with smart contracts on Polkadot-based networks. These libraries simplify contract calls, event listening, and transaction handling.

This section provides setup instructions, usage examples, and a comparison to help you select the right tool for your project.

## Library Comparison

Consider the following features when choosing a library for your project:

| Library    | Language Support         | Type Safety                  | Performance                           | Best For                                       |
|------------|--------------------------|------------------------------|---------------------------------------|------------------------------------------------|
| Ethers.js  | JavaScript, TypeScript   | Limited                      | Efficient, widely optimized           | General dApp development                        |
| Web3.js    | JavaScript, TypeScript   | Limited                      | Older codebase, can be less performant| Legacy projects, Web3.js users                 |
| viem       | TypeScript only          | Strong TypeScript support    | Lightweight, optimized for bundling   | TypeScript-heavy projects, modular workflows   |
| Wagmi      | TypeScript, React        | Strong TypeScript support    | React hooks-based, efficient caching  | React applications, hook-based development     |
| Web3.py    | Python                   | Python typing support        | Standard Python performance           | Python-based blockchain applications           |

!!! warning
    Web3.js has been [sunset](https://blog.chainsafe.io/web3-js-sunset/){target=\_blank}. You can find guides on using [Ethers.js](/develop/smart-contracts/libraries/ethers-js){target=\_blank} and [viem](/develop/smart-contracts/libraries/viem){target=\_blank} in the [Libraries](/develop/smart-contracts/libraries/){target=\_blank} section.

## In This Section

:::INSERT_IN_THIS_SECTION:::