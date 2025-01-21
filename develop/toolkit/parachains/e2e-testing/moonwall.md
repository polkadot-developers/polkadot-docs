---
title: Moonwall
description: Enhance blockchain end-to-end testing with Moonwall's standardized environment setup, comprehensive configuration management, and simple network interactions.
---

# E2E Testing with Moonwall

## Introduction

Moonwall is a end-to-end testing framework specifically designed for Polkadot SDK-based blockchain networks. It addresses one of the most significant challenges in blockchain development: managing complex test environments and network configurations.

Moonwall consolidates this complexity by providing:

- A centralized configuration management system that explicitly defines all network parameters
- A standardized approach to environment setup across different Substrate-based chains
- Built-in utilities for common testing scenarios and network interactions

Developers can focus on writing meaningful tests rather than managing infrastructure complexities or searching through documentation for configuration options.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank} (version 20.10 or higher)
- A package manager such as [npm](https://www.npmjs.com/){target=\_blank}, [yarn](https://yarnpkg.com/){target=\_blank} or [pnpm](https://pnpm.io/){target=\_blank}

## Install Moonwall

Moonwall can be installed either globally for system-wide access or locally within specific projects. This section covers both installation methods.

!!! note
    his documentation corresponds to Moonwall version `{{ dependencies.moonwall.version }}`. Ensure you're using the matching version to avoid compatibility issues with the documented features.

### Global Installation

Global installation provides system-wide access to the Moonwall CLI, making it ideal for developers working across multiple blockchain projects. Install it by running one of the following commands:

=== "npm"

    ```bash
    npm install -g @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

=== "pnpm"

    ```bash
    pnpm -g install @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

=== "yarn"

    ```bash
    yarn global add @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

Now, you should be able to run the `moonwall` command from your terminal.

### Local Installation

For better dependency management and version control within a specific project, local installation is recommended. First, initialize your project:

```bash
mkdir my-moonwall-project
cd my-moonwall-project
npm init -y
```

Then, install it as a local dependency:

=== "npm"

    ```bash
    npm install @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

=== "pnpm"

    ```bash
    pnpm install @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

=== "yarn"

    ```bash
    yarn add @moonwall/cli@{{ dependencies.moonwall.version }}
    ```

## Initialize Moonwall

The `moonwall init` command launches an interactive wizard to create your configuration file:

```bash
moonwall init
```

During setup, you'll be prompted for the following parameters:

- Label - identifies your test configuration
- Global timeout - maximum time (ms) for test execution
- Environment name - name for your testing environment
- Network Foundation - type of blockchain environment to use
- Test Directory - location of your test files

Simply press `Enter` to accept defaults, or input custom values. The wizard generates a `moonwall.config` file:

```json
--8<-- 'code/develop/toolkit/parachains/e2e-testing/moonwall/init-moonwall.config.json'
```

The default configuration needs to be enhanced with specific details about your blockchain node and test requirements:

- The `foundation` object defines how your test blockchain node will be launched and managed. For local development, the `dev` foundation is used which runs a local node binary
    
    !!!note
        For more information about available options, check the [Foundations](https://moonsong-labs.github.io/moonwall/guide/intro/foundations.html){target=\_blank} section.

- The `connections` array specifies how your tests will interact with the blockchain node. This typically includes provider configuration and endpoint details.
    
    !!!note
        A provider is a tool that allows you or your application to connect to a blockchain network and simplifies the low-level details of the process. A provider handles submitting transactions, reading state, and more. For more information on available providers check the [Providers supported](https://moonsong-labs.github.io/moonwall/guide/intro/providers.html#providers-supported){target=\_blank} page.

Here's a complete configuration example for testing a local node using polkadot.js as a provider:

```json
--8<-- 'code/develop/toolkit/parachains/e2e-testing/moonwall/moonwall.config.json'
```

## Writing Tests

Moonwall uses the `describeSuite` function to define test suites, like using [Mocha](https://mochajs.org/){target=\_blank}. Each test suite requires:

- `id` - unique identifier for the suite
- `title` - descriptive name for the suite
- `foundationMethods` - specifies the testing environment (e.g., `dev` for local node testing)

The following example shows how to test a balance transfer between two accounts:

```ts
--8<-- 'code/develop/toolkit/parachains/e2e-testing/moonwall/test1.ts'
```

This test demonstrates several key concepts:

- Initializing the Polkadot.js API through Moonwall's context and setting up test accounts
- Querying on-chain state
- Executing transactions
- Waiting for block inclusion
- Verifying results using assertions

## Running the Tests

Execute your tests using the Moonwall CLI command:

```bash
moonwall test INSERT_ENVIRONMENT_NAME_HERE
```

For the default environment setup:

```bash
moonwall test default_env
```

The test runner will output detailed results showing:

- Test suite execution status
- Individual test case results
- Execution time
- Detailed logs and error messages (if any)

Example output:
--8<-- 'code/develop/toolkit/parachains/e2e-testing/moonwall/output.html'

## Where to Go Next

To explore Moonwall's full capabilities, refer to the official [Moonwall](https://moonsong-labs.github.io/moonwall/){target=\_blank} documentation. This provides a comprehensive guide to the available configurations and advanced usage.