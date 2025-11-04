
## Deploying Contracts

1. To deploy your contract, you need to:

    1. Navigate to the **Deploy & Run Transactions** tab (fourth icon in the left sidebar).
    2. Click the **Environment** dropdown.
    3. Select **Customize this list**.

        ![](/images/smart-contracts/dev-environments//get-started/remix-7.webp)

2. Enable the **Injected Provider - MEta** option.

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-8.webp)

4. Click again the **Environment** dropdown and select **Injected Provider - Talisman**.

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-9.webp)

4. Click the **Deploy** button and then click **Approve** in the Talisman wallet popup.

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-10.webp)

5. Once your contract is deployed successfully, you will see the following output in the Remix terminal:

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-11.webp)

## Interacting with Contracts

Once deployed, your contract appears in the **Deployed/Unpinned Contracts** section:

1. Expand the contract to view available methods.

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-12.webp)

    !!! tip
        Pin your frequently used contracts to the **Pinned Contracts** section for easy access.

2. To interact with the contract, you can select any of the exposed methods.

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-13.webp)

    In this way, you can interact with your deployed contract by reading its state or writing to it. The button color indicates the type of interaction available:

    - **Red**: Modifies state and is payable.
    - **Orange**: Modifies state only.
    - **Blue**: Reads state.