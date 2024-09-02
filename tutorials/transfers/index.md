---
title: Polkadot.Js Guides about Transfers
description: Set of tutorials on how to transfer and manage funds on the Polkadot network, covering topics such as metadata updates, sending funds, teleporting tokens, calculating fees, and more.
---

# Polkadot.Js Guides about Transfers

## Metadata Updates

Before you start using the [Polkadot.Js Browser Extension](https://polkadot.js.org/extension/){target=\_blank} to interact with the Polkadot network, it is crucial to ensure that the metadata is updated. The user interface may not function properly if the metadata is not up-to-date.

To update the metadata of the Polkadot.Js Browser Extension, follow these steps:

1. Access to the Polkadot.Js App interface and click on the **Settings** tab:

    ![Settings Tab](/images/tutorials/transfers/metadata-update/metadata-update-1.webp)

2. Click on the **Metadata** tab:

    ![Metadata Tab](/images/tutorials/transfers/metadata-update/metadata-update-2.webp)

3. If there are any updates available, click on the **Update metadata** button:

    ![Update Metadata Button](/images/tutorials/transfers/metadata-update/metadata-update-3.webp)

4. A pop-up window will appear to confirm the update. Click on the **Yes, I do this metadata update** button to allow the extension to update the metadata:

    ![Update Metadata Confirmation](/images/tutorials/transfers/metadata-update/metadata-update-4.webp)

Now that the metadata is updated, you can proceed with the transfer and management of funds on the Polkadot network.

## Transfers

### Sending Funds

Whether your account is in the Polkadot Browser Extension or created/added directly on the Polkadot-JS UI, you'll need to use the Polkadot-JS UI interface to send funds or issue any extrinsic. The Polkadot extension is an account manager, not a wallet, so it requires a UI to interact with.

To send funds using the Polkadot.Js Browser Extension, follow these steps:

1. Using the Polkadot.Js App interface, click on the **Accounts** tab and select **Transfer** from the dropdown menu:

    ![Accounts Tab](/images/tutorials/transfers/sending-funds/sending-funds-1.webp)

2. Fill in the requiered fields:
      1. **send from acccount** - select the account from which you want to send funds
      2. **send to address** - enter the recipient's address
      3. **amount** - enter the amount of funds you want to send
      4. **transfer with account keep-alive checks** - enable this option if you want to keep the account alive
      5. Click on the button **Make Transfer** to proceed:

    ![Transfer Form](/images/tutorials/transfers/sending-funds/sending-funds-2.webp)

    !!!warning
        The transaction fees will be deducted from the leftover funds in your account. If you don't leave enough funds in your account for the fees, your transaction will fail due to "insufficient balance". Make sure to leave enough funds in your account to cover the transaction fees. If you want to send all the funds in your account, please refer to the [How to Send All of Your Funds Out of Your Account](https://support.polkadot.network/support/solutions/articles/65000170293){target=\_blank} guide.

3. A pop-up window will appear to confirm the transfer. Click on the **Sign and Submit** button to authorize the transaction:

    ![Transfer Confirmation](/images/tutorials/transfers/sending-funds/sending-funds-3.webp)

4. To confirm that the transaction was successful, you can check the **Explorer** tab and search that the event **Transfer** has been emited:

    ![Explorer Tab](/images/tutorials/transfers/sending-funds/sending-funds-4.webp)

### Extrinsics Verification

The Polkadot Browser Extension serves as your entry point to the Web 3.0 Polkadot ecosystem, allowing you to connect with various compatible apps and websites. Therefore, it is crucial to verify your extrinsics before signing them, especially when engaging with a new site or app

For further information on how to verify extrinsics, please refer to the [How Can I Verify What Extrinsic I'm Signing?](https://support.polkadot.network/support/solutions/articles/65000179161-how-can-i-verify-what-extrinsic-i-m-signing-){target=\_blank} guide.

### Keep Alive Checks

In Polkadot there are two main ways to transfer funds from one account to another:

- Transfer `keep-alive` - (the default option) will not allow you to send an amount that would allow the sending account to be removed because it falls below the existential deposit.
- Transfer `allow-death` - will allow you to send tokens regardless of the consequences. If the balance drops below the existential deposit, your account will be reaped. You may not want to keep the account alive, for example, if you are moving all of your funds to a different address. To turn off the keep-alive check, please visit the [Error: 'balances.KeepAlive'](https://support.polkadot.network/support/solutions/articles/65000169248){target=\_blank} guide.


### Vested Transfers

Vested transfers are those that can be released with a linear schedule (linear vesting) or after an specific time period (cliff vesting). 

To perform a vested transfer, you need to follow these steps:

1.  Navigate to the Extrinsics section of the Polkadot.Js App interface:
       1. Click on the **Developer** tab
       2. Select **Extrinsics** from the dropdown menu:

    ![Developer Tab](/images/tutorials/transfers/vested-transfers/vested-transfers-1.webp)

2. Access the **vesting** pallet and select the **vestedTransfer** function:
      1. Select the **account** from which you want to send the vested transfer
      2. Choose the **vesting** pallet from the list of pallets 
      3. Select the **vestedTransfer** function from the list of functions
   
    ![Vested Transfer Function](/images/tutorials/transfers/vested-transfers/vested-transfers-2.webp)

3. Fill in the requiered fields:
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

5. To confirm that the transaction was successful, you can navigate to the **Accounts** tab and check the **locked** balances of the receiver's account (if the **startingBlock** has not been reached yet) or the **vested** balances (if the **startingBlock** has been reached):

    ![Accounts Tab - Locked Balances](/images/tutorials/transfers/vested-transfers/vested-transfers-5.webp)

#### Lazy Vesting

Vesting is lazy, meaning that someone must explicitly call an extrinsic to update the lock placed on an account.

- The `vest` extrinsic will update the lock that is placed on the caller.
- The `vest_other` will update the lock on another "target" account's funds.

These extrinsics are exposed from the Vesting pallet.

If you are using the Polkadot.Js UI, when there are DOT available to vest for an account, then you will have the ability to unlock DOT that has already vested from the Accounts page.

#### Calculating When Vesting Tokens Will Be Available

You can typically check the status of your DOT vesting by reviewing your accounts, which will show when the vesting period ends. However, some DOT vesting involves "cliffs," where all the tokens are released at once in a single block, rather than gradually over time. In these cases, you'll need to directly query the chain state to determine when your tokens will be available, as the vesting period hasn’t technically begun yet—it will occur entirely in one future block.

1. Navigate to the Chain State page on Polkadot.Js  
   ![Chain State Page](/images/tutorials/transfers/vested-transfers/vested-transfers-6.webp)
2. Query chain state:
      1. Select the `vesting` query state
      2. Select `vesting` from the list of modules
      3. Select the address you want to query
      4. Click on the **+** button to execute the query
    
    ![Query Chain State](/images/tutorials/transfers/vested-transfers/vested-transfers-7.webp)
    
3. Note the **startingBlock** indicates where the unlock starts, and how much DOT is unlocked per block (**perBlock**)

    ![Query Chain State Result](/images/tutorials/transfers/vested-transfers/vested-transfers-8.webp)
 
4. To calculate when the vesting will be available into “human time", remember that there are approximately 14’400 blocks per day, and you can see the latest block on the Explorer page:

    For instance, this example shows that the vesting will start at block 22,400,500 and the current block is 22,359,749 (as shown on the Explorer page). The difference between these two blocks is 40,751 blocks. If you divide this number by 14,400, you will get the number of days until the vesting starts. Which in this case is 2.83 days.

### Batch Transfers

### Teleporting Tokens

## Calculating Fees

## Existing Reference Errors

### Bonded Tokens

### Checking for Locks

### Purging Session Keys

### Existing Recovery Information

### Existing Non-Native Assets
