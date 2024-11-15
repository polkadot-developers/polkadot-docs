---
title: Wasm (ink!)
description: TODO
---

# Wasm (ink!)

## Introduction

ink! is an embedded domain-specific language (eDSL) designed to develop Wasm smart contracts using the Rust programming language. 

Rather than creating a new language, ink! is just standard Rust in a well-defined "contract format" with specialized `#[ink(…)]` attribute macros. These attribute macros tell ink! what the different parts of your Rust smart contract represent and ultimately allow ink! to do all the magic needed to create Polkadot SDK-compatible Wasm bytecode. Because of this, it inherits critical advantages such as:

- Strong memory safety guarantees
- Advanced type system
- Comprehensive development tooling
- Support from Rust's extensive developer community

And because ink! smart contracts are compiled to Wasm, they deliver:

- High execution speed
- Platform independence
- Enhanced security through sandboxed execution

These contracts can be deployed on any blockchain built with the Polkadot SDK that implements the [Contracts Pallet](https://docs.rs/pallet-contracts/latest/pallet_contracts/){target=\_blank}.

## Installation

ink! smart contract development requires the installation of [cargo-contract](https://github.com/use-ink/cargo-contract){target=\_blank}, a command-line interface (CLI) tool that provides essential utilities for creating, testing, and managing ink! projects.

For step-by-step installation instructions, including platform-specific requirements and troubleshooting tips, refer to the official cargo-contract [Installation](https://github.com/use-ink/cargo-contract?tab=readme-ov-file#installation){target=\_blank} guide.

## Quick Start

To create a new ink! smart contract project, use the `cargo contract` command:

```bash
cargo contract new your-project-name
```

This command generates a new project directory with the following structure:

```bash
your-project-name/
├── lib.rs          # Contract source code
├── Cargo.toml      # Project configuration and dependencies
└── .gitignore      # Git ignore rules
```

The `lib.rs` file includes a basic contract template with storage and message handling functionality. Customize this file to implement your contract’s logic. The `Cargo.toml` file defines project dependencies, including the necessary ink! libraries and configuration settings.

## Contract Structure



## Where to Go Next?

To deepen your knowledge of ink! development, whether you're exploring foundational concepts or advanced implementations, the following resources provide essential guidance:

- [**Official ink! documentation**](https://use.ink/){target=\_blank} — a thorough resource with guides, in-depth explanations, and technical references to support you in mastering ink! development

- [**ink-examples repository**](https://github.com/use-ink/ink-examples){target=\_blank} — a curated collection of smart contract examples that demonstrate best practices and commonly used design patterns