### System Parachains

Obtain the chain specification for your target system parachain using one of the following options:

=== "Download from Chainspec Collection (Recommended)"

    Download the chain specification directly using `curl`. For example, to download the Asset Hub Polkadot chain spec:

    ```bash
    curl -sL -o chain-spec.json \
      https://paritytech.github.io/chainspecs/polkadot/parachain/asset-hub/chainspec.json
    ```

    For other system parachains, find the correct URL in the [Chainspec Collection](https://paritytech.github.io/chainspecs/){target=\_blank} under the [**List of Chainspecs**](https://paritytech.github.io/chainspecs/#list-of-chainspecs){target=\_blank}.

=== "Download from the Polkadot SDK repository"

    Download the chain specification directly using `curl`. For example, to download the Asset Hub Polkadot chain spec:

    ```bash
    curl -sL -o chain-spec.json \
      https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/asset-hub-polkadot.json 
    ```

### Other Parachains

For non-system parachains, check the parachain's documentation for official chain specification files.
