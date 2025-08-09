---
title: Interact with the XCM Precompile
description: Learn how to use the XCM precompile to send cross-chain messages, execute XCM instructions, and estimate costs from your smart contracts.
categories: Smart Contracts
---

# XCM Precompile

## Introduction

The [XCM (Cross-Consensus Message)](/develop/interoperability/intro-to-xcm){target=\_blank} precompile enables Polkadot Hub developers to access XCM functionality directly from their smart contracts using a Solidity interface.

Located at the fixed address `0x00000000000000000000000000000000000a0000`, the XCM precompile offers three primary functions:

- **`execute`**: For local XCM execution.
- **`send`**: For cross-chain message transmission.
- **`weighMessage`**: For cost estimation.

This guide demonstrates how to interact with the XCM precompile through Solidity smart contracts using [Remix IDE](/develop/smart-contracts/dev-environments/remix){target=\_blank}.

!!!note
    The XCM precompile provides the barebones XCM functionality. While it provides a lot of flexibility, it doesn't provide abstractions to hide away XCM details. These have to be built on top.

## Precompile Interface

The XCM precompile implements the `IXcm` interface, which defines the structure for interacting with XCM functionality. The source code for the interface is as follows:

```solidity title="IXcm.sol"
--8<-- "https://raw.githubusercontent.com/paritytech/polkadot-sdk/cb629d46ebf00aa65624013a61f9c69ebf02b0b4/polkadot/xcm/pallet-xcm/src/precompiles/IXcm.sol"
```

The interface defines a `Weight` struct that represents the computational cost of XCM operations. Weight has two components: 

- **`refTime`**: Computational time on reference hardware.
- **`proofSize`**: The size of the proof required for execution.

All XCM messages must be encoded using the [SCALE codec](/polkadot-protocol/parachain-basics/data-encoding/#data-encoding){target=\_blank}, Polkadot's standard serialization format.

For further information, check the [`precompiles/IXCM.sol`](https://github.com/paritytech/polkadot-sdk/blob/cb629d46ebf00aa65624013a61f9c69ebf02b0b4/polkadot/xcm/pallet-xcm/src/precompiles/IXcm.sol){target=\_blank} file present in `pallet-xcm`.

## Interact with the XCM Precompile

To interact with the XCM precompile, you can use the precompile interface directly in [Remix IDE](/develop/smart-contracts/dev-environments/remix/){target=\_blank}:

1. Create a new file called `IXcm.sol` in Remix.
2. Copy and paste the `IXcm` interface code into the file.
3. Compile the interface by selecting the button or using **Ctrl +S** keys:

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-01.webp)

4. In the **Deploy & Run Transactions** tab, select the `IXcm` interface from the contract dropdown.
5. Enter the precompile address `0x00000000000000000000000000000000000a0000` in the **At Address** input field.
6. Select the **At Address** button to connect to the precompile.

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-02.webp)

7. Once connected, you can use the Remix interface to interact with the XCM precompile's  `execute`, `send`, and `weighMessage` functions.

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-03.webp)

The main entrypoint of the precompile is the `execute` function. However, it's necessary to first call `weighMessage` to fill in the required parameters.

### Weigh a Message

The `weighMessage` function estimates the computational cost required to execute an XCM message. This estimate is crucial for understanding the resources needed before actually executing or sending a message.

To test this functionality in Remix, you can call `callWeighMessage` with a SCALE-encoded XCM message. For example, for testing, you can use the following encoded XCM message:

```text title="encoded-xcm-message-example"
0x050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e
```

![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-04.webp)

This encoded message represents a sequence of XCM instructions:

- **[Withdraw Asset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#withdrawasset){target=\_blank}**: This instruction removes assets from the local chain's sovereign account or the caller's account, making them available for use in subsequent XCM instructions.
- **[Buy Execution](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#buyexecution){target=\_blank}**: This instruction purchases execution time on the destination chain using the withdrawn assets, ensuring the message can be processed.
- **[Deposit Asset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#depositasset){target=\_blank}**: This instruction deposits the remaining assets into a specified account on the destination chain after execution costs have been deducted.

This encoded message is provided as an example. You can craft your own XCM message tailored to your specific use case as needed.

The function returns a `Weight` struct containing `refTime` and `proofSize` values, which indicate the estimated computational cost of executing this message. If successful, after calling the `callWeighMessage` function, you should see the `refTime` and `proofSize` of the message:

![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-05.webp)

!!!note
    You can find many more examples of XCMs in this [gist](https://gist.github.com/franciscoaguirre/a6dea0c55e81faba65bedf700033a1a2){target=\_blank}, which connects to the Polkadot Hub TestNet.

### Execute a Message

The `execute` function runs an XCM message locally using the caller's origin.
This function is the main entrypoint to cross-chain interactions.

Follow these steps to execute a message:

1. Call `weighMessage` with your message to get the required weight.
2. Pass the same message bytes and the weight obtained from the previous step to `execute`.
For example, using the same message from the weighing example, you would call `execute` with:

    - **`message`**: The encoded XCM message bytes.
    - **`weight`**: The `Weight` struct returned from `weighMessage`.

    You can use the [papi console](https://dev.papi.how/extrinsics#networkId=localhost&endpoint=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io&data=0x1f03050c000401000003008c86471301000003008c8647000d010101000000010100368e8759910dab756d344995f1d3c79374ca8f70066d3a709e48029f6bf0ee7e0750c61e2901daad0600){target=\_blank} to examine the complete extrinsic structure for this operation.

3. On Remix, click on the **Transact** button to execute the XCM message:
  
    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-06.webp)

    If successful, you will see the following output in the Remix terminal:

    ![](/images/develop/smart-contracts/precompiles/xcm-precompile/xcm-precompile-07.webp)

Additionally, you can verify that the execution of this specific message was successful by checking that the beneficiary account associated with the XCM message has received the funds accordingly.

### Send a Message

While most cross-chain operations can be performed via `execute`, `send` is sometimes necessary, for example, when opening HRMP channels.

To send a message:

1. Prepare your destination location encoded in XCM format.
2. Prepare your XCM message (similar to the execute example).
3. Call `send` with both parameters.

The destination parameter must be encoded according to XCM's location format, specifying the target parachain or consensus system. The message parameter contains the XCM instructions to be executed on the destination chain.

Unlike `execute`, the `send` function doesn't require a weight parameter since the destination chain will handle execution costs according to its fee structure.

## Cross Contract Calls

Beyond direct interaction and wrapper contracts, you can integrate XCM functionality directly into your existing smart contracts by inheriting from or importing the `IXcm` interface. This approach enables you to embed cross-chain capabilities into your application logic seamlessly.

Whether you're building DeFi protocols, governance systems, or any application requiring cross-chain coordination, you can incorporate XCM calls directly within your contract's functions.

## Conclusion

The XCM precompile provides a simple yet powerful interface for cross-chain interactions within the Polkadot ecosystem and beyond.
By building and executing XCM programs, developers can build cross-chain applications that leverage the full potential of Polkadot's interoperability features.

## Next steps

Head to the Polkadot Hub TestNet and start playing around with the precompile using Hardhat or Foundry.

You can use PAPI to build XCM programs and test them with Chopsticks.
