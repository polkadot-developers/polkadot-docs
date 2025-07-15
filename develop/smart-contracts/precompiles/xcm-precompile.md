---
title: Interact with the XCM Precompile
description: Learn how to use the XCM precompile to send cross-chain messages, execute XCM instructions, and estimate costs from your smart contracts
---

# XCM Precompile

## Introduction

The XCM (Cross-Consensus Message) precompile enables Polkadot Hub developers to access XCM functionality directly from their smart contracts. This precompile enables contracts to send cross-chain messages, execute XCM instructions locally, and estimate execution costs—all through a standardized Solidity interface.

Located at the fixed address `0x00000000000000000000000000000000000a0000`, the XCM precompile offers three primary functions: `execute` for local XCM execution, `send` for cross-chain message transmission, and `weighMessage` for cost estimation. This guide demonstrates how to interact with the XCM precompile through Solidity smart contracts using [Remix IDE](/develop/smart-contracts/dev-environments/remix.md){target=\_blank}.

## Precompile Interface

The XCM precompile implements the `IXcm` interface, which defines the structure for interacting with XCM functionality:

```solidity title="IXcm.sol"
--8<-- "https://raw.githubusercontent.com/paritytech/polkadot-sdk/cb629d46ebf00aa65624013a61f9c69ebf02b0b4/polkadot/xcm/pallet-xcm/src/precompiles/IXcm.sol"
```

The interface defines a `Weight` struct that represents the computational cost of XCM operations. Weight has two components: `refTime` (computational time on reference hardware) and `proofSize` (size of the proof needed for execution). All XCM messages must be encoded using the [SCALE codec](/polkadot-protocol/parachain-basics/data-encoding/#data-encoding){target=\_blank}, Polkadot's standard serialization format.

For further information, check the [`precompiles/IXCM.sol`](https://github.com/paritytech/polkadot-sdk/blob/cb629d46ebf00aa65624013a61f9c69ebf02b0b4/polkadot/xcm/pallet-xcm/src/precompiles/IXcm.sol){target=\_blank} file present in the `pallet-xcm`.

## XCM Caller Contract

The `XcmCaller` contract provides a convenient wrapper around the XCM precompile, handling the low-level interactions and providing a more user-friendly interface:

```solidity title="XcmCaller.sol"
--8<-- "code/develop/smart-contracts/precompiles/xcm-precompile/XcmCaller.sol"
```

The contract utilizes an immutable address that points to the XCM precompile and provides three wrapper functions corresponding to the precompile's interface methods. The `receive()` function enables the contract to accept tokens, which may be required for specific XCM operations.

### Weight a Message

The `weighMessage` function estimates the computational cost required to execute an XCM message. This is crucial for understanding the resources needed before actually executing or sending a message.

To test this functionality in Remix:

1. Copy and paste the `IXCM` interface and the `XCMCaller` contract into a Solidity file
2. Compile the contract

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-01.webp)

3. Deploy the `XcmCaller` contract

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-02.webp)

4. Call `callWeighMessage` with a SCALE encoded XCM message. For example, for testing, you can use the following encoded XCM message:

    ```text title="encoded-xcm-message-example"
    0x050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e
    ```

    This encoded message represents a sequence of XCM instructions:

    - **[Withdraw Asset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#withdrawasset){target=\_blank}**: This instruction removes assets from the local chain's sovereign account or the caller's account, making them available for use in subsequent XCM instructions.
    - **[Buy Execution](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#buyexecution){target=\_blank}**: This instruction purchases execution time on the destination chain using the withdrawn assets, ensuring the message can be processed.
    - **[Deposit Asset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#depositasset){target=\_blank}**: This instruction deposits the remaining assets into a specified account on the destination chain after execution costs have been deducted.

    This encoded message is provided as an example. You can craft your own XCM message tailored to your specific use case as needed

The function returns a `Weight` struct containing `refTime` and `proofSize` values, which indicate the estimated computational cost of executing this message. If successful, after calling the `callWeighMessage` function, you should see the `refTime` and `proofSize` of the message:

![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-03.webp)

### Execute a Message

The `execute` function runs an XCM message locally using the caller's origin. This is useful for executing XCM instructions that don't require cross-chain communication.

To execute a message:

1. First, ensure that your contract has enough funds to cover the execution costs of calling the XCM message. Check the [Test Token](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section for more information
2. Call `callWeighMessage` with your XCM message to get the required weight
3. Use the returned weight values when calling `callXcmExecute`
4. Pass the same XCM message bytes and the weight obtained from the previous step. For example, using the same message from the weighing example, you would call `callXcmExecute` with:

    - `message`: The encoded XCM message bytes.
    - `weight`: The `Weight` struct returned from `callWeighMessage`.

    You can examine the full extrinsic structure for this operation [here](https://dev.papi.how/extrinsics#networkId=localhost&endpoint=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io&data=0x1f03050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e0750c61e2901daad0600).

5. Click on the **Transact** button to execute the xcm message:
  
    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-04.webp)

If successful, you will see the following output in the Remix terminal:

![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-05.webp)

Also, you can verify that the execution of this specific message succeeded by checking that the beneficiary account of the xcm message has received the funds accordingly.

### Send a Message

The `send` function transmits an XCM message to a destination chain. This is the core functionality for cross-chain communication.

To send a message:

1. Prepare your destination location encoded in XCM format
2. Prepare your XCM message (similar to the execute example)
3. Call `callXcmSend` with both parameters

The destination parameter must be encoded according to XCM's location format, specifying the target parachain or consensus system. The message parameter contains the XCM instructions to be executed on the destination chain.

Unlike `execute`, the `send` function doesn't require a weight parameter since the destination chain will handle execution costs according to its own fee structure.

## Conclusion

The XCM precompile provides a powerful interface for cross-chain interactions within the Polkadot ecosystem. By understanding how to properly encode messages, estimate weights, and execute or send XCM instructions, developers can build sophisticated cross-chain applications that leverage the full potential of Polkadot's interoperability features.

<!-- The examples in this guide demonstrate the basic patterns for interacting with the XCM precompile through Remix IDE. For more comprehensive examples and testing scenarios, check out the [XCM Hardhat example](https://github.com/polkadot-developers/polkavm-hardhat-examples){target=\_blank} which provides additional tools and test cases for working with XCM precompiles in a development environment. -->