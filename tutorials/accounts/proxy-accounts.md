---
title: Proxy Accounts
description: TODO
---

# Proxy Accounts

Blockchain networks often require users to maintain a delicate balance between security and participation. [Proxy accounts](https://wiki.polkadot.network/docs/learn-proxies){target=\_blank} offer a practical solution to this challenge.

With proxies, users can delegate their account's participation to a separate, "proxy" account. This proxy account can then perform a limited set of actions related to specific substrate pallets on behalf of the user's main account. The key benefit is that the user's primary account can be kept in a more secure state, while the proxy account acts as an interface with the network.
The weight and influence of the tokens held in the user's cold storage account are still leveraged through the proxy, allowing for efficient delegation without exposing the sensitive primary account. This approach helps minimize the number of transactions made by the main account further enhancing its protection.

While the relationship between a proxy and its proxied account may be discoverable, proxies still provide an effective way to drive attention away from the user's main account. 

For more information about using proxies, check the following videos:

- [Proxy Accounts Tutorial](https://www.youtube.com/watch?v=1tcygkq52tU){target=\_blank}
- [Proxy Accounts Advanced Tutorial](https://www.youtube.com/watch?v=Qv_nJVcvQr8&t=4437s){target=\_blank}

For detailed information on the specific capabilities of proxies, including the calls and pallets they can access, consult the runtime source code of the blockchain you're using.

In Polkadot's case, the available proxy types are defined as follows:

```rust
pub enum ProxyType {
	Any = 0,
	NonTransfer = 1,
	Governance = 2,
	Staking = 3,
	// Skip 4 as it is now removed (was SudoBalances)
	// Skip 5 as it was IdentityJudgement
	CancelProxy = 6,
	Auction = 7,
	NominationPools = 8,
}
```

The scope and permissions of each proxy type are defined in the Polkadot runtime source code. For the most current implementation details, you can refer to the [Polkadot runtime repository](https://github.com/polkadot-fellows/runtimes/blob/e220854a081f30183999848ce6c11ca62647bcfa/relay/polkadot/src/lib.rs#L1106){target=\_blank}.

## Create a Proxy

To create a proxy account, you need to call the `proxy.addProxy` extrinsic. For step-by-step instructions on creating a proxy account using Polkadot.js Apps, refer to the "Setting Proxies" section in the [How to Create a Proxy Account](https://support.polkadot.network/support/solutions/articles/65000182179-how-to-create-a-proxy-account#Setting-Proxies){target=\_blank} article.

## Remove a Proxy

To remove a proxy account, you can either remove individual proxy accounts by calling the `proxy.removeProxy` extrinsic or clear all proxies at once by calling `proxy.removeProxies`. For detailed instructions on removing a proxy account using Polkadot.js Apps, refer to the "Removing Proxies" section in the [How to Create a Proxy Account](https://support.polkadot.network/support/solutions/articles/65000182179-how-to-create-a-proxy-account#Removing-Proxies){target=\_blank} article.

## View your Proxies