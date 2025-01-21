---
title: Moonwall
description: TODO
---

# E2E Testing with Moonwall

## Introduction

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank} (version 20.10 or higher)
- A package manager such as [npm](https://www.npmjs.com/){target=\_blank}, [yarn](https://yarnpkg.com/){target=\_blank} or [pnpm](https://pnpm.io/){target=\_blank}

## Install Moonwall

You can install Moonwall globally or locally in your project. Choose the option that best fits your development workflow.

!!! note
    This documentation explains the features of Moonwall version `{{ dependencies.moonwall.version }}`. Make sure you're using the correct version to match these instructions.

### Global Installation

To install Moonwall globally, allowing you to use it across multiple projects, use one of the following commands:

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

To use Moonwall in a specific project, first create a new directory and initialize a Node.js project:

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

The first thing to do is to create a Moonwall config file. This can be initiated with the command below:

```bash
moonwall init
```

From here you can follow the questions in the wizard to build a stock moonwall config to start you off. If you just press enter and use the default configuration, your `moonwall.config` file should look like this:

```json
{
   "label": "moonwall_config",
   "defaultTestTimeout": 30000,
   "environments": [
      {
         "name": "default_env",
         "testFileDir": [
            "tests/"
         ],
         "foundation": {
            "type": "dev"
         }
      }
   ]
}
```

In the default setup, you will use the `dev` foundation, that means running a local node binary and performing tests against it. For more information on the other options, check the [Foundations](){target=\_blank} section in the official docs.

Open your code editor and edit the `moonwall.config`. You need to include:
-  The `launchSpec` field inside `foundation`,  with the path to the binary of the parachain you want to test, the `newRpcBehabiour` flag set to true, and the rpc port where the local node will run.
- The `connections` field, stablishing which kind of provider we will use in our tests to execute them, which in this case will be `polkadotJs`
    !!!note
        A provider is a tool that allows you or your application to connect to a blockchain network and simplifies the low-level details of the process. A provider handles submitting transactions, reading state, and more. For more information on available providers check the [Providers supported](https://moonsong-labs.github.io/moonwall/guide/intro/providers.html#providers-supported){target=\_blank} page.


```json
{
   "label": "moonwall_config",
   "defaultTestTimeout": 30000,
   "environments": [
      {
         "name": "default_env",
         "testFileDir": [
            "tests/"
         ],
         "foundation": {
            "launchSpec": [
            {
                "binPath": "./node-template",
                "newRpcBehaviour": true,
                "ports": {"rpcPort": 9944}
            }
            ],
            "type": "dev"
         },
         "connections": [
        {
          "name": "myconnection",
          "type": "polkadotJs",
          "endpoints": ["ws://127.0.0.1:9944"]
        }
      ]
      }
   ]
}
```

## Writing Tests

`describeSuite` is used to define the test suite, similar to how you would use Mocha in Javascript. You also need to explicity import `expect` from moonwall, as you'll use this to check the validity of our test cases. `beforeAll` enables us to set up our test environment before any tests are executed.

When describing a test suite, you need to provide an `id`, a `title`, and you need to specify the `foundation` that you'll be using. In this case you're using the `dev` foundation, so you're configuring the tests to be run against a local dev node.

```js

import "@polkadot/api-augment";
import {describeSuite, beforeAll, expect } from "@moonwall/cli";
import { ApiPromise } from "@polkadot/api";
describeSuite({
	id: "D1",
	title: "Demo suite",
	foundationMethods: "dev",
	testCases: ({it, context, log})=> {
        let api: ApiPromise;
        const DUMMY_ACCOUNT = "0x11d88f59425cbc1867883fcf93614bf70e87E854";

        beforeAll(() => {
          api = context.polkadotJs();
        });


        it ({id: "T1", title: "Demo test case", test: async()=> {

            const balanceBefore = (await api.query.system.account(DUMMY_ACCOUNT)).data.free;
            expect(balanceBefore.toString()).toEqual("0");
            log("balance before: " + balanceBefore);
            await context.ethers().sendTransaction({to:DUMMY_ACCOUNT, value: ethers.parseEther("1").toString() });
            await context.createBlock();
            const balanceAfter = (await api.query.system.account(DUMMY_ACCOUNT)).data.free;
            log("balance after: " + balanceAfter);
            expect(balanceAfter.sub(balanceBefore).toString()).toEqual(ethers.parseEther("1").toString());
        } })

    }
		
	})
```

## Running the Tests

TODO Add links to existing tests in Moonbeam and Tanssi