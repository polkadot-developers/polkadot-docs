---
title: [Your Governance Tutorial Title - Max 45 chars]
description: [Description of governance operation - 120-160 chars]
tutorial_badge: Beginner | Intermediate | Advanced
categories: Governance, OpenGov, Proposals, Voting, PAPI
---

# [Your Governance Tutorial Title]

## Introduction

[2-3 paragraphs explaining:]
- What governance operation developers will implement programmatically
- Why this governance action is important for the network
- What technical concepts and APIs will be used (PAPI, extrinsics, etc.)

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or later) and npm/yarn installed
- Basic knowledge of TypeScript/JavaScript
- Understanding of Polkadot governance concepts (referenda, conviction voting)
- Test tokens on [relevant network] for transaction fees
- Familiarity with PAPI (Polkadot API)

## Project Setup

Set up your development environment:

```bash title="terminal"
# Create new project
mkdir polkadot-governance-tutorial
cd polkadot-governance-tutorial
npm init -y

# Install PAPI and dependencies
npm install polkadot-api@VERSION @polkadot-api/descriptors@VERSION
npm install --save-dev @types/node@VERSION typescript@VERSION ts-node@VERSION
```

Expected project structure:
```
polkadot-governance-tutorial/
├── src/
│   ├── governance.ts
│   ├── voting.ts
│   └── monitoring.ts
├── package.json
└── tsconfig.json
```

## Setting Up PAPI Connection

Create the foundation for governance interactions:

```typescript title="src/governance.ts"
import { createClient } from "@polkadot-api/substrate-client"
import { getPolkadotApi } from "polkadot-api/descriptors"

// Connect to Polkadot network
const client = createClient(/* connection config */)
const polkadotApi = getPolkadotApi(client)

export { polkadotApi }
```

## Core Implementation

### 1. Querying Governance State

Learn to retrieve active referenda and their details:

```typescript title="src/monitoring.ts"
// Get active referenda
async function getActiveReferenda() {
  const referendaInfo = await polkadotApi.query.Referenda.ReferendumInfoFor.getEntries()
  
  return referendaInfo
    .filter(([_, info]) => info.type === 'Ongoing')
    .map(([index, info]) => ({
      index: index.args[0],
      info: info.value
    }))
}
```

### 2. Creating Proposals

Submit referendum proposals programmatically:

```typescript title="src/proposals.ts"
// Submit a referendum
async function submitReferendum(signer, proposalCall, track = 0) {
  const submitTx = polkadotApi.tx.Referenda.submit({
    proposal_origin: { system: "Root" },
    proposal: proposalCall,
    enactment_moment: { After: 100 }
  })
  
  return await submitTx.signAndSend(signer)
}
```

### 3. Voting Implementation

Cast votes with different conviction levels:

```typescript title="src/voting.ts"
// Vote on a referendum
async function voteOnReferendum(signer, referendumIndex, vote, conviction, amount) {
  const voteCall = polkadotApi.tx.ConvictionVoting.vote({
    poll_index: referendumIndex,
    vote: {
      Standard: {
        vote: { aye: vote === 'aye', conviction },
        balance: amount
      }
    }
  })
  
  return await voteCall.signAndSend(signer)
}
```

### 4. Delegation

Delegate voting power to trusted accounts:

```typescript title="src/delegation.ts"
// Delegate votes to another account
async function delegateVotes(signer, delegatee, conviction, balance, tracks = []) {
  const delegateCall = polkadotApi.tx.ConvictionVoting.delegate({
    class: tracks[0] || 0,
    to: delegatee,
    conviction,
    balance
  })
  
  return await delegateCall.signAndSend(signer)
}
```

## Testing Your Implementation

Test your governance interactions:

```bash title="terminal"
# Run your governance script
ts-node src/governance-workflow.ts

# Monitor network state
npm run monitor
```

### Testing Checklist

1. **API Connection**: Verify PAPI connection to network
2. **Query Functions**: Test data retrieval from governance pallets
3. **Proposal Submission**: Test referendum creation (on testnet)
4. **Voting**: Test various vote types and convictions
5. **Delegation**: Test delegation and undelegation flows
6. **Error Handling**: Test failure scenarios and recovery

## Best Practices

### Development Guidelines

- **Test on testnets first**: Use Westend/Paseo for development
- **Handle errors gracefully**: Implement proper error handling
- **Validate inputs**: Check referendum indices and amounts
- **Monitor transaction costs**: Account for fees in your logic

### Security Considerations

- **Private key management**: Never hardcode private keys
- **Amount validation**: Prevent accidental large transactions
- **Network verification**: Confirm correct network connection
- **Rate limiting**: Avoid overwhelming RPC nodes

## Where to Go Next

Continue your governance development journey:

- [Treasury proposal automation tutorial]
- [Advanced voting strategies guide]  
- [Multi-chain governance patterns]

## Additional Resources

- [PAPI Documentation](https://papi.how/){target=_blank}
- [Polkadot Governance Overview](https://wiki.polkadot.network/docs/learn-governance){target=_blank}
- [OpenGov Technical Details](https://github.com/paritytech/substrate/tree/master/frame/referenda){target=_blank}
- [Governance Tracks Reference](https://wiki.polkadot.network/docs/learn-opengov-origins){target=_blank}