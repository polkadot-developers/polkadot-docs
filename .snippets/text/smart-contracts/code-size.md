!!! note "Contracts Code Blob Size Disclaimer"
    The maximum contract code blob size on Polkadot Hub networks is *100 kilobytes*, significantly larger than Ethereum’s EVM limit of 24 kilobytes. This difference stems from fundamental architectural distinctions between the two virtual machines:

    - **PolkaVM**: Uses a RISC-V, register-based architecture, allowing for more efficient code compilation and larger contract sizes
    - **EVM**: Uses a stack-based architecture with stricter size constraints due to gas optimization and network efficiency considerations

    For detailed comparisons and migration guidelines, see the [EVM vs. PolkaVM](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/#current-memory-limits){target=\_blank} documentation page.
