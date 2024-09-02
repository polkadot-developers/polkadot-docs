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

<!-- TODO: check what's missing from this original article: https://support.polkadot.network/support/solutions/articles/65000170304-polkadot-js-ui-how-to-send-transfer-funds-out-of-your-account -->

### Extrinsics Verification

### Keep Alive Checks

### Vested Transfers

### Batch Transfers

### Teleporting Tokens

## Calculating Fees

## Existing Reference Errors

### Bonded Tokens

### Checking for Locks

### Purging Session Keys

### Existing Recovery Information

### Existing Non-Native Assets
