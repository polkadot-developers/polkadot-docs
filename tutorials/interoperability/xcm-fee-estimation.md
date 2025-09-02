---
title: XCM Fee Estimation
description: This tutorial demonstrates how to estimate the fees for teleporting assets from the Paseo Asset Hub parachain to the Paseo Bridge Hub chain.
categories: Tutorial
---

# XCM Fee Estimation

## Introduction

When sending cross-chain messages, ensure that the transaction will be successful not only in the local chain but also in the destination chain and any intermediate chains.

Sending cross-chain messages requires estimating the fees for the operation. 

This tutorial will demonstrate how to dry-run and estimate the fees for teleporting assets from the Paseo Asset Hub parachain to the Paseo Bridge Hub chain.

## Fee Mechanism

There are three types of fees that can be charged when sending a cross-chain message:

- **Local execution fees**: Fees charged in the local chain for executing the message.
- **Delivery fees**: Fees charged for delivering the message to the destination chain.
- **Remote execution fees**: Fees charged in the destination chain for executing the message.

If there are multiple intermediate chains, delivery fees and remote execution fees will be charged for each one.

In this example, you will estimate the fees for teleporting assets from the Paseo Asset Hub parachain to the Paseo Bridge Hub chain. The fee structure will be as follows:

```mermaid
flowchart LR
    AssetHub[Paseo Asset Hub] -->|Delivery Fees| BridgeHub[Paseo Bridge Hub]
    AssetHub -->|<br />Local<br />Execution<br />Fees| AssetHub
    BridgeHub -->|<br />Remote<br />Execution<br />Fees| BridgeHub
```

The overall fees are `local_execution_fees` + `delivery_fees` + `remote_execution_fees`.

## Environment Setup

First, you need to set up your environment:

1. Create a new directory and initialize the project:

    ```bash
    mkdir xcm-fee-estimation && \
    cd xcm-fee-estimation
    ```

2. Initialize the project:

    ```bash
    npm init -y
    ```

3. Install dev dependencies:

    ```bash
    npm install --save-dev @types/node@^22.12.0 ts-node@^10.9.2 typescript@^5.7.3
    ```

4. Install dependencies:

    ```bash
    npm install --save @polkadot-labs/hdkd@^0.0.13 @polkadot-labs/hdkd-helpers@^0.0.13 polkadot-api@1.9.5
    ```

5. Create TypeScript configuration:

    ```bash
    npx tsc --init
    ```

6. Generate the types for the Polkadot API for Paseo Bridge Hub and Paseo Asset Hub:

    ```bash
    npx papi add paseoAssetHub -n paseo_asset_hub && \
    npx papi add paseoBridgeHub -w wss://bridge-hub-paseo.dotters.network
    ```

7. Create a new file called `teleport-ah-to-bridge-hub.ts`:

    ```bash
    touch teleport-ah-to-bridge-hub.ts
    ```

8. Import the necessary modules. Add the following code to the `teleport-ah-to-bridge-hub.ts` file:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts::16"
    ```

9. Define constants and a `main` function where you will implement all the logic:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:18:29"

    async function main() {
      // Code will go here
    }
    ```

All the following code explained in the subsequent sections must be added inside the `main` function.

## Client and API Setup

Now you are ready to start implementing the logic for the fee estimation for the teleport you want to perform. In this step, you will create the client for the Paseo Asset Hub parachain and generate the typed API to interact with the chain. Follow the steps below:

Create the API client. You will need to create a client for the Paseo Asset Hub parachain:

```typescript title="teleport-ah-to-bridge-hub.ts"
--8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:266:272"
```

Ensure that you replace the endpoint URLs with the actual WebSocket endpoints. This example uses local chopsticks endpoints, but you can use public endpoints or run local nodes.

## Create the XCM Message

Now, you can construct a proper XCM message using the new XCM V5 instructions for teleporting from Asset Hub to the Bridge Hub Chain:

```typescript title="teleport-ah-to-bridge-hub.ts"
--8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:33:84"
```

## Fee Estimation Function

Below is a four-step breakdown of the logic needed to estimate the fees for the teleport.

First, you need to create the function that will estimate the fees for the teleport:

```typescript title="teleport-ah-to-bridge-hub.ts"
--8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:86:89"
  // Code will go here
}
```

1. **Local execution fees on Asset Hub**: Compute the XCM weight locally, then convert that weight to PAS using Asset Hub's view of PAS (`parents: 1, interior: Here`). Add the code to the function:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:90:129"
    ```

2. **Dry-run and delivery fees to Bridge Hub**: Dry-run the XCM on Asset Hub to capture forwarded messages, locate the one targeting Bridge Hub (`parents: 1, interior: Here`), and ask for delivery fees. Add the code to the function:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:131:193"
    ```

3. **Remote execution fees on Bridge Hub**: Connect to Bridge Hub, recompute the forwarded XCM weight there, and convert weight to PAS (`parents: 0, interior: Here`). Add the code to the function:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:195:233"
    ```

4. **Sum and return totals**: Aggregate all parts, print a short summary, and return a structured result. Add the code to the function:

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:235:263"
    ```

The full code for the fee estimation function is the following:

??? code "Fee Estimation Function"

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:86:263"
    ```

## Complete Implementation

Now put it all together in the main function:

```typescript title="teleport-ah-to-bridge-hub.ts"
--8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts:265:310"
```

## Full Code

The full code for the complete implementation is the following:

??? code "Teleport from Asset Hub to Bridge Hub"

    ```typescript title="teleport-ah-to-bridge-hub.ts"
    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-ah-to-bridge-hub.ts"
    ```

## Running the Script

Before running the script, you can use chopsticks to fork the Paseo Asset Hub and Paseo Bridge Hub chains locally. To do so, you can use the following files and commands:

1. Create a new directory called `.chopsticks` and add the files:

    ??? code "paseo-bridge-hub.yml"

        ```yaml title=".chopsticks/paseo-bridge-hub.yml"
        --8<-- "code/tutorials/interoperability/xcm-fee-estimation/paseo-bridge-hub.yml"
        ```
    
    ??? code "paseo-asset-hub.yml"

        ```yaml title=".chopsticks/paseo-asset-hub.yml"
        --8<-- "code/tutorials/interoperability/xcm-fee-estimation/paseo-asset-hub.yml"
        ```

2. Run the following command to fork the Paseo Bridge Hub chain:

    ```bash
    chopsticks --config=.chopsticks/paseo-bridge-hub.yml
    ```

    After running the command, you will see the following output:

    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/paseo-terminal-output-chopsticks.html"

3. Run the following command to fork the Paseo Asset Hub chain:

    ```bash
    chopsticks --config=.chopsticks/paseo-asset-hub.yml
    ```

    After running the commands, you will see the following output:

    --8<-- "code/tutorials/interoperability/xcm-fee-estimation/paseo-asset-hub-terminal-output-chopsticks.html"

4. Run the script:

    ```bash
    npx ts-node teleport-ah-to-bridge-hub.ts
    ```

After running the script, you will see the following output:

--8<-- "code/tutorials/interoperability/xcm-fee-estimation/teleport-output.html"

## Conclusion

This approach provides accurate fee estimation for XCM teleports from Asset Hub to Bridge Hub Chain by properly simulating execution on both chains and utilizing dedicated runtime APIs for fee calculation. The fee breakdown helps you understand the cost structure of reverse cross-chain operations (parachain → bridge hub chain) and ensures your transactions have sufficient funds to complete successfully.

The key insight is understanding how asset references change based on the perspective of each chain in the XCM ecosystem, which is crucial for proper fee estimation and XCM construction.