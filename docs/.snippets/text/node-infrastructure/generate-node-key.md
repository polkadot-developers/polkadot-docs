# --8<-- [start:introduction]
Validators and collators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity.
This key ensures that your node can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.
# --8<-- [end:introduction]

# --8<-- [start:command]
Follow these steps to generate a node key:

1. Generate your node key using one of the following options:

    === "Docker"

        ```bash
        docker run --rm parity/subkey:latest generate-node-key > node.key
        ```
# --8<-- [end:command]

# --8<-- [start:polkadot]
    === "polkadot binary"

        ```bash
        polkadot key generate-node-key --file node.key
        ```
# --8<-- [end:polkadot]

# --8<-- [start:polkadot-parachain]
    === "polkadot-parachain binary"

        ```bash
        polkadot-parachain key generate-node-key --file node.key
        ```
# --8<-- [end:polkadot-parachain]

# --8<-- [start:conclusion]
2. Locate your peer ID in the displayed output. The peer ID is similar to this example:

    ```text
    12D3KooWExcVYu7Mvjd4kxPVLwN2ZPnZ5NyLZ5ft477wqzfP2q6E
    ```

Be sure to save the peer ID for future reference.
# --8<-- [end:conclusion]
