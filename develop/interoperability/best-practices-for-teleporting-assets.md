---
title: Best Practices for Teleporting Assets
description: An in-depth guide on best practices for teleporting assets using XCM
tutorial_badge: Intermediate
---

# Best Practices for Teleporting Assets

## Introduction

Cross-chain asset transfers in the Polkadot ecosystem require careful planning and validation to ensure successful execution. Unlike simple blockchain transactions that either succeed or fail cleanly, XCM operations can result in trapped or lost assets if not properly constructed.

This comprehensive guide outlines essential best practices for teleporting assets using XCM, from pre-flight checks to transaction execution. You'll learn how to avoid common pitfalls, implement proper validation, and ensure your cross-chain transfers succeed reliably.

## Prerequisites

Before implementing asset teleports, ensure you have:

- Strong knowledge of [XCM (Cross-Consensus Messaging)](/develop/interoperability/intro-to-xcm/){target=_blank}
- Firm understanding of [sufficient and non-sufficient assets](/polkadot-protocol/architecture/system-chains/asset-hub/#sufficient-and-non-sufficient-assets){target=_blank}
- Understanding of [existential deposits](/polkadot-protocol/glossary/#existential-deposit){target=_blank} and the [Substrate account model](/polkadot-protocol/parachain-basics/accounts/){target=_blank}

## Teleporting an Asset

Asset teleportation requires comprehensive pre-flight validation to prevent failures and asset loss. 

Here is an example flow of teleporting an asset from a parachain to Asset Hub.

???- example "Teleporting a Non-Sufficient Asset from a Parachain to Asset Hub"

    ```mermaid
    flowchart TD
        A[Teleporting a <br/>Non-Sufficient Asset<br/>from a Parachain to <br/>Asset Hub] --> B[Check account existence<br/>on Asset Hub]
        B --> C{Account exists?}
        C -->|No| D[Account needs to be <br/>created with sufficient <br/>asset for ED]
        C -->|Yes| E[Check existential deposit<br/>on Asset Hub]
        
        D --> F[Ensure sufficient asset<br/>available for ED]
        F --> E
        
        E --> G{Has existential deposit?}
        G -->|No| H[Need sufficient asset<br/>for ED requirement]
        G -->|Yes| I[Check fee coverage]
        
        H --> J[Swap non-sufficient asset<br/>for sufficient asset via<br/>Asset Conversion]
        J --> I
        
        I --> K{Enough funds for fees?}
        K -->|No| L[Estimate fees<br/>using Transaction Payment <br/>API and XCM Payment API]
        K -->|Yes| M[Dry-run cross-chain <br/>transaction]
        
        L --> N[Estimate fee in <br/>non-sufficient asset<br/>using Asset Conversion API]
        N --> O[Ensure sufficient balance<br/>for fees + transfer amount]
        O --> M
        
        M --> P[Local dry-run on <br/>source chain]
        P --> Q{Local dry-run success?}
        Q -->|No| R[Fix local issues<br/>- Insufficient balance<br/>- Invalid XCM construction]
        Q -->|Yes| S[Remote dry-run on <br/>Asset Hub]
        
        R --> P
        
        S --> T{Remote dry-run success?}
        T -->|No| U[Common Issues:<br/>- Missing ED<br/>- Invalid account<br/>- Fee payment failure]
        T -->|Yes| V[Execute cross-chain <br/>transaction]
        
        U --> W[Modify XCM e.g. include<br/>ExchangeAsset instruction<br/>to swap for ED]
        W --> S
        
        V --> X[Transaction complete<br/>asset transferred <br/>successfully]
        
        style A fill:#e1f5fe
        style X fill:#e8f5e8
        style R fill:#ffebee
        style U fill:#ffebee
        style J fill:#fff3e0
        style W fill:#fff3e0
    ```

## Account Existence Verification

Always verify that the destination account exists or can be created before initiating transfers. Account queries should check:

- Account existence on the destination chain
- Current balance and nonce information  
- Whether the account meets existential deposit requirements

???- example "Account Existence Check Examples"

    **Using PolkadotJS API:**
    ```javascript
    async function checkAccountExistence(api, address) {
      const accountInfo = await api.query.system.account(address);
      const balance = accountInfo.data.free.toBigInt();
      const existentialDeposit = api.consts.balances.existentialDeposit.toBigInt();
      
      return {
        exists: !accountInfo.isEmpty,
        balance,
        hasExistentialDeposit: balance >= existentialDeposit
      };
    }
    ```

    **Using Polkadot API (PAPI):**
    ```typescript
    import { dot } from "@polkadot-api/descriptors";
    import { createClient } from "polkadot-api";
    import { getWsProvider } from "polkadot-api/ws-provider/web";

    async function queryAccountBalance(address: string) {
      const client = createClient(getWsProvider("wss://rpc.polkadot.io"));
      const api = client.getTypedApi(dot);
      
      const accountInfo = await api.query.System.Account.getValue(address);
      const existentialDeposit = await api.constants.Balances.ExistentialDeposit();
      
      return {
        balance: accountInfo?.data.free ?? 0n,
        hasED: (accountInfo?.data.free ?? 0n) >= existentialDeposit
      };
    }
    ```

### Existential Deposit Considerations

Existential deposits vary by network and must be maintained to keep accounts active:

- **Polkadot**: 1 DOT (10^10 planck)
- **Kusama**: 0.0033 KSM (3.3 * 10^10 planck)  
- **Asset Hub**: 0.1 DOT (10^9 planck)

For non-sufficient assets, ensure the destination account has sufficient native token or sufficient asset to maintain the ED, or include asset conversion instructions in the XCM.

## Fee Estimation and Coverage

### Runtime API Integration

Use proper runtime APIs for accurate fee estimation rather than hardcoded values:

[Transaction Payment API](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment_rpc/trait.TransactionPaymentRuntimeApi.html){target=\_blank} for local fees:
```typescript
import { dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(getWsProvider("wss://rpc.polkadot.io"));
const api = client.getTypedApi(dot);

const feeDetails = await api.apis.TransactionPaymentApi.query_fee_details(
  call.toHex(),
  call.encodedLength
);
```

[XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} for cross-chain delivery fees:
```typescript
import { dot } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(getWsProvider("wss://rpc.polkadot.io"));
const api = client.getTypedApi(dot);

const deliveryFees = await api.apis.XcmPaymentApi.query_delivery_fees(
  destination,
  message
);
```

[Asset Conversion API](https://paritytech.github.io/polkadot-sdk/master/pallet_asset_conversion/trait.AssetConversionApi.html){target=\_blank} (available on Asset Hub) for fee conversion:
```typescript
import { ah } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(getWsProvider("wss://rpc.polkadot.io"));
const api = client.getTypedApi(ah);

const feeInAsset = await api.apis.AssetConversionApi.quote_price_exact_tokens_for_tokens(
  assetIn,
  assetOut,
  amountIn
);
```

### Multi-Asset Fee Handling

For non-sufficient assets, implement fee payment strategies:

1. **[Asset Conversion](/polkadot-protocol/architecture/system-chains/asset-hub/#non-sufficient-assets){target=\_blank}**: Convert part of the transfer amount to pay fees
2. **Separate Fee Payment**: Use a different sufficient asset for fees
3. **Fee Sponsorship**: Have another account pay fees on behalf of the user

## Asset Type Considerations

### Sufficient Assets

!!!note Sufficient Assets
    Always check the chain to see what assets are considered sufficient assets.
    This may vary from chain to chain.

[Sufficient assets](/polkadot-protocol/architecture/system-chains/asset-hub/#sufficient-assets){target=\_blank} can:

- Pay for transaction fees directly
- Meet existential deposit requirements and can suffice for creating new accounts

**Best Practices:**

- Verify minimum transfer amounts meet destination requirements
- Account for both transaction and existential deposit costs
- Handle automatic account creation scenarios

### Non-Sufficient Assets

[Non-sufficient assets](/polkadot-protocol/architecture/system-chains/asset-hub/#non-sufficient-assets){target=\_blank} require:

- Existing destination accounts with ED
- Alternative fee payment mechanisms

**Best Practices:**

- Always verify recipient account status
- Include asset conversion for ED if needed
- Plan for fee payment using sufficient assets
- Test with realistic scenarios including account creation

## Comprehensive Dry Run Testing

Dry run testing represents the most critical step in preventing asset loss during teleportation. Execute dry runs on both the source and destination chains to validate every aspect of the transfer before committing to the actual transaction. Local dry runs on the source chain validate transaction construction correctness, sufficient balance for transfer and fees, and proper XCM message generation. Remote dry runs on the destination chain verify that the XCM message will execute successfully, including asset reception and processing, account creation or balance updates, and proper fee deduction. This two-phase validation approach catches the majority of potential issues before they can cause problems in production.

### Example Dry Run Implementation

???- example "Comprehensive Dry Run Example"

    ```typescript title="dry-run-example.ts"
    --8<-- 'code/develop/interoperability/best-practices-for-teleporting-assets/dry-run-example.ts:0:180'
    ```

## Common Errors and Prevention

Asset teleportation failures can occur for various reasons, each with specific causes and prevention strategies. Understanding these common error patterns helps you implement proper validation and avoid the most frequent pitfalls that lead to failed transfers or trapped assets. Each error type requires different diagnostic approaches and preventive measures to ensure reliable cross-chain operations.

### Common Account and Balance Issues

| **[FailedToTransactAsset](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.FailedToTransactAsset){target=\_blank} Errors** | **Prevention** |
|-----------------------------------|----------------|
| • Missing destination accounts<br>• Insufficient existential deposits<br>• Asset not found on destination | • Verify account existence before transfer<br>• Ensure ED requirements are met<br>• Validate asset registration on destination chain |

### Fee Payment Failures

| **[TooExpensive](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.TooExpensive){target=\_blank} Errors** | **Prevention** |
|-------------------------|----------------|
| • Insufficient funds for fees<br>• Fee payment asset not accepted<br>• High network congestion costs | • Implement proper fee estimation<br>• Include buffer for fee fluctuations<br>• Use asset conversion when necessary |

### Asset Compatibility Issues

| **[AssetNotFound](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.AssetNotFound){target=\_blank} Errors** | **Prevention** |
|--------------------------------------|----------------|
| • Asset not registered on destination<br>• Incorrect asset ID or format<br>• Asset not enabled for XCM | • Verify asset registration before transfer<br>• Use correct asset identifiers<br>• Check XCM configuration for asset support |

### XCM Configuration Issues

| **[Barrier](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html#variant.Barrier){target=\_blank} Errors** | **Prevention** |
|:-------------------|:---------------|
| • XCM message blocked by safety barriers<br>• Origin not authorized for operation<br>• Asset transfer limits exceeded<br>• Unsupported XCM version or instruction | • Verify XCM barrier configuration on destination<br>• Ensure origin has proper permissions<br>• Check asset transfer limits and restrictions<br>• Use supported XCM version and instructions |

You can find a full list of XCM errors in the [Polkadot Rust Docs](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.XcmError.html){target=\_blank}.

## Network-Specific Considerations

### Testnet vs Mainnet Configuration

Different networks within the Polkadot ecosystem have varying characteristics that affect teleportation implementation. Testnet environments like Paseo use different decimal precision (12 for PAS vs 10 for DOT), can have different existential deposit amounts, and require test-specific RPC endpoints. Always use appropriate configuration for the target environment and avoid mixing testnet and mainnet configurations.

Mainnet production environments require higher existential deposits, involve real economic value at risk, experience network congestion that affects fees, and have stricter validation requirements. Plan for these production realities by implementing robust error handling, fee buffers, and comprehensive monitoring systems.

### Parachain Compatibility

Parachain compatibility varies significantly across the ecosystem. Different parachains support different XCM versions (V2, V3, V4, V5), have unique lists of sufficient and non-sufficient assets, varying asset registration requirements, different fee payment mechanisms, distinct barrier configurations, and different asset conversion capabilities. Always verify compatibility thoroughly before implementing cross-chain transfers to new destinations.

## Error Handling Strategies

### Graceful Degradation

Implement fallback mechanisms for common failures:

```typescript
function handleXcmError(error) {
  if (error.includes('FailedToTransactAsset')) {
    // Try with asset conversion or ED funding
    return retryWithConversion();
  }
  
  if (error.includes('TooExpensive')) {
    // Wait for lower network congestion or increase fee
    return retryWithHigherFee();
  }
  
  if (error.includes('Barrier')) {
    // Check asset permissions and XCM configuration
    return validateAssetPermissions();
  }
  
  throw new Error(`Unhandled XCM error: ${error}`);
}
```

### Recovering Trapped Assets

XCM has the [`ClaimAsset`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/enum.Instruction.html#variant.ClaimAsset){target=\_blank} instruction which can be utilized to recover trapped assets. Typically on a live chain this would have to go through a governance proposal.

## Production Deployment Checklist

Before deploying asset teleportation features:

- Comprehensive dry run testing implemented
- Account existence validation in place
- Proper fee estimation using runtime APIs
- Asset compatibility verified across target networks
- Error handling and recovery procedures documented
- Monitoring and alerting systems configured
- Incident response procedures established
- User education materials prepared

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