---
title: Proxy Accounts
description: This page covers proxy types, use cases, and security features like time delays and deposit requirements.
---

# Proxy Accounts

## Introduction

Proxies provide an efficient way to delegate tasks while enhancing security. Instead of relying solely on a single account, smaller accounts with specific roles can perform actions on behalf of the main stash account. 

These proxies can be more active (or "hotter") than the main account, which can be kept in a more secure, less accessible state (or "colder"). 

However, the tokens in the colder account can still support the activities of the hotter accounts, allowing for greater security by reducing the frequency of transactions from the cold account. 

This setup not only protects the stash account but also diverts attention away from it, even though the relationship between the proxy and the main account can still be traced.

From a security perspective, proxies can be imagined as bodyguards for a VIP — loyal and willing to risk their safety to protect the VIP. 

However, proxies also serve valuable purposes in various other contexts, such as efficient account management at the corporate level. 

They provide a seamless way to change signatories within multi-signature accounts and can facilitate both proxy calls and nested proxy calls. 

This page will explore these intriguing use cases of proxies within the Polkadot ecosystem.

## Example

Below is an example of how to utilize different account types effectively: Imagine you have a primary stash account where you hold your tokens but prefer not to access it frequently. 

To earn staking rewards while minimizing direct access, you can designate one of your existing accounts as a staking proxy for your stash account. 

By doing this, you would use your staking proxy to sign all transactions related to staking, thereby enhancing both security and convenience.

![](/images/polkadot-protocol/protocol-components/accounts/stash-vs-stash-and-staking-proxy.webp)

Having a staking proxy creates a layer of isolation for the stash account within the staking context. 

Essentially, the designated staking proxy can manage staking activities on behalf of the stash account. Without a proxy, you would need to directly sign all staking-related transactions with the stash account. 

If the proxy were to be compromised, it would not have access to transfer-related transactions, allowing the stash account to simply assign a new proxy as a replacement. 

Additionally, you can enhance security by implementing a **time delay for proxy actions**, enabling better monitoring and control.

Creating multiple proxy accounts that act for a single account, lets you come up with more granular security practices around how you protect private keys while still being able to actively participate in the network.

## Proxy Types

When a proxy account initiates a transaction, Polkadot verifies that the proxy has the necessary permissions to execute that transaction on behalf of the proxied account. For instance, staking proxies are specifically authorized to perform only staking-related transactions.

When establishing a proxy, it is essential to select a specific type of proxy that defines the relationship with the proxied account:

- **Any**: This type allows any transaction, including balance transfers. However, it is generally advisable to avoid this option, as the proxy account is used more frequently than the cold account, thus presenting a greater security risk.

- **Non-transfer**: This proxy allows any type of transaction except [balance transfers](balance transfers section from the Type of Extrisics page), including [vested](vested transfers section from the Type of Extrisics page) transfers. As a result, it does not have permission to access calls in the Balances and XCM pallets.

- **Governance**: This type permits transactions related to governance activities.

- **Nomination Pool**: This proxy allows transactions pertaining specifically to [Nomination Pools](to be added).

- **Staking**: This type allows all staking-related transactions. The stash account is intended to remain in cold storage, while the staking proxy account handles day-to-day transactions, such as setting session keys or selecting validators to nominate. For more detailed information about staking proxies, visit the [Advanced Staking Concepts](to be added) page.

- **Identity Judgement**: This proxy allows registrars to make judgments about an account's identity. If you're unfamiliar with judgment and identities on-chain, please refer to the relevant [page](judgements from the Account Identity page). This proxy can only access the `provide_judgement` call from the Identity pallet, along with calls from the Utility pallet.

- **Cancel**: This type allows the rejection and removal of any time-delay proxy announcements. It can only access the `reject_announcement` call from the Proxy pallet.

- **Auction**: This proxy allows transactions related to parachain auctions and crowdloans. The Auction proxy account can sign these transactions on behalf of an account in cold storage. If you have already set up a Non-transfer proxy account, it can perform all functions of an Auction proxy. Before participating in a crowdloan using an Auction proxy, it is recommended to consult with the respective parachain team regarding any potential issues related to crowdloan rewards distribution. The Auction proxy can access the Auctions, Crowdloan, Registrar, and Slots pallets.

## Proxy Deposits

Proxies in the Polkadot ecosystem require a deposit in the native currency for their creation. This deposit is necessary because adding a proxy utilizes storage space on-chain, which must be replicated across all peers in the network. 

Given the significant cost associated with this, the addition of proxies could potentially expose the network to Denial-of-Service attacks. 

To mitigate this risk, a deposit is reserved to cover the storage space consumed throughout the proxy's lifetime. Upon the removal of the proxy, the associated storage space is also cleared, and the deposit is returned.

The required deposit amount for `n` proxies is equal to:

`ProxyDepositBase` + `ProxyDepositFactor` * `n`

In the Polkadot ecosystem, the `ProxyDepositBase` represents the minimum amount that must be reserved for an account to maintain a proxy list, which entails creating a new item in storage. 

Additionally, for each proxy associated with the account, an extra amount defined by the `ProxyDepositFactor` is reserved, as each proxy appends 33 bytes to the storage location. 

This structure ensures that accounts can manage proxies efficiently while accounting for the associated storage costs.

## Time-Delayed Proxies

To enhance the security of proxies, we can introduce a delay mechanism, quantified in blocks. 

Given that Polkadot has an approximate block time of 6 seconds, a delay value of 10 would correspond to a delay of roughly one minute, as it accounts for ten blocks. 

This delay provides an additional safeguard by allowing time for any potential issues to be addressed before the proxy's actions take effect.

When a proxy intends to execute an action, it will announce this intention and then wait for a predetermined number of blocks, as specified by the delay time, before carrying out the action. 

During this waiting period, the accounts that control the proxy have the option to cancel the intended action, providing an additional layer of oversight and control.

Announcing `n` calls with a time-delayed proxy also requires a deposit, which is structured as follows:

`announcementDepositBase` + `announcementDepositFactor` * `n`

In this context, the `announcementDepositBase` represents the minimum amount required to be reserved for an account to announce a proxy call. 

Additionally, for each proxy call made by the account, an extra amount, determined by the `announcementDepositFactor`, is also reserved.

