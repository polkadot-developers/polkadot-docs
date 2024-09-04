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

There are two ways to check your existing proxy accounts:

###  Account Manager

1. In Polkadot.js Apps, navigate to the **Accounts** dropdown and select the **Accounts** option
    ![](/images/tutorials/accounts/proxy-accounts/proxy-accounts-1.webp)

2. Hover over the blue icon next to the account you have proxied, then click **Managed proxies**
    ![](/images/tutorials/accounts/proxy-accounts/proxy-accounts-2.webp)

3. This will open a modal where you can view all the proxies associated with that account and manage them
    ![](/images/tutorials/accounts/proxy-accounts/proxy-accounts-3.webp)

### Chain State Query

1. In Polkadot.js Apps, navigate to the **Developer** dropdown and select the **Chain state** option.
    ![](/images/tutorials/accounts/proxy-accounts/proxy-accounts-4.webp)

2. Query proxy accounts
   
    1. Select the **proxy** pallet
    2. Choose the **proxies** call
    3. Select the account you want to check
    4. Click the **+** button to execute the query
    5. The results will show the proxies associated with the selected account
    ![](/images/tutorials/accounts/proxy-accounts/proxy-accounts-5.webp)

## Set-up and Use of Time-delayed Proxies

Proxies can be enhanced with an additional layer of security through the use of a time delay. This delay, measured in blocks, provides a window of time during which any malicious actions can be detected and reverted.

The process works as follows:

1. The proxy account uses the `proxy.announce` extrinsic to announce the intended action, including the hash of the function call
2. The announced action is then delayed for a specified number of blocks
3. During this time delay window, the announced action can be canceled by either the proxy account itself using `proxy.removeAnnouncement`, or by the proxied account using `proxy.rejectAnnouncement`
4. After the time delay has elapsed, the proxy can then execute the announced call using the `proxy.proxyAnnounced` extrinsic
   
It's important to note that regular `proxy.proxy` calls do not work with time-delayed proxies. You must use the announce-and-execute process described above.

For a detailed walkthrough on setting up and using time-delayed proxies, refer to the video tutorial linked below:

- [Learn about Time-delayed Proxies on Polkadot](https://www.youtube.com/watch?v=3L7Vu2SX0PE){target=\_blank}

## Proxy Calls

Proxy calls are the mechanism used by proxy accounts to invoke actions on behalf of the accounts they represent. These proxy calls are essential, especially for "pure" proxies.

In the case of pure proxies, any attempt to directly sign transactions with the proxy account will fail. Instead, the proxy must use the appropriate proxy call extrinsics to interact with the network on behalf of the proxied account.

For more details on pure proxy accounts, see the dedicated [Pure Proxy Accounts](/polkadot-docs/tutorials/accounts/pure-proxy-accounts.md) section.
