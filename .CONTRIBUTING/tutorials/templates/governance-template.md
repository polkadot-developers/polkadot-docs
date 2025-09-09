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
npm install polkadot-api@VERSION @polkadot-api/descriptors@VERSION @polkadot-api/substrate-client@VERSION
npm install --save-dev @types/node@VERSION typescript@VERSION ts-node@VERSION
```

### Project Structure

```
polkadot-governance-tutorial/
├── src/
│   ├── governance.ts
│   ├── voting.ts
│   ├── delegation.ts
│   └── monitoring.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Setting Up PAPI Connection

Create the foundation for governance interactions:

```typescript title="src/governance.ts"
import { createClient } from "@polkadot-api/substrate-client"
import { getPolkadotApi } from "polkadot-api/descriptors"
import { createClient as createPolkadotClient } from "polkadot-api"

// Connect to Polkadot network
const client = createClient(
  createPolkadotClient(
    process.env.POLKADOT_RPC_URL || "wss://rpc.polkadot.io"
  )
)

const polkadotApi = getPolkadotApi(client)

export { polkadotApi }
```

## Understanding OpenGov Programmatically

### Querying Governance State

```typescript title="src/monitoring.ts"
import { polkadotApi } from './governance'

// Get active referenda
async function getActiveReferenda() {
  const referendaInfo = await polkadotApi.query.Referenda.ReferendumInfoFor.getEntries()
  
  const activeReferenda = referendaInfo
    .filter(([_, info]) => info.type === 'Ongoing')
    .map(([index, info]) => ({
      index: index.args[0],
      info: info.value
    }))
  
  return activeReferenda
}

// Get referendum details
async function getReferendumDetails(index: number) {
  const info = await polkadotApi.query.Referenda.ReferendumInfoFor(index)
  if (!info || info.type !== 'Ongoing') return null
  
  return {
    index,
    track: info.value.track,
    origin: info.value.origin,
    proposal: info.value.proposal,
    enactment: info.value.enactment,
    submitted: info.value.submitted,
    decisionDeposit: info.value.decisionDeposit,
    deciding: info.value.deciding,
    tally: info.value.tally
  }
}

export { getActiveReferenda, getReferendumDetails }
```

## Creating Proposals Programmatically

### Submit a Referendum

```typescript title="src/proposals.ts"
import { polkadotApi } from './governance'

// Create a simple remark proposal
async function createRemarkProposal(
  signer: any,
  remark: string,
  track: number = 0 // Root track
) {
  // Create the proposal call
  const proposalCall = polkadotApi.tx.System.remark_with_event({
    remark: remark
  })
  
  // Submit referendum
  const submitTx = polkadotApi.tx.Referenda.submit({
    proposal_origin: { system: "Root" },
    proposal: proposalCall,
    enactment_moment: { After: 100 } // 100 blocks delay
  })
  
  // Sign and send transaction
  const result = await submitTx.signAndSend(signer)
  console.log(`Referendum submitted: ${result}`)
  
  return result
}

// Submit treasury proposal
async function createTreasuryProposal(
  signer: any,
  beneficiary: string,
  value: bigint
) {
  const proposalCall = polkadotApi.tx.Treasury.spend({
    amount: value,
    beneficiary: beneficiary
  })
  
  const submitTx = polkadotApi.tx.Referenda.submit({
    proposal_origin: { system: "Root" },
    proposal: proposalCall,
    enactment_moment: { After: 200 }
  })
  
  const result = await submitTx.signAndSend(signer)
  return result
}

export { createRemarkProposal, createTreasuryProposal }
```

## Voting Programmatically

### Standard Voting

```typescript title="src/voting.ts"
import { polkadotApi } from './governance'

// Vote on a referendum
async function voteOnReferendum(
  signer: any,
  referendumIndex: number,
  vote: 'aye' | 'nay',
  conviction: string = 'None',
  amount: bigint
) {
  const voteCall = polkadotApi.tx.ConvictionVoting.vote({
    poll_index: referendumIndex,
    vote: {
      Standard: {
        vote: {
          aye: vote === 'aye',
          conviction: conviction
        },
        balance: amount
      }
    }
  })
  
  const result = await voteCall.signAndSend(signer)
  console.log(`Vote cast: ${vote} with conviction ${conviction}`)
  
  return result
}

// Remove vote from referendum
async function removeVote(signer: any, referendumIndex: number, track: number) {
  const removeVoteCall = polkadotApi.tx.ConvictionVoting.remove_vote({
    class: track,
    index: referendumIndex
  })
  
  return await removeVoteCall.signAndSend(signer)
}

export { voteOnReferendum, removeVote }
```

### Conviction Voting

```typescript title="src/conviction-voting.ts"
import { polkadotApi } from './governance'

// Available conviction levels
const CONVICTIONS = {
  'None': 'None',      // 0.1x voting power, no lock
  'Locked1x': 'Locked1x', // 1x power, 1 day lock
  'Locked2x': 'Locked2x', // 2x power, 2 day lock  
  'Locked3x': 'Locked3x', // 3x power, 4 day lock
  'Locked4x': 'Locked4x', // 4x power, 8 day lock
  'Locked5x': 'Locked5x', // 5x power, 16 day lock
  'Locked6x': 'Locked6x'  // 6x power, 32 day lock
} as const

// Vote with specific conviction
async function voteWithConviction(
  signer: any,
  referendumIndex: number,
  vote: 'aye' | 'nay',
  conviction: keyof typeof CONVICTIONS,
  balance: bigint
) {
  const voteCall = polkadotApi.tx.ConvictionVoting.vote({
    poll_index: referendumIndex,
    vote: {
      Standard: {
        vote: {
          aye: vote === 'aye',
          conviction: CONVICTIONS[conviction]
        },
        balance
      }
    }
  })
  
  return await voteCall.signAndSend(signer)
}

export { voteWithConviction, CONVICTIONS }
```

## Delegation

### Delegate Voting Power

```typescript title="src/delegation.ts"
import { polkadotApi } from './governance'

// Delegate voting power to another account
async function delegateVotes(
  signer: any,
  delegateeAccount: string,
  conviction: string,
  balance: bigint,
  tracks: number[] = [] // Empty array = all tracks
) {
  const delegateCalls = tracks.length > 0 
    ? tracks.map(track => 
        polkadotApi.tx.ConvictionVoting.delegate({
          class: track,
          to: delegateeAccount,
          conviction,
          balance
        })
      )
    : [polkadotApi.tx.ConvictionVoting.delegate({
        class: 0, // All classes if not specified
        to: delegateeAccount,
        conviction,
        balance
      })]
  
  // Execute delegation(s)
  if (delegateCalls.length === 1) {
    return await delegateCalls[0].signAndSend(signer)
  } else {
    // Batch multiple delegations
    const batchCall = polkadotApi.tx.Utility.batch({ calls: delegateCalls })
    return await batchCall.signAndSend(signer)
  }
}

// Remove delegation
async function undelegateVotes(signer: any, track: number) {
  const undelegateCall = polkadotApi.tx.ConvictionVoting.undelegate({
    class: track
  })
  
  return await undelegateCall.signAndSend(signer)
}

// Get current delegation status
async function getDelegationStatus(account: string, track: number) {
  const voting = await polkadotApi.query.ConvictionVoting.VotingFor(account, track)
  
  if (voting.type === 'Delegating') {
    return {
      isDelegating: true,
      target: voting.value.target,
      conviction: voting.value.conviction,
      balance: voting.value.balance,
      prior: voting.value.prior
    }
  }
  
  return { isDelegating: false }
}

export { delegateVotes, undelegateVotes, getDelegationStatus }
```

## Monitoring and Analytics

### Track Referendum Progress

```typescript title="src/analytics.ts"
import { polkadotApi } from './governance'

// Monitor referendum progress
async function monitorReferendum(referendumIndex: number) {
  const details = await getReferendumDetails(referendumIndex)
  if (!details) return null
  
  const { tally, deciding } = details
  
  return {
    index: referendumIndex,
    status: deciding ? 'Deciding' : 'Preparing',
    approvalVotes: tally.ayes,
    rejectionVotes: tally.nays,
    supportVotes: tally.support,
    decisionDeadline: deciding?.since,
    track: details.track
  }
}

// Get governance statistics
async function getGovernanceStats() {
  const referenda = await getActiveReferenda()
  
  const stats = {
    totalActive: referenda.length,
    byTrack: {} as Record<string, number>,
    totalVotes: 0n,
    totalSupport: 0n
  }
  
  for (const ref of referenda) {
    const trackName = `track_${ref.info.track}`
    stats.byTrack[trackName] = (stats.byTrack[trackName] || 0) + 1
    
    if (ref.info.tally) {
      stats.totalVotes += ref.info.tally.ayes + ref.info.tally.nays
      stats.totalSupport += ref.info.tally.support
    }
  }
  
  return stats
}

export { monitorReferendum, getGovernanceStats }
```

## Example: Complete Governance Workflow

### Full Implementation Example

```typescript title="src/example-workflow.ts"
import { polkadotApi } from './governance'
import { createRemarkProposal } from './proposals'
import { voteOnReferendum } from './voting'
import { monitorReferendum } from './analytics'

async function completeGovernanceWorkflow(signer: any) {
  try {
    // 1. Create a proposal
    console.log('Creating proposal...')
    const proposalResult = await createRemarkProposal(
      signer,
      "This is a test governance proposal",
      0 // Root track
    )
    
    // 2. Monitor for referendum creation
    console.log('Waiting for referendum to appear...')
    await new Promise(resolve => setTimeout(resolve, 12000)) // Wait 2 blocks
    
    const activeReferenda = await getActiveReferenda()
    const newReferendum = activeReferenda[activeReferenda.length - 1]
    
    if (newReferendum) {
      console.log(`New referendum created: #${newReferendum.index}`)
      
      // 3. Vote on the referendum
      console.log('Casting vote...')
      await voteOnReferendum(
        signer,
        newReferendum.index,
        'aye',
        'Locked1x',
        BigInt('1000000000000') // 1 DOT
      )
      
      // 4. Monitor progress
      console.log('Monitoring referendum progress...')
      const progress = await monitorReferendum(newReferendum.index)
      console.log('Referendum status:', progress)
    }
    
  } catch (error) {
    console.error('Governance workflow failed:', error)
  }
}

export { completeGovernanceWorkflow }
```

## Testing Your Implementation

Test your governance interactions:

```bash title="terminal"
# Run your governance script
ts-node src/example-workflow.ts

# Monitor network state
ts-node -e "
import { getGovernanceStats } from './src/analytics';
getGovernanceStats().then(console.log);
"
```

### Testing Checklist

1. **API Connection**: Verify PAPI connection to network
2. **Proposal Creation**: Test referendum submission
3. **Voting Functions**: Test various vote types and convictions
4. **Delegation**: Test delegation and undelegation
5. **Monitoring**: Verify data retrieval and analysis
6. **Error Handling**: Test failure scenarios and recovery

![Governance monitoring dashboard](/images/tutorials/governance/[category]/[tutorial-name]/monitoring-dashboard.webp)

!!!tip "Development Testing"
    Use test networks (Westend, Paseo) for development to avoid spending mainnet tokens.

## Advanced Implementation Patterns

### Automated Governance Bot

```typescript title="src/governance-bot.ts"
import { polkadotApi } from './governance'

class GovernanceBot {
  private signer: any
  private votingStrategy: 'always_aye' | 'always_nay' | 'custom'
  
  constructor(signer: any, strategy: 'always_aye' | 'always_nay' | 'custom') {
    this.signer = signer
    this.votingStrategy = strategy
  }
  
  async autoVoteOnNewReferenda() {
    const referenda = await getActiveReferenda()
    
    for (const referendum of referenda) {
      const hasVoted = await this.checkIfAlreadyVoted(referendum.index)
      
      if (!hasVoted && this.shouldVote(referendum)) {
        await this.castAutomaticVote(referendum.index)
      }
    }
  }
  
  private async checkIfAlreadyVoted(index: number): Promise<boolean> {
    // Implementation to check voting status
    return false
  }
  
  private shouldVote(referendum: any): boolean {
    // Custom logic to determine if bot should vote
    return true
  }
  
  private async castAutomaticVote(index: number) {
    const vote = this.votingStrategy === 'always_aye' ? 'aye' : 'nay'
    await voteOnReferendum(this.signer, index, vote, 'None', BigInt('100000000000'))
  }
}

export { GovernanceBot }
```

## Best Practices

### Development Guidelines

- **Test on testnets first**: Always test governance code on Westend or Paseo
- **Handle errors gracefully**: Implement proper error handling for all API calls  
- **Monitor gas fees**: Account for transaction costs in your logic
- **Validate inputs**: Always validate referendum indices and vote amounts
- **Use appropriate convictions**: Understand lock periods before setting conviction levels

### Security Considerations

- **Private key management**: Never hardcode private keys in source code
- **Amount validation**: Validate vote amounts to prevent accidental large votes
- **Network verification**: Ensure you're connected to the intended network
- **Rate limiting**: Implement delays between API calls to avoid overwhelming nodes

## Where to Go Next

Continue your governance development journey:
- [Advanced treasury proposal automation tutorial]
- [Multi-signature governance coordination guide]
- [Cross-chain governance implementation patterns]

## Additional Resources

- [PAPI Documentation](https://papi.how/){target=_blank}
- [Polkadot Governance Documentation](https://wiki.polkadot.network/docs/learn-governance){target=_blank}
- [OpenGov Technical Specification](https://github.com/paritytech/substrate/tree/master/frame/referenda){target=_blank}
- [Governance Tracks Reference](https://wiki.polkadot.network/docs/learn-opengov-origins){target=_blank}