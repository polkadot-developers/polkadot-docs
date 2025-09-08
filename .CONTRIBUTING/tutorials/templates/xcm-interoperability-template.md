---
title: [Your XCM/Interoperability Tutorial Title - Max 45 chars]
description: [Description of cross-chain operation - 120-160 chars]
tutorial_badge: Beginner | Intermediate | Advanced
categories: Interoperability, XCM, Cross-chain, Asset Transfer
---

# [Your XCM/Interoperability Tutorial Title]

## Introduction

[2-3 paragraphs explaining:]
- What cross-chain operation users will perform
- Why this interoperability feature is important
- What chains/assets will be involved

## Prerequisites

Before starting, ensure you have:

- Polkadot.js extension wallet installed
- Test tokens on relevant chains:
  - [Chain 1]: [Required tokens]
  - [Chain 2]: [Required tokens]
- Basic understanding of XCM concepts
- Access to testnet networks (if applicable)

## Step 1: Chopsticks Environment Setup

First, we'll set up Chopsticks to simulate the network environment for XCM testing.

### Install Chopsticks

```bash
npm install @acala-network/chopsticks@latest
```

### Configure Networks

Create a chopsticks configuration file for your networks:

### Network Configuration
```javascript
// Add network configurations to Polkadot.js
const networks = {
  assetHub: 'wss://statemint-rpc.polkadot.io',
  parachain: 'wss://[parachain-endpoint]'
};
```

### Account Setup
1. Create or import accounts on both chains
2. Fund accounts with necessary tokens
3. Verify account balances

## Step 2: Understanding the Cross-Chain Flow

[Explain the specific XCM operation being performed]

### XCM Message Structure
```rust
// Example XCM instruction set
let xcm = Xcm(vec![
    WithdrawAsset(assets),
    BuyExecution { fees, weight_limit },
    DepositAsset {
        assets: Wild(All),
        max_assets: 1,
        beneficiary: destination_account,
    },
]);
```

### Chain Interaction Flow
1. **Origin Chain**: [What happens on the source chain]
2. **Relay Chain**: [How the relay chain processes the message]
3. **Destination Chain**: [What happens on the destination chain]

## Step 3: [Specific XCM Operation - e.g., Asset Transfer]

[Detailed steps for the specific cross-chain operation]

### Using Polkadot.js Apps
1. Navigate to [relevant extrinsic section]
2. Configure the cross-chain message:
   - **Destination**: [Specific destination format]
   - **Assets**: [Asset specification]
   - **Fee**: [Fee calculation method]

### Example Transaction
```javascript
// JavaScript example for programmatic interaction
const transfer = api.tx.xcmPallet.limitedReserveTransferAssets(
  destination,
  beneficiary,
  assets,
  feeAssetItem,
  weightLimit
);
```

![XCM transaction setup](/images/tutorials/interoperability/[category]/[tutorial-name]/xcm-setup.webp)

!!!tip "Screenshot Dimensions"
    Desktop screenshots: 1512px width, variable height. Browser extensions: 400x600px.

## Step 4: Execution and Monitoring

Execute the cross-chain operation:

1. **Submit transaction** on origin chain
2. **Monitor transaction** progress:
   - Check origin chain events
   - Track relay chain processing
   - Verify destination chain execution

### Transaction Monitoring
```bash
# Monitor events using subxt or similar tools
cargo run -- monitor-xcm --transaction-hash [hash]
```

## Step 5: Verification

Verify the successful cross-chain operation:

1. **Check origin chain**: Verify asset deduction
2. **Check destination chain**: Verify asset arrival
3. **Analyze XCM events**: Review execution events
4. **Calculate fees**: Understand fee deduction

Expected results:
- Origin chain balance: [Expected change]
- Destination chain balance: [Expected change]
- XCM execution status: Success

## Testing with XCM Simulator [Optional]

For development and testing:

```rust
// XCM Simulator test setup
use xcm_simulator::*;

#[test]
fn test_cross_chain_transfer() {
    // Test implementation
}
```

## Advanced XCM Patterns [For Advanced Tutorials]

[Include for intermediate/advanced tutorials:]

### Multi-hop XCM
- Routing through multiple chains
- Complex asset transformations

### Custom XCM Instructions
- Building custom message flows
- Handling errors and retries

## Where to Go Next

Continue exploring cross-chain operations:
- [Related XCM tutorial for different operation]
- [Advanced channel management tutorial]
- [XCM testing and debugging guide]

## Additional Resources

- [XCM Format Documentation](https://github.com/paritytech/xcm-format){target=\_blank} 
- [Polkadot.js XCM Tools](https://polkadot.js.org/apps/){target=\_blank} 
- [XCM Simulator](https://github.com/paritytech/polkadot/tree/master/xcm/xcm-simulator){target=\_blank} 
- [Cross-Chain Asset Registry](https://github.com/paritytech/asset-registry){target=\_blank} 