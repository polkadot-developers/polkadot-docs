---
title: Best Practices for Teleporting Assets
description: An in-depth guide on best practices for teleporting assets using XCM including pre-flight validation, fee estimation, dry-run testing, and error prevention.
---

# Best Practices for Teleporting Assets

## Introduction

Cross-chain asset transfers in the Polkadot ecosystem require careful planning and validation to ensure successful execution. Unlike simple blockchain transactions that either succeed or fail cleanly, XCM operations can result in trapped or lost assets if not properly constructed.

This comprehensive guide outlines essential best practices for teleporting assets using XCM, from pre-flight checks to transaction execution. You'll learn how to avoid common pitfalls, implement proper validation, and ensure your cross-chain transfers succeed reliably.

## Prerequisites

Before implementing asset teleports, ensure you have:

- Strong knowledge of [XCM (Cross-Consensus Messaging)](/develop/interoperability/intro-to-xcm/){target=\_blank}.
- Firm understanding of [sufficient and non-sufficient assets](/polkadot-protocol/architecture/system-chains/asset-hub/#sufficient-and-non-sufficient-assets){target=\_blank}.
- Understanding the concept of [existential deposits](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} and the [Polkadot SDK account model](/polkadot-protocol/parachain-basics/accounts/){target=\_blank}.

## Account Existence and Balance

Always verify that the destination account exists or can be created before initiating transfers. 

Account queries should check:

- Account creation and existence on the destination chain.
    - The correct address and address format is used.
    - Whether the account meets existential deposit requirements.
- Balance of the sending account has:
    - Enough to pay for fees (transaction fees, XCM execution and delivery fees, and/or swap fees).
    - Enough to cover the existential deposit before and after the transfer.
- Balance of the recipient account has:
    - Enough to cover for the existential deposit.
    - The total amount expected to be received.


You can refer to the following snippet as an example of checking for the Existential Deposit (ED) of a specific account:

??? code "Account Existence Examples"

    === "Polkadot.js API"
        ```javascript
        --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/account-existence.js'
        ```

    === "Polkadot API (PAPI)"
        ```typescript
        --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/account-existence.ts'
        ```

!!!note "Existential Deposit Considerations"
    Existential deposits vary by network and must be maintained to keep accounts active:

    - **Polkadot**: 1 DOT (10^10 planck)
    - **Kusama**: 0.0033 KSM (3.3 * 10^10 planck)  
    - **Asset Hub**: 0.01 DOT (10^8 planck)

For non-sufficient assets, make sure the destination account has a sufficient amount in the form of a native or sufficient asset to cover for the ED; otherwise, include asset conversion instructions in the XCM to swap for a sufficient asset or native token.

## Fee Estimation and Coverage

When it comes to transaction fees, XCM execution and delivery fees, and asset conversion swapping fees, you can use associated runtime APIs to obtain an accurate estimate of the fee rather than hardcoded values.

### Runtime API Integration

- [Transaction Payment API](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment_rpc/trait.TransactionPaymentRuntimeApi.html){target=\_blank} for local fees:

    ```typescript
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/tx-payment-api.ts'
    ```
  This code establishes a connection to the Polkadot network and queries detailed fee information for a specific transaction call, including base fees, length fees, and tip calculations.


- [XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} for local XCM execution fees:

    ```typescript
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/xcm-execution-fees.ts'
    ```
  This code calculates the local XCM execution fees required to execute an XCM message on the parachain.


- [XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} for cross-chain delivery fees:

    ```typescript
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/xcm-delivery-fees.ts'
    ```
  This code calculates the delivery fees required to send an XCM message to a specific destination parachain, helping estimate cross-chain transaction costs.


- [Asset Conversion API](https://paritytech.github.io/polkadot-sdk/master/pallet_asset_conversion/trait.AssetConversionApi.html){target=\_blank} (available on Asset Hub) for fee conversion:

    ```typescript
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/asset-conversion-api.ts'
    ```
  This code connects to Asset Hub's `AssetConversionApi` and calculates the exchange rate between different assets, allowing users to determine how much of one token they need to pay fees in another token.

### Multi-Asset Fee Handling

For dealing with non-sufficient assets and fees, there are different fee payment strategies you can implement:

1. **[Asset Conversion](/polkadot-protocol/architecture/system-chains/asset-hub/#non-sufficient-assets){target=\_blank}**: Convert part of the transfer amount to pay fees.
2. **Separate Fee Payment**: Use a different sufficient asset for fees.
3. **Fee Sponsorship**: Have another account pay fees on behalf of the user.

## Asset Type Considerations

### Sufficient Assets

Sufficient assets can:

- Suffice for account existence by meeting the existential deposit requirements.
- Pay for transaction and, if the chain configuration allows, sufficient assets can also be used for XCM execution and delivery fees.

!!!note Sufficient Assets
    Always check the chain to see what assets are considered sufficient assets.
    This may vary from chain to chain.

### Non-Sufficient Assets

Non-sufficient assets can:

- Pay for transaction and XCM execution/delivery fees by swapping for a sufficent asset.
- Be used to create new accounts by swapping for an exact amount of a sufficient asset to cover for the existential deposit of the new account.

!!!note Swapping Non-Sufficient Assets
    Swapping non-sufficient assets for a sufficient asset can be done with the help of [asset conversion](https://wiki.polkadot.network/learn/learn-asset-conversion-assethub){target=\_blank} which is live on Asset Hub. Always make sure there is an associated liquidity pool with healthy liquidity for the pair that you intend to swap.

Always verify that the amount expected to be recieved in the recipient account is the amount expected after all fees are deducted (transaction fees, XCM fees, and/or swapping fees).

From a UX perspective, when designing cross-chain applications, consider **who** will be paying for the fees.

**Example scenario**: Sending 100 USDT to a new Asset Hub account.

- Option 1 - Deduct from sending amount:

    - **Receiver gets**: 100 USDT - 0.01 DOT (for ED) - transaction and XCM fees.
    - **Sender pays**: Exactly 100 USDT total.
    - Simpler for sender, but receiver gets less than expected.

- Option 2 - Additional sender cost:

    - Receiver gets: full 100 USDT + 0.01 DOT (for ED).
    - Sender pays: 100 USDT + 0.01 DOT (for ED) + transaction and XCM fees.
    - More expensive for sender, but receiver gets full amount.

## Comprehensive Dry Run Testing

Dry run testing represents the most critical step in preventing asset loss during teleportation. Execute dry runs on both the source and destination chains to validate every aspect of the transfer before committing to the actual transaction. You can perform local dry runs or remote dry runs:

- Local dry runs on the source chain validate transaction construction correctness, sufficient balance for transfer and fees, and proper XCM message generation. 
- Remote dry runs on the destination chain verify that the XCM message will execute successfully, including asset reception and processing, account creation or balance updates, and proper fee deduction.

This two-phase validation approach catches the majority of potential issues before they can cause problems in production.

Below is an example of a dry run implementation using PAPI.

??? code "Comprehensive Dry Run Example"

    ```typescript title="dry-run-example.ts"
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/dry-run-example.ts'
    ```

## Common Errors and Prevention

Asset teleportation failures can occur for various reasons, each with specific causes and prevention strategies. Understanding these common error patterns helps you implement proper validation and avoid the most frequent pitfalls that lead to failed transfers or trapped assets. Each error type requires different diagnostic approaches and preventive measures to ensure reliable cross-chain operations.

### Common Account and Balance Issues

**[FailedToTransactAsset](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.FailedToTransactAsset) Errors**

- **Common Causes:**
    - Missing destination accounts.  
    - Insufficient existential deposits.
    - Asset not found on destination.

- **Prevention:**
    - Verify account existence before transfer.
    - Ensure existential deposit (ED) requirements are met.
    - Validate asset registration on the destination chain.

---

### Fee Payment Failures

**[TooExpensive](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.TooExpensive) Errors**

- **Common Causes:**
    - Insufficient funds for fees  
    - Fee payment asset not accepted  
    - High network congestion costs  

- **Prevention:**
    - Implement proper fee estimation  
    - Include a buffer for fee fluctuations  
    - Use asset conversion when necessary  

---

### Asset Compatibility Issues

**[AssetNotFound](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.AssetNotFound) Errors**

- **Common Causes:**
    - Asset not registered on the destination  
    - Incorrect asset ID or format  
    - Asset not enabled for XCM  

- **Prevention:**
    - Verify asset registration before transfer  
    - Use correct asset identifiers  
    - Check XCM configuration for asset support  

---

### XCM Configuration Issues

**[Barrier](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.Barrier) Errors**

- **Common Causes:**
    - XCM message blocked by safety barriers  
    - Origin not authorized for operation  
    - Asset transfer limits exceeded  
    - Unsupported XCM version or instruction  

- **Prevention:**
    - Verify XCM barrier configuration on the destination  
    - Ensure origin has proper permissions  
    - Check asset transfer limits and restrictions  
    - Use supported XCM version and instructions  

You can find a full list of XCM errors in the [Polkadot Rust Docs](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html){target=\_blank}.

## Network-Specific Considerations

### TestNet vs MainNet Configuration

Different networks within the Polkadot ecosystem have varying characteristics that affect teleportation implementation. TestNet environments like [Westend](/develop/networks/#westend){target=\_blank} use different decimal precision (12 for WND vs 10 for DOT), can have different existential deposit amounts, and require test-specific RPC endpoints. Always use appropriate configuration for the target environment and avoid mixing TestNet and MainNet configurations.

MainNet production environments require higher existential deposits, involve real economic value at risk, experience network congestion that affects fees, and have stricter validation requirements. Plan for these production realities by implementing robust error handling, fee buffers, and comprehensive monitoring systems.

### Parachain Compatibility

Parachain compatibility varies significantly across the ecosystem. Different parachains support different XCM versions (V3, V4, V5), have unique lists of sufficient and non-sufficient assets, varying asset registration requirements, different fee payment mechanisms, distinct barrier configurations, and different asset conversion capabilities. Always verify compatibility thoroughly before implementing cross-chain transfers to new destinations.

### Recovering Trapped Assets

XCM has the [`ClaimAsset`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.Instruction.html#variant.ClaimAsset){target=\_blank} instruction which can be utilized to recover trapped assets. Typically on a live chain this would have to go through a governance proposal. However if you construct your XCM's using the [`AssetClaimer`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.Hint.html#variant.AssetClaimer) hint, you can designate which account has permissions to claim the trapped asset and therefore not need to go through governance for a privileged call.

## Conclusion

Successful asset teleportation requires meticulous validation, proper error handling, and comprehensive testing. Always prioritize safety over convenience, implement thorough dry run testing, and maintain robust monitoring systems to ensure reliable cross-chain asset transfers.

The key to preventing asset loss is comprehensive pre-flight validation combined with proper XCM construction and execution monitoring. When in doubt, always dry run transactions on both source and destination chains before execution.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Tutorial</span> __Batch Teleport__

    ---

    A tutorial detailing the step-by-step process of batch teleporting assets using the ParaSpell SDK.

    [:octicons-arrow-right-24: Batch Teleport](/tutorials/polkadot-sdk/system-chains/asset-hub/batch-teleport-assets){target=\_blank}
</div>