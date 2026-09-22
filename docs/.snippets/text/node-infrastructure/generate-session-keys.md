!!! warning "Breaking change introduced in runtime 2.2.0"
    Runtime 2.2.0 introduced a new session key generation flow using the `author_rotateKeysWithOwner` RPC, which requires your stash account as a parameter and returns both the session keys and a cryptographic proof of ownership. This proof must be included later when submitting `setKeys`. The previous `author_rotateKeys` RPC and the Subkey approach are no longer supported for new key generation. If your node already has session keys set on-chain and you are not rotating them, no action is required.

    Polkadot and Kusama are beyond runtime 2.2.0, so the new flow is the only supported path on both networks. The **Pre-2.2.0 (Legacy)** tab below is kept for reference and applies only to chains still running a pre-2.2.0 runtime.

=== "Runtime 2.2.0+ (`rotateKeysWithOwner`)"

    Generate session keys by running the following command on your validator node, replacing `INSERT_STASH_ACCOUNT_ID` with your validator's stash account ID:

    ``` bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeysWithOwner", "params":["INSERT_STASH_ACCOUNT_ID"]}' \
    http://localhost:9944
    ```

    This command returns a JSON object with two fields in the `result`: `keys` (the hex-encoded session keys) and `proof` (the ownership proof). Save both values for later use.

    ```json
    {
      "jsonrpc": "2.0",
      "result": {
        "keys": "0xda3861a45e0197f3ca145c2c209f9126e5053fas503e459af4255cf8011d51010",
        "proof": "0x1a2b3c4d5e6f..."
      },
      "id": 1
    }
    ```

    !!! note "Subkey is no longer supported for session key generation"
        Previously, nodes could generate session keys externally using `subkey` and manually insert them into the node's keystore. This approach is no longer viable because `set_keys` now requires a cryptographic proof of ownership — each private session key must sign the stash account ID. The only way to obtain this proof is through `author_rotateKeysWithOwner`, which handles key generation, keystore insertion, and proof generation in a single step. Operators who previously relied on `subkey` for session key generation should migrate to using `author_rotateKeysWithOwner` as described above.

=== "Pre-2.2.0 (Legacy)"

    Polkadot and Kusama are beyond runtime 2.2.0, so this legacy flow is no longer applicable on those networks. Use it only if you are operating on a chain still running a pre-2.2.0 runtime. On such a chain, there are multiple ways to create the session keys:

    === "Polkadot.js Apps UI"

        1. In Polkadot.js Apps, connect to your local node, navigate to the **Developer** dropdown, and select the **RPC Calls** option.

        2. Construct an `author_rotateKeys` RPC call and execute it:

            1. Select the **author** endpoint.
            2. Choose the **rotateKeys()** call.
            3. Click the **Submit RPC Call** button.
            4. Copy the hex-encoded public key from the response.

            ![](/images/node-infrastructure/run-a-validator/onboarding-and-offboarding/key-management/key-management-01.webp)

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

        --8<-- 'code/node-infrastructure/run-a-validator/onboarding-and-offboarding/key-management/subkey-generate.html'

        To properly store these keys, create a file in your keystore directory with a specific naming convention. The filename must consist of the hex string `61757261` (which represents "aura" in hex) followed by the public key without its `0x` prefix.

        Using the example above, you would create a file named:

        ```
        ./keystores/6175726128cc2fdb6e28835e2bbac9a16feb65c23d448c9314ef12fe083b61bab8fc2755
        ```

        And store only the secret phrase in the file:

        ```
        "twist buffalo mixture excess device drastic vague mammal fitness punch match hammer"
        ```

    When submitting `setKeys`, use `0x00` as the proof parameter.

!!! warning "Save your session key output immediately"
    You must save these session keys as you'll need them for on-chain registration.
    Calling `author_rotateKeys` or `author_rotateKeysWithOwner` generates **new keys every time** — it does not return previously generated keys. If you lose the output, there is no way to retrieve it. You will need to call the RPC again, which generates a fresh set of keys, and then re-submit `setKeys` with the new result.
