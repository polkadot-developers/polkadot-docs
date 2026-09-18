# --8<-- [start:introduction]
Validators and collators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. 
This key ensures that your node can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.
# --8<-- [end:introduction]

# --8<-- [start:commands]
Follow these steps to generate a node key:

1. Generate your node key using Docker:

    ```bash
    docker run -it parity/subkey:latest generate-node-key > node.key
    ```

2. Locate your peer ID in the displayed output. It will be similar to the following example:

    ```bash
    12D3KooWExcVYu7Mvjd4kxPVLwN2ZPnZ5NyLZ5ft477wqzfP2q6E
    ```

Be sure to save the peer ID for future reference.
# --8<-- [end:commands]