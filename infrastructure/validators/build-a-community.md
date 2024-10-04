---
title: Build a Community
description: Learn how to build a validator community, attract nominations, and establish trust with nominators through best practices, transparency, and engagement.
---

# Build a Community

## Introduction

Building a solid validator community is crucial for attracting nominations and gaining trust in the Polkadot ecosystem. Validators must go beyond simply running nodes—they should engage with nominators, establish transparency, and build a reputation for reliability and security. This guide offers strategies for setting up an on-chain identity, maintaining transparency, and participating actively in governance and the broader community. By following these steps, validators can gain long-term nominations and build trust.

## Attract Nominations

Setting up a validator is just the beginning. Attracting nominations requires effort and visibility within the community. Nominators need to trust a validator before staking with them, and validators must stand out by providing reliable services and building a recognizable brand.

Successful validators focus on the following:

- **Operational excellence** - running reliable nodes and avoiding slashing incidents
- **Community engagement** - participating in ecosystem discussions, governance, and validator forums
- **Reputation** - creating a clear, trusted presence through transparency and consistent communication

Both nominators and validators are at risk if slashing occurs, so building trust and showing commitment is vital. Validators should consistently communicate their reliability and transparency to ensure nominators feel secure when staking.

### Gain Visibility

Validators must be easily recognizable to attract nominations. Validators with clear, visible identities are more likely to gain trust from nominators than those with anonymous addresses.

Steps to increase visibility:

- **Set an On-Chain Identity** - ensure your validator has an on-chain identity that nominator dashboards can display. Validators with visible identities are easier for nominators to trust
- **Be Active in the Community** - engage across channels like Polkadot forums, governance discussions, and social media to build relationships and trust

### Set Your On-Chain Identity

Every validator should set an on-chain identity, including essential information like a website or contact details. This allows nominators to verify validator actions across the network, and a verified identity shows that your validator is trustworthy.

If running multiple nodes, use sub-identities linked to a primary verified identity. Providing as much information as possible about your validator, such as staking setup or tools, helps potential nominators feel confident.

### Build a Website

A website dedicated to your validator is a great way to provide essential information, such as validated networks, addresses, and commission rates. Include everything covered in this guide to give nominators a complete picture of your operations. Be sure to link the site to your on-chain identity for easy access.

## Build Trust with Nominators

Establishing trust is one of the most important aspects of running a successful validator. Validators should clearly communicate their operations and how they manage their stake.

### Self-Stake Commitment

Validators should commit a personal, self-bonded stake to demonstrate confidence in their operations. A high self-stake signals to nominators that the validator is invested in the network's success and is accountable for any poor performance. Validators with a low self-stake may seem less committed, which can discourage nominators.

### Commission Structure

Be transparent about your commission rates. Validators often initially charge low rates to attract nominations, but providing a long-term plan is helpful. Explain why your commission is set where it is, and outline any future adjustments so nominators can understand your business model. Nominators appreciate validators with consistent commission rates.

### Claiming Rewards

Ensure nominators know how your validator manages rewards. Rewards claims do not automatically happen, so validators should communicate how and when they plan to claim rewards. Many nominators prefer validators who claim rewards regularly. Consider automating reward claims using tools like [`staking-payouts`](https://github.com/canontech/staking-payouts){target=\_blank} or [`substrate-payctl`](https://github.com/stakelink/substrate-payctl){target=\_blank}.

## Share Infrastructure Details

Being open about your infrastructure can help build trust. Nominators will feel more confident if they know how your validator operates and what steps you take to ensure reliability and security.

### Servers

Outline your server infrastructure. Whether you use cloud providers, dedicated machines, or a combination, explain how your setup ensures decentralization and reduces risks like outages. Sharing details about your operating system, security practices, and server diversification will give nominators more confidence in your operations.

### Hardware Specifications

Make sure your hardware meets or exceeds the recommended specifications for validators. Validators running on underpowered machines may produce fewer blocks and earn fewer rewards. Nominators appreciate knowing that your hardware can handle the network's.

### Automation and Orchestration

Explain any automation tools you use (e.g., Terraform, Ansible) for provisioning and maintaining nodes. Automation can reduce human error and ensure your operations run smoothly. Validators who automate processes are seen as more robust and reliable.

### Network Topology and Security

Highlight your network topology and any security measures in place, such as firewalls or protection against denial-of-service (DoS) attacks. A well-protected network signals to nominators that your validator is resilient against attacks.

### Software and Upgrade Process

Validators are expected to upgrade promptly with new releases. Ensure nominators know how you handle software updates and where you get your binaries. Validators who proactively upgrade nodes show dedication to maintaining a reliable network presence.

## Stay Transparent with Monitoring and Metrics

Effective monitoring ensures smooth operations. Share how you track the performance of your validator and how you address any issues.

### Health Checks and Alerts

Explain the health checks and alerting systems you have in place. Being transparent about how you monitor node performance and how quickly you can respond to issues builds confidence with nominators

### Scenario Runbooks

Provide runbooks for common scenarios like upgrades, backup restorations, or node migrations. A well-made runbook demonstrates preparedness and reduces the risk of downtime during critical operations.

### Node Locations and Decentralization

List the geographic regions where your nodes operate. Nominators may prefer validators that contribute to decentralization by spreading nodes across diverse areas.

### Key Handling Policies

Outline your procedures for securing session and staking keys. Nominators want to feel confident that a validator handles keys carefully, as compromised keys could lead to slashing.

## Engage with the Community

Building direct relationships with nominators strengthens trust. Open communication channels like Telegram, Discord, or regular community calls help foster trust and loyalty.

### Contribute to the Ecosystem

Actively participating in the broader community enhances your validator's reputation. Whether it's contributing to discussions, voting on governance proposals, or providing educational content, validators who engage are seen as committed to the network's success.

### Participate in Governance

Active involvement in governance shows commitment to the network's long-term success. Validators can engage by voting on-chain, contributing to off-chain discussions, or proposing new initiatives. This involvement signals dedication to the health and direction of the ecosystem. Validators can participate in various governance processes, including treasury proposals, referenda, and delegating voting power. For more information on how to get involved, visit [Polkadot OpenGov](https://polkadot.com/opengov){target=\_blank}.

### Produce Educational Content

Validators who create educational resources (e.g., blog posts, tutorials, guides) add value to the ecosystem. Sharing knowledge demonstrates expertise and strengthens your reputation as a leader in the community.

### Build Tools for the Ecosystem

Developing public tools (like block explorers or monitoring dashboards) provides tangible value to the network. Validators who build tools are often seen as more committed and may attract additional nominations. Additionally, these contributions may also be eligible for funding via a [Web3 Foundation Grant](https://grants.web3.foundation){target=\_blank}.