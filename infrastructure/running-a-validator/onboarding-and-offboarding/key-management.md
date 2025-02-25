---
title: Validator Key Management
description: Learn how to generate and manage validator keys, including session keys for consensus participation and node keys for maintaining a stable network identity.
---

# Key Management

## Introduction

After setting up your node environment as shown in the [Setup](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator){target=\_blank} section, you'll need to configure multiple keys for your validator to operate properly. This includes setting up session keys, which are essential for participating in the consensus process, and configuring a node key that maintains a stable network identity. This guide walks you through the key management process, showing you how to generate, store, and register these keys.

## Set Session Keys

Setting up your validator's session keys is essential to associate your node with your stash account on the Polkadot network. Validators use session keys to participate in the consensus process. Your validator can only perform its role in the network by properly setting session keys which consist of several key pairs for different parts of the protocol (e.g., GRANDPA, BABE). These keys must be registered on-chain and associated with your validator node to ensure it can participate in validating blocks.

### Generate Session Keys

There are multiple ways to create the session keys. It can be done by interacting with the [Polkadot.js Apps UI](https://polkadot.js.org/apps/#/explorer){target=\_blank}, using the curl command or by using [Subkey](https://paritytech.github.io/polkadot-sdk/master/subkey/index.html){target=\_blank}.

=== "Polkadot.js Apps UI"

    1. In Polkadot.js Apps, connect to your local node, navigate to the **Developer** dropdown, and select the **RPC Calls** option

    2. Construct an `author_rotateKeys` RPC call and execute it

        1. Select the **author** endpoint
        2. Choose the **rotateKeys()** call
        3. Click the **Submit RPC Call** button
        4. Copy the hex-encoded public key from the response

        ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/key-management-1.webp)

=== "Curl"

    Generate session keys by running the following command on your validator node:

    ``` bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
    http://localhost:9944
    ```

    This command will return a JSON object. The `result` key is the hex-encoded public part of the newly created session key. Save this for later use.
    
    ```json
    {"jsonrpc":"2.0","result":"0xda3861a45e0197f3ca145c2c209f9126e5053fas503e459af4255cf8011d51010","id":1}
    ```

=== "Subkey"

    To create a keypair for your node's session keys, use the `subkey generate` command. This generates a set of cryptographic keys that must be stored in your node's keystore directory.

    When you run the command, it produces output similar to this example:

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/subkey-generate.html'

    To properly store these keys, create a file in your keystore directory with a specific naming convention. The filename must consist of the hex string `61757261` (which represents "aura" in hex) followed by the public key without its `0x` prefix.

    Using the example above, you would create a file named:

    ```
    ./keystores/6175726128cc2fdb6e28835e2bbac9a16feb65c23d448c9314ef12fe083b61bab8fc2755
    ```

    And store only the secret phrase in the file:

    ```
    "twist buffalo mixture excess device drastic vague mammal fitness punch match hammer"
    ```

### Submit Transaction to Set Keys

Now that you have generated your session keys, you must submit them to the chain. Follow these steps:

1. Go to the **Network > Staking > Accounts** section on Polkadot.js Apps
2. Select **Set Session Key** on the bonding account you generated earlier
3. Paste the hex-encoded session key string you generated (from either the UI or CLI) into the input field and submit the transaction

![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/key-management-2.webp)

Once the transaction is signed and submitted, your session keys will be registered on-chain.

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`** - checks if the node has a specific key by public key and key type
- **`hasSessionKeys`** - verifies if your node has the full session key string associated with the validator

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

## Set the Node Key

Validators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. This key ensures that your validator can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

--8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-a-validator/node-key-error-01.html'

### Generate the Node Key

Use one of the following methods to generate your node key:

=== "Save to file"

    The recommended solution is to generate a node key and save it to a file using the following command:

    ``` bash
    polkadot key generate-node-key --file INSERT_PATH_TO_NODE_KEY
    ```
    
=== "Use default path"

    You can also generate the node key with the following command, which will automatically save the key to the base path of your node:

    ``` bash
    polkadot key generate-node-key --default-base-path
    ```

Save the file path for reference. You will need it in the next step to configure your node with a static identity.

### Set Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node's startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without the risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.
