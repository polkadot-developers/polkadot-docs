---
title: [Your Governance Tutorial Title - Max 45 chars]
description: [Description of governance operation - 120-160 chars]
tutorial_badge: Beginner | Intermediate | Advanced
categories: Governance, OpenGov, Proposals, Voting
---

# [Your Governance Tutorial Title]

## Introduction

[2-3 paragraphs explaining:]
- What governance operation users will perform
- Why this governance action is important for the network
- What roles and responsibilities are involved

## Prerequisites

Before starting, ensure you have:

- Polkadot.js extension installed and configured
- [Minimum token amount] DOT/KSM for participation
- Basic understanding of Polkadot governance concepts
- Access to Polkadot.js Apps or governance interface
- [Specific requirements based on tutorial type]

## Understanding the Governance System

[Explain the specific governance mechanism being used]

### OpenGov Overview
- **Origins**: Different tracks for different types of proposals
- **Decision Periods**: Timeline for proposal lifecycle  
- **Conviction Voting**: How voting power is calculated
- **Delegation**: How to delegate voting power

### Relevant Governance Tracks
For this tutorial, we'll focus on:
- **[Track Name]**: [Track description and purpose]
- **Decision Period**: [Timeline information]
- **Required Approval**: [Approval/support thresholds]

## [Specific Governance Action Setup]

### For Creating Proposals:
[Steps to create and submit a proposal]

1. **Navigate to Governance** section in Polkadot.js Apps
2. **Select appropriate track** for your proposal
3. **Prepare proposal details**:
   - Clear description of proposed changes
   - Rationale and expected impact
   - Technical specifications (if applicable)

### For Voting on Proposals:
[Steps to participate in voting]

1. **Review active proposals** in the governance interface
2. **Analyze proposal details** and potential impact
3. **Determine voting strategy** (conviction, delegation, etc.)

### For Delegation:
[Steps to delegate voting power]

1. **Choose delegate** based on expertise and alignment
2. **Set delegation parameters** (tracks, conviction)
3. **Monitor delegate activity** and decisions

## Step 3: Executing the Governance Action

[Detailed step-by-step instructions for the specific action]

### Creating a Proposal Example:
```javascript
// Example proposal creation (adjust based on proposal type)
const proposal = api.tx.system.remark('Proposal content hash');
const proposalCall = api.tx.referenda.submit(
  { system: 'Root' }, // Origin
  { 'Lookup': { 'hash': proposalHash, 'len': proposalLength } }, // Proposal
  { 'After': 100 } // Enactment delay
);
```

### Voting Example:
```javascript
// Standard voting
const vote = api.tx.convictionVoting.vote(
  referendumIndex,
  {
    'Standard': {
      'vote': { 'aye': true, 'conviction': 'Locked1x' },
      'balance': voteAmount
    }
  }
);
```

### Delegation Example:
```javascript
// Delegate voting power
const delegate = api.tx.convictionVoting.delegate(
  classIndex,
  delegateAccount,
  conviction,
  balance
);
```

![Governance interface screenshot](/images/tutorials/onchain-governance/[category]/[tutorial-name]/governance-interface.webp)

!!!tip "Screenshot Guidelines"
    Use 1512px width for desktop screenshots. Crop to show only relevant interface elements.

## Monitoring and Participation

Track the progress of governance actions:

### Proposal Lifecycle Monitoring
1. **Submission Phase**: Verify proposal is submitted correctly
2. **Preparation Period**: Monitor community discussion
3. **Decision Period**: Track voting progress and outcomes
4. **Confirmation Period**: Verify final approval/rejection
5. **Enactment**: Monitor implementation (if approved)

### Key Metrics to Watch
- **Approval**: Percentage of approval votes
- **Support**: Overall participation rate
- **Turnout**: Total voting power participating
- **Time Remaining**: Decision period countdown

## Understanding Results and Next Steps

Analyze the outcome of your governance participation:

### For Approved Proposals
- **Implementation Timeline**: When changes take effect
- **Impact Assessment**: How the network is affected
- **Follow-up Actions**: Any required subsequent proposals

### For Rejected Proposals
- **Analysis**: Why the proposal was rejected
- **Revision Opportunities**: How to improve and resubmit
- **Alternative Approaches**: Other ways to achieve similar goals

## Advanced Governance Features [For Advanced Tutorials]

### Multisig Governance
- Creating and managing multisig accounts for proposals
- Coordinating signatures from multiple parties

### Proxy Governance
- Setting up governance proxies
- Managing permissions and delegations

### Treasury Proposals
- Submitting treasury funding requests
- Managing treasury proposal lifecycle

## Best Practices

### For Proposal Creation
- Research existing proposals and precedents
- Engage with community before formal submission
- Provide clear implementation details
- Consider economic and social impacts

### For Voting
- Research proposals thoroughly before voting
- Consider long-term network implications
- Use appropriate conviction levels
- Monitor voting deadlines

### For Delegation
- Choose delegates with relevant expertise
- Regularly review delegate performance
- Maintain some direct voting for important issues

## Where to Go Next

Continue your governance journey:
- [Advanced proposal drafting tutorial]
- [Treasury proposal submission guide]
- [Community engagement and consensus building]

## Additional Resources

- [Polkadot Governance Wiki](https://wiki.polkadot.network/docs/learn-governance){target=\_blank}
- [OpenGov Documentation](https://wiki.polkadot.network/docs/learn-opengov){target=\_blank}
- [Polkassembly](https://polkadot.polkassembly.io/){target=\_blank} - Governance discussion platform
- [Subsquare](https://www.subsquare.io/){target=\_blank} - Alternative governance interface