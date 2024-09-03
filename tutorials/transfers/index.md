---
title: Polkadot.Js Guides about Transfers
description: Tutorials on how to transfer and manage funds on the Polkadot network, covering metadata updates, sending funds, teleporting tokens, calculating fees, and more.
---

# Polkadot.Js Guides about Transfers

## Metadata Updates

Before you start using the [Polkadot.Js Browser Extension](https://polkadot.js.org/extension/){target=\_blank} to interact with the Polkadot network, it is crucial to ensure that the metadata is updated. The user interface may not function properly if the metadata is not up-to-date.

To update the metadata of the Polkadot.Js Browser Extension, follow these steps:

1. Access the Polkadot.Js App interface and click on the **Settings** tab:

    ![Settings Tab](/images/tutorials/transfers/metadata-update/metadata-update-1.webp)

2. Click on the **Metadata** tab:

    ![Metadata Tab](/images/tutorials/transfers/metadata-update/metadata-update-2.webp)

3. If there are any updates available, click on the **Update metadata** button:

    ![Update Metadata Button](/images/tutorials/transfers/metadata-update/metadata-update-3.webp)

4. A pop-up window will appear to confirm the update. Click on the **Yes, I do this metadata update** button to allow the extension to update the metadata:

    ![Update Metadata Confirmation](/images/tutorials/transfers/metadata-update/metadata-update-4.webp)

Now that the metadata is updated, you can proceed with transferring and managing funds on the Polkadot network.

!!! note
    Note that this process is necessary not only for the Polkadot.Js Browser Extension but also for any other wallet or interface that you use to interact with the Polkadot network. Ensure the metadata is updated to avoid issues when sending transactions or interacting with the network.

## Transfers

### Sending Funds

Whether your account is in the Polkadot Browser Extension or created/added directly on the Polkadot.Js UI, you can use the Polkadot.Js UI interface to send funds or issue any extrinsic. The Polkadot extension is an account manager, not a wallet, requiring a UI to interact with.

To send funds using the Polkadot.Js Browser Extension, follow these steps:

1. Using the Polkadot.Js App interface, click on the **Accounts** tab and select **Transfer** from the dropdown menu:

    ![Accounts Tab](/images/tutorials/transfers/sending-funds/sending-funds-1.webp)

2. Fill in the required fields:
      1. **send from account** - select the account from which you want to send funds
      2. **send to address** - enter the recipient's address
      3. **amount** - enter the amount of funds you want to send
      4. **transfer with account keep-alive checks** - enable this option if you want to keep the account alive. For more information on keep-alive checks, refer to the [Keep Alive Checks](#keep-alive-checks) section
      5. Click on the button **Make Transfer** to proceed:

    ![Transfer Form](/images/tutorials/transfers/sending-funds/sending-funds-2.webp)

    !!!warning
        The transaction fees will be deducted from the leftover funds in your account. If you don't leave enough funds in your account for the fees, your transaction will fail due to "insufficient balance". Ensure to leave enough funds in your account to cover the transaction fees. If you want to send all the funds in your account, please refer to the [How to Send All of Your Funds Out of Your Account](https://support.polkadot.network/support/solutions/articles/65000170293){target=\_blank} guide.

3. A pop-up window will appear to confirm the transfer. Click on the **Sign and Submit** button to authorize the transaction:

    ![Transfer Confirmation](/images/tutorials/transfers/sending-funds/sending-funds-3.webp)

4. To confirm that the transaction was successful, you can check the **Explorer** tab and search that the event **Transfer** has been emitted:

    ![Explorer Tab](/images/tutorials/transfers/sending-funds/sending-funds-4.webp)

!!! note
    Sending funds can be done in many ways, such as using the Polkadot.Js UI, the Polkadot.Js API, or even the built-in features of different wallets. The Polkadot.Js UI is one of the many ways to send funds to the Polkadot network.

### Extrinsics Verification

The Polkadot Browser Extension is the entry point to the Web 3.0 Polkadot ecosystem, allowing you to connect with various compatible apps and websites. Therefore, verifying your extrinsic before signing them is crucial, especially when engaging with a new site or app.

For further information on how to verify extrinsics, please refer to the [How Can I Verify What Extrinsic I'm Signing?](https://support.polkadot.network/support/solutions/articles/65000179161-how-can-i-verify-what-extrinsic-i-m-signing-){target=\_blank} guide.

### Keep Alive Checks

In Polkadot, there are two main ways to transfer funds from one account to another:

- Transfer `keep-alive` - (the default option) will not allow you to send an amount that would allow the sending account to be removed because it falls below the existential deposit
- Transfer `allow-death` - will allow you to send tokens regardless of the consequences. If the balance drops below the existential deposit, your account will be reaped. You may not want to keep the account alive, for example, if you are moving all of your funds to a different address. To turn off the keep-alive check, please visit the [Error: 'balances.KeepAlive'](https://support.polkadot.network/support/solutions/articles/65000169248){target=\_blank} guide

### Vested Transfers

Vested transfers can be released on a linear schedule (linear vesting) or after a specific time period (cliff vesting). 

To perform a vested transfer, you need to follow these steps:

1.  Navigate to the Extrinsics section of the Polkadot.Js App interface:
       1. Click on the **Developer** tab
       2. Select **Extrinsics** from the dropdown menu

    ![Developer Tab](/images/tutorials/transfers/vested-transfers/vested-transfers-1.webp)

2. Access the **vesting** pallet and select the **vestedTransfer** function:
      1. Select the **account** from which you want to send the vested transfer
      2. Choose the **vesting** pallet from the list of pallets 
      3. Select the **vestedTransfer** extrinsic from the list of available extrinsics
   
    ![Vested Transfer Function](/images/tutorials/transfers/vested-transfers/vested-transfers-2.webp)

3. Fill in the required fields:
      1. **target** - the receiver's address
      2. **schedule** - the vesting schedule. The schedule can be `linear` or `cliff`. The `linear` schedule will release the funds linearly over a period of time, while the `cliff` schedule will release the funds after a specific time period. 
        - **locked** - the amount of funds that will be locked. It should be defined in [planks units](https://support.polkadot.network/support/solutions/articles/65000168663-how-many-planck-are-in-a-dot-){target=\_blank}
         - **perBlock** - the amount of funds that will be released per block. In `cliff vesting`, the funds will be released all at once after the specified time period, so this value should be equal to the locked amount. In `linear vesting`, the funds will be released linearly over the specified time period, so this value should be calculated based on the total amount of funds and the duration of the vesting period.
         - **startingBlock** - the block number when the funds will be released  
       3. Click on the **Submit Transaction** button to proceed 

    ![Vested Transfer Form](/images/tutorials/transfers/vested-transfers/vested-transfers-3.webp)

    !!! note
        The above image shows how to perform a cliff vesting transfer, since **locked** and **perBlock** are the same. If you want to perform a linear vesting transfer, you should calculate the **perBlock** value based on the total amount of funds and the duration of the vesting period. For example, if you want to release 100 DOT over a period of 10 blocks, the **perBlock** value should be 10 DOT.

4. After submitting the transaction, a pop-up window will appear to confirm the transfer. Click on the **Sign and Submit** button to authorize the transaction:

    ![Vested Transfer Confirmation](/images/tutorials/transfers/vested-transfers/vested-transfers-4.webp)

5. To confirm that the transaction was successful, navigate to the **Accounts** tab and check the receiver's account. Look for **locked** balances if the starting block hasn't been reached yet or **vested** balances if it has.

    ![Accounts Tab - Locked Balances](/images/tutorials/transfers/vested-transfers/vested-transfers-5.webp)

#### Lazy Vesting

Vesting is lazy, meaning that someone must explicitly call an extrinsic to update the lock placed on an account.

- The `vest` extrinsic will update the lock that is placed on the caller
- The `vest_other` will update the lock on another "target" account's funds

These extrinsics are exposed from the `vesting` pallet.

If you are using the Polkadot.Js UI, when there are DOT available to vest for an account, then you will have the ability to unlock DOT that has already vested from the Accounts page.

#### Calculating When Vesting Tokens Will Be Available

You can check the status of your DOT vesting by reviewing your accounts, which will show when the vesting period ends. However, some DOT vesting involves "cliffs", where all the tokens are released simultaneously in a single block rather than gradually over time. In these cases, you'll need to directly query the chain state to determine when your tokens will be available, as the vesting period hasn’t technically begun yet—it will occur entirely in one future block.

1. Navigate to the Chain State page on Polkadot.Js  
   ![Chain State Page](/images/tutorials/transfers/vested-transfers/vested-transfers-6.webp)
2. Query chain state:
      1. Select the `vesting` query state
      2. Select `vesting` from the list of modules
      3. Select the address you want to query
      4. Click on the **+** button to execute the query
    
    ![Query Chain State](/images/tutorials/transfers/vested-transfers/vested-transfers-7.webp)
    
3. Note that **startingBlock** indicates where the unlock starts and how much DOT is unlocked per block (**perBlock**)

    ![Query Chain State Result](/images/tutorials/transfers/vested-transfers/vested-transfers-8.webp)
 
4. To calculate when the vesting will be available in “human time", remember that there are approximately 14,400 blocks per day, and you can see the latest block on the Explorer page:

    For instance, this example shows that the vesting will start at block 22,400,500, and the current block is 22,359,749 (as shown on the Explorer page). The difference between these two blocks is 40,751 blocks. If you divide this number by 14,400, you will get the number of days until the vesting starts, which in this case is 2.83 days.

### Batch Transfers

Batch transfers are balance transfers to multiple accounts executed by one account. To construct a batch transfer, you need to:

1. Navigate to the Extrinsics section of the Polkadot.Js App interface:
       1. Click on the **Developer** tab
       2. Select **Extrinsics** from the dropdown menu:

    ![Developer Tab](/images/tutorials/transfers/batch-transfers/batch-transfers-1.webp)

2. Access the **utility* pallet and select the *batch* function:
      1. Choose the **utility** pallet from the list of pallets 
      2. Select the **batch** function from the list of extrinsics
   
    ![Batch Transfer Function](/images/tutorials/transfers/batch-transfers/batch-transfers-2.webp)

3. Create the batch transfer call by adding the following fields:
      1. **calls** - an array of calls to be executed in the batch. Each call should be an array with the following fields:
        - **call** - the call to be executed. In this case, it should be the **balances.transferKeepAlive** call
        - **dest** - the destination account of the transfer
        - **value** - the amount of funds to be transferred
      2. Click on the **Submit Transaction** button to proceed

    ![Batch Transfer Form](/images/tutorials/transfers/batch-transfers/batch-transfers-3.webp)

    !!! note
        For example, this image shows a batch transfer with two calls. The first call transfers tokens to one account, and the second transfers tokens to another. You can add as many calls as you want to the batch transfer and customize the token amount to each account.


For further details on how to perform a batch transfer, please refer to the [Learn about Batch Transfers on Polkadot](https://www.youtube.com/watch?v=uoUC2K8muvw){target=\_blank} educational video.

### Teleporting Tokens

Asset teleportation is the more straightforward method for sending assets from one chain to another. It has only two actors: the source and the destination.

For further information on how to teleport tokens, please refer to the [Polkadot-JS UI: How to Teleport DOT or KSM to Asset Hub](https://support.polkadot.network/support/solutions/articles/65000181119-how-to-teleport-dot-or-ksm-between-statemint-or-statemine){target=\_blank} guide or the [Teleporting | Technical Explainers](https://www.youtube.com/watch?v=3tE9ouub5Tg){target=\_blank} educational video.

## Calculating Fees

To calculate fees for a transaction, you can follow these steps:

1. Navigate to the Runtime Calls section of the Polkadot.Js App interface:
       1. Click on the **Developer** tab
       2. Select **Runtime Calls** from the dropdown menu:

    ![Developer Tab](/images/tutorials/transfers/calculating-fees/calculating-fees-1.webp)

2. Create the runtime call:
      1. Choose the **transactionPaymentApi** endpoint from the list of endpoints
      2. Select the **queryInfo** call from the list of calls

    ![Query Info](/images/tutorials/transfers/calculating-fees/calculating-fees-2.webp)

3. Fill in the required fields:
      1. **utx** - the extrinsic you want to calculate the fee for. This input should be provided in hex format
      2. **length** - the length of the extrinsic in bytes. This input should be provided in decimal format
      3. Click on the **Submit Runtime Call** button to proceed

    ![Query Info Form](/images/tutorials/transfers/calculating-fees/calculating-fees-3.webp)

    !!! note
        For this tutorial, the **utx** used is:

        ```bash
         0x49028400e4eb07054edd868d0a942b63a879c47d8aac0525e900024570ea79e7dde2790f018efdb69239f8a3ef8eda42f9321e728cd2f08e2b441bb51d0e57305b9b962429d0039d9f2f86b9c177f6eb607a7eb9f6d03d5ae4c75183dcffca3f201885218c55000c0000050300341019c16ab6492c109bdd3d54ffbc847effcbf1a043a6c63b343a3dab3c89150b005039278c04
        ```

        This is the encoded extrinsic for a transfer transaction. It is 152 bytes long.


4. Check the result of the runtime call to get the fee for the transaction:

    ![Query Info Result](/images/tutorials/transfers/calculating-fees/calculating-fees-4.webp)

Alternatively, you can query to **queryFeeDetails** call to get more information about the fee calculation:

![Query Fee Details](/images/tutorials/transfers/calculating-fees/calculating-fees-5.webp)

The sum of **baseFee**, **lenFee**, and **adjustedWeightFee** will yield the **partialFee**.

One useful utility for estimating transaction fees programmatically is the via the [@polkadot/api](https://www.npmjs.com/package/@polkadot/api){target=\_blank}. The following script demonstrates how to calculate the fee for a transfer transaction:

```javascript
// Estimate the fees as RuntimeDispatchInfo using the signer
const info = await api.tx.balances.transfer(recipient, 123).paymentInfo(sender);

// Log relevant info, partialFee is Balance, estimated for current
console.log(`
  class=${info.class.toString()},
  weight=${info.weight.toString()},
  partialFee=${info.partialFee.toHuman()}
`);
```
## Existing Reference Errors

If you are trying to reap an account and receive an error like, `There is an existing reference count on the sender account. As such, the account cannot be reaped from the state`, so you have existing references to this account that must be removed before it can be reaped. References may still exist from:

- Bonded tokens (most likely)
- Unpurged session keys (if you were previously a validator)
- Token locks
- Existing recovery info
- Existing assets

### Bonded Tokens

If you have tokens that are bonded, you will need to unbond them before you can reap your account. Follow the instructions at [Unbonding and Rebonding](https://wiki.polkadot.network/docs/learn-guides-nominator#bond-your-tokens){target=\_blank} to check if you have bonded tokens, stop nominating (if necessary) and unbond your tokens.

### Checking for Locks

For further information about locks on your account or remove them, you can check out the [Learn How You Can Free Funds - Deep Dive into Polkadot's Locks](https://www.youtube.com/watch?v=LHgY7ds_bZ0){target=_\blank} educational video and the [Why Can't I Transfer My DOT?](https://support.polkadot.network/support/solutions/articles/65000169437-why-can-t-i-transfer-tokens-){target=\_blank} guide.

### Purging Session Keys

If you used this account to set up a validator and you did not purge your keys before unbonding your tokens, you need to purge your keys. You can do this by seeing the [How to Stop Validating](https://wiki.polkadot.network/docs/maintain-guides-how-to-stop-validating){target=\_blank} page. This can also be checked by checking session.nextKeys in the chain state for an existing key.

### Existing Recovery Information

Currently, Polkadot does not use the [Recovery Pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/recovery){target=_\blank}, so this is probably not the reason for your tokens having existing references.

### Existing Non-Native Assets

Currently, Polkadot does not use the [Assets Pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/assets){target=\_blank}, so this is probably not the reason for your tokens having existing references.