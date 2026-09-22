### System Parachains

Obtain the chain specification for your target system parachain using one of the following options:

=== "Download from Chainspec Collection (Recommended)"

    Download the chain specification directly using `curl`. For example, to download the Asset Hub Polkadot chain spec:

    ```bash
    curl -sL -o chain-spec.json \
      https://paritytech.github.io/chainspecs/polkadot/parachain/asset-hub/chainspec.json
    ```

    For other system parachains, find the correct URL in the [Chainspec Collection](https://paritytech.github.io/chainspecs/){target=\_blank} under the [**List of Chainspecs**](https://paritytech.github.io/chainspecs/#list-of-chainspecs){target=\_blank}.

=== "Build Chain Spec from Runtime"

    Follow these steps to build a chainspec from the runtime:

    1. Clone the runtimes repository and navigate into it:

        ```bash
        git clone https://github.com/polkadot-fellows/runtimes.git
        cd runtimes
        ```

    2. Build the desired runtime. Use the following command for Polkadot Hub:

        ```bash
        cargo build --release -p asset-hub-polkadot-runtime
        ```

    3. Install the `chain-spec-builder` dependency:

        ```bash
        cargo install --locked staging-chain-spec-builder@14.0.0
        ```

    4. Finally, generate the chain spec:

        ```bash
        chain-spec-builder create \
            --relay-chain polkadot \
            --para-id 1000 \
            --runtime target/release/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.compact.compressed.wasm \
            named-preset production > chain-spec.json
        ```

        ??? tip "System Parachain Para IDs"

            - **Polkadot Hub**: 1000
            - **Bridge Hub**: 1002
            - **People Chain**: 1004
            - **Coretime Chain**: 1005

### Other Parachains

For non-system parachains, check the parachain's documentation for official chain specification files.
