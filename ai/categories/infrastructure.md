Begin New Bundle: Infrastructure
Includes shared base categories: Basics, Reference


---

Page Title: Accounts in Asset Hub Smart Contracts

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-accounts.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/accounts/
- Summary: Bridges Ethereum's 20-byte addresses with Polkadot's 32-byte accounts, enabling seamless interaction while maintaining compatibility with Ethereum tooling.

# Accounts on Asset Hub Smart Contracts

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Asset Hub natively utilizes Polkadot's 32-byte account system while providing interoperability with Ethereum's 20-byte addresses through an automatic conversion system. When interacting with smart contracts:

- Ethereum-compatible wallets (like MetaMask) can use their familiar 20-byte addresses.
- Polkadot accounts continue using their native 32-byte format.
- The Asset Hub chain automatically handles conversion between the two formats behind the scenes:

    - 20-byte Ethereum addresses are padded with `0xEE` bytes to create valid 32-byte Polkadot accounts.
    - 32-byte Polkadot accounts can optionally register a mapping to a 20-byte address for Ethereum compatibility.

This dual-format approach enables Asset Hub to maintain compatibility with Ethereum tooling while fully integrating with the Polkadot ecosystem.

## Address Types and Mappings

The platform handles two distinct address formats:

- [Ethereum-style addresses (20 bytes)](https://ethereum.org/en/developers/docs/accounts/#account-creation){target=\_blank}
- [Polkadot native account IDs (32 bytes)](/polkadot-protocol/parachain-basics/accounts/){target=\_blank}

### Ethereum to Polkadot Mapping

The [`AccountId32Mapper`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/struct.AccountId32Mapper.html){target=\_blank} implementation in [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} handles the core address conversion logic. For converting a 20-byte Ethereum address to a 32-byte Polkadot address, the pallet uses a simple concatenation approach:

- [**Core mechanism**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_fallback_account_id){target=\_blank}: Takes a 20-byte Ethereum address and extends it to 32 bytes by adding twelve `0xEE` bytes at the end. The key benefits of this approach are:
    - Able to fully revert, allowing a smooth transition back to the Ethereum format.
    - Provides clear identification of Ethereum-controlled accounts through the `0xEE` suffix pattern.
    - Maintains cryptographic security with a `2^96` difficulty for pattern reproduction.

### Polkadot to Ethereum Mapping

The conversion from 32-byte Polkadot accounts to 20-byte Ethereum addresses is more complex than the reverse direction due to the lossy nature of the conversion. The [`AccountId32Mapper`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/struct.AccountId32Mapper.html){target=\_blank} handles this through two distinct approaches:

- **For Ethereum-derived accounts**: The system uses the [`is_eth_derived`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.is_eth_derived.html){target=\_blank} function to detect accounts that were originally Ethereum addresses (identified by the `0xEE` suffix pattern). For these accounts, the conversion strips the last 12 bytes to recover the original 20-byte Ethereum address.

- **For native Polkadot accounts**: Since these accounts utilize the whole 32-byte space and weren't derived from Ethereum addresses, direct truncation would result in lost information. Instead, the system:

    1. Hashes the entire 32-byte account using Keccak-256.
    2. Takes the last 20 bytes of the hash to create the Ethereum address.
    3. This ensures a deterministic mapping while avoiding simple truncation.

The conversion process is implemented through the [`to_address`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_address){target=\_blank} function, which automatically detects the account type and applies the appropriate conversion method.

**Stateful Mapping for Reversibility** : Since the conversion from 32-byte to 20-byte addresses is inherently lossy, the system provides an optional stateful mapping through the [`OriginalAccount`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/storage_types/struct.OriginalAccount.html){target=\_blank} storage. When a Polkadot account registers a mapping (via the [`map`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.map){target=\_blank} function), the system stores the original 32-byte account ID, enabling the [`to_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_account_id){target=\_blank} function to recover the exact original account rather than falling back to a default conversion.


### Account Mapping for Native Polkadot Accounts

If you have a native Polkadot account (32-byte format) that was created with a Polkadot/Substrate keypair (Ed25519/Sr25519) rather than an Ethereum-compatible keypair (secp256k1), you'll need to map your account to enable Ethereum compatibility.

To map your account, call the [`map_account`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/dispatchables/fn.map_account.html){target=\_blank} extrinsic of the [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} pallet using your original Substrate account. This creates a stateful mapping that allows your 32-byte account to interact with the Ethereum-compatible smart contract system.

Once mapped, you'll be able to:

- Transfer funds between 20-byte format addresses.
- Interact with smart contracts using Ethereum-compatible tools like MetaMask.
- Maintain full reversibility to your original 32-byte account format.

!!! warning "Mapping Requirement"
    Without this mapping, native Polkadot accounts cannot transfer funds or interact with the Ethereum-compatible layer on the Hub.

## Account Registration

The registration process is implemented through the [`map`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.map){target=\_blank} function. This process involves:

- Checking if the account is already mapped.
- Calculating and collecting required deposits based on data size.
- Storing the address suffix for future reference.
- Managing the currency holds for security.

## Fallback Accounts

The fallback mechanism is integrated into the [`to_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_account_id){target=\_blank} function. It provides a safety net for address conversion by:

- First, attempting to retrieve stored mapping data.
- Falling back to the default conversion method if no mapping exists.
- Maintaining consistency in address representation.

## Contract Address Generation

The system supports two methods for generating contract addresses:

- [CREATE1 method](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.create1.html){target=\_blank}:

    - Uses the deployer address and nonce.
    - Generates deterministic addresses for standard contract deployment.

- [CREATE2 method](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.create2.html){target=\_blank}:

    - Uses the deployer address, initialization code, input data, and salt.
    - Enables predictable address generation for advanced use cases.

## Security Considerations

The address mapping system maintains security through several design choices evident in the implementation:

- The stateless mapping requires no privileged operations, as shown in the [`to_fallback_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_fallback_account_id){target=\_blank} implementation.
- The stateful mapping requires a deposit managed through the [`Currency`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/trait.Config.html#associatedtype.Currency){target=\_blank} trait.
- Mapping operations are protected against common errors through explicit checks.
- The system prevents double-mapping through the [`ensure!(!Self::is_mapped(account_id))`](https://github.com/paritytech/polkadot-sdk/blob/stable2412/substrate/frame/revive/src/address.rs#L125){target=\_blank} check.

All source code references are from the [`address.rs`](https://github.com/paritytech/polkadot-sdk/blob/stable2412/substrate/frame/revive/src/address.rs){target=\_blank} file in the Revive pallet of the Polkadot SDK repository.


---

Page Title: Create a Smart Contract

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/tutorials-smart-contracts-launch-your-first-project-create-contracts.md
- Canonical (HTML): https://docs.polkadot.com/tutorials/smart-contracts/launch-your-first-project/create-contracts/
- Summary: Learn how to write a basic smart contract using just a text editor. This guide covers creating and preparing a contract for deployment on Polkadot Hub.

# Create a Smart Contract

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Creating [smart contracts](/develop/smart-contracts/overview/){target=\_blank} is fundamental to blockchain development. While many frameworks and tools are available, understanding how to write a contract from scratch with just a text editor is essential knowledge.

This tutorial will guide you through creating a basic smart contract that can be used with other tutorials for deployment and integration on Polkadot Hub. To understand how smart contracts work in Polkadot Hub, check the [Smart Contract Basics](/polkadot-protocol/smart-contract-basics/){target=\_blank} guide for more information.

## Prerequisites

Before starting, make sure you have:

- A text editor of your choice ([VS Code](https://code.visualstudio.com/){target=\_blank}, [Sublime Text](https://www.sublimetext.com/){target=\_blank}, etc.).
- Basic understanding of programming concepts.
- Familiarity with the Solidity programming language syntax. For further references, check the official [Solidity documentation](https://docs.soliditylang.org/en/latest/){target=\_blank}.

## Understanding Smart Contract Structure

Let's explore these components before building the contract:

- **[SPDX license identifier](https://docs.soliditylang.org/en/v0.6.8/layout-of-source-files.html){target=\_blank}**: A standardized way to declare the license under which your code is released. This helps with legal compliance and is required by the Solidity compiler to avoid warnings.
- **Pragma directive**: Specifies which version of Solidity compiler should be used for your contract.
- **Contract declaration**: Similar to a class in object-oriented programming, it defines the boundaries of your smart contract.
- **State variables**: Data stored directly in the contract that persists between function calls. These represent the contract's "state" on the blockchain.
- **Functions**: Executable code that can read or modify the contract's state variables.
- **Events**: Notification mechanisms that applications can subscribe to in order to track blockchain changes.

## Create the Smart Contract

In this section, you'll build a simple storage contract step by step. This basic Storage contract is a great starting point for beginners. It introduces key concepts like state variables, functions, and events in a simple way, demonstrating how data is stored and updated on the blockchain. Later, you'll explore each component in more detail to understand what's happening behind the scenes.

This contract will:

- Store a number.
- Allow updating the stored number.
- Emit an event when the number changes.

To build the smart contract, follow the steps below:

1. Create a new file named `Storage.sol`.

2. Add the SPDX license identifier at the top of the file:

    ```solidity
    // SPDX-License-Identifier: MIT
    ```

    This line tells users and tools which license governs your code. The [MIT license](https://opensource.org/license/mit){target=\_blank} is commonly used for open-source projects. The Solidity compiler requires this line to avoid licensing-related warnings.

3. Specify the Solidity version:

    ```solidity
    pragma solidity ^0.8.28;
    ```

    The caret `^` means "this version or any compatible newer version." This helps ensure your contract compiles correctly with the intended compiler features.

4. Create the contract structure:

    ```solidity
    contract Storage {
        // Contract code will go here
    }
    ```

    This defines a contract named "Storage", similar to how you would define a class in other programming languages.

5. Add the state variables and event:

    ```solidity
    contract Storage {
        // State variable to store a number
        uint256 private number;
        
        // Event to notify when the number changes
        event NumberChanged(uint256 newNumber);
    }
    ```

    Here, you're defining:

    - A state variable named `number` of type `uint256` (unsigned integer with 256 bits), which is marked as `private` so it can only be accessed via functions within this contract.
    - An event named `NumberChanged` that will be triggered whenever the number changes. The event includes the new value as data.

6. Add the getter and setter functions:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.28;

    contract Storage {
        // State variable to store our number
        uint256 private number;

        // Event to notify when the number changes
        event NumberChanged(uint256 newNumber);

        // Function to store a new number
        function store(uint256 newNumber) public {
            number = newNumber;
            emit NumberChanged(newNumber);
        }

        // Function to retrieve the stored number
        function retrieve() public view returns (uint256) {
            return number;
        }
    }
    ```

??? code "Complete Storage.sol contract"

    ```solidity title="Storage.sol"
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.28;

    contract Storage {
        // State variable to store our number
        uint256 private number;

        // Event to notify when the number changes
        event NumberChanged(uint256 newNumber);

        // Function to store a new number
        function store(uint256 newNumber) public {
            number = newNumber;
            emit NumberChanged(newNumber);
        }

        // Function to retrieve the stored number
        function retrieve() public view returns (uint256) {
            return number;
        }
    }
    ```

## Understanding the Code

Let's break down the key components of the contract:

- **State Variable**

    - **`uint256 private number`**: A private variable that can only be accessed through the contract's functions.
    - The `private` keyword prevents direct access from other contracts, but it's important to note that while other contracts cannot read this variable directly, the data itself is still visible on the blockchain and can be read by external tools or applications that interact with the blockchain. "Private" in Solidity doesn't mean the data is encrypted or truly hidden.
    - State variables in Solidity are permanent storage on the blockchain, making them different from variables in traditional programming. Every change to a state variable requires a transaction and costs gas (the fee paid for blockchain operations).

- **Event**

    - **`event NumberChanged(uint256 newNumber)`**: Emitted when the stored number changes.
    - When triggered, events write data to the blockchain's log, which can be efficiently queried by applications.
    - Unlike state variables, events cannot be read by smart contracts, only by external applications.
    - Events are much more gas-efficient than storing data when you only need to notify external systems of changes.

- **Functions**

    - **`store(uint256 newNumber)`**: Updates the stored number and emits an event.
        - This function changes the state of the contract and requires a transaction to execute.
        - The `emit` keyword is used to trigger the defined event.

    - **`retrieve()`**: Returns the current stored number.
        - The `view` keyword indicates that this function only reads data and doesn't modify the contract's state.
        - View functions don't require a transaction and don't cost gas when called externally.

    For those new to Solidity, this naming pattern (getter/setter functions) is a common design pattern. Instead of directly accessing state variables, the convention is to use functions to control access and add additional logic if needed.

This basic contract serves as a foundation for learning smart contract development. Real-world contracts often require additional security considerations, more complex logic, and thorough testing before deployment.

For more detailed information about Solidity types, functions, and best practices, refer to the [Solidity documentation](https://docs.soliditylang.org/en/latest/){target=\_blank} or this [beginner's guide to Solidity](https://www.tutorialspoint.com/solidity/index.htm){target=\_blank}.

## Where to Go Next


<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Test and Deploy with Hardhat__

    ---

    Learn how to test and deploy the smart contract you created by using Hardhat.

    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat/)

</div>


---

Page Title: Deploy an ERC-20 to Polkadot Hub

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/tutorials-smart-contracts-deploy-erc20.md
- Canonical (HTML): https://docs.polkadot.com/tutorials/smart-contracts/deploy-erc20/
- Summary: Deploy an ERC-20 token on Polkadot Hub using PolkaVM. This guide covers contract creation, compilation, deployment, and interaction via Polkadot Remix IDE.

# Deploy an ERC-20 to Polkadot Hub

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

[ERC-20](https://eips.ethereum.org/EIPS/eip-20){target=\_blank} tokens are fungible tokens commonly used for creating cryptocurrencies, governance tokens, and staking mechanisms. Polkadot Hub enables easy token deployment with Ethereum-compatible smart contracts via PolkaVM.

This tutorial covers deploying an ERC-20 contract on the Polkadot Hub TestNet using [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}, a web-based development tool. [OpenZeppelin's ERC-20 contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.4.0/contracts/token/ERC20){target=\_blank} are used for security and compliance.

## Prerequisites

Before starting, make sure you have:

- [MetaMask](https://metamask.io/){target=\_blank} installed and connected to Polkadot Hub. For detailed instructions, see the [Connect Your Wallet](/develop/smart-contracts/wallets){target=\_blank} section.
- A funded account with some PAS tokens (you can get them from the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section.
- Basic understanding of Solidity and fungible tokens.

## Create the ERC-20 Contract

To create the ERC-20 contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}.
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyToken.sol`.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-1.webp)

3. Now, paste the following ERC-20 contract code into the editor:

    ```solidity title="MyToken.sol"
    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.22;

    import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

    contract MyToken is ERC20, Ownable {
        constructor(address initialOwner)
            ERC20("MyToken", "MTK")
            Ownable(initialOwner)
        {}

        function mint(address to, uint256 amount) public onlyOwner {
            _mint(to, amount);
        }
    }
    ```

    The key components of the code above are:

    - Contract imports:

        - **[`ERC20.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.4.0/contracts/token/ERC20/ERC20.sol){target=\_blank}**: The base contract for fungible tokens, implementing core functionality like transfers, approvals, and balance tracking.
        - **[`Ownable.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.4.0/contracts/access/Ownable.sol){target=\_blank}**: Provides basic authorization control, ensuring only the contract owner can mint new tokens.
    
    - Constructor parameters:

        - **`initialOwner`**: Sets the address that will have administrative rights over the contract.
        - **`"MyToken"`**: The full name of your token.
        - **`"MTK"`**: The symbol representing your token in wallets and exchanges.

    - Key functions:

        - **`mint(address to, uint256 amount)`**: Allows the contract owner to create new tokens for any address. The amount should include 18 decimals (e.g., 1 token = 1000000000000000000).
        - Inherited [Standard ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/){target=\_blank} functions:
            - **`transfer(address recipient, uint256 amount)`**: Sends a specified amount of tokens to another address.
            - **`approve(address spender, uint256 amount)`**: Grants permission for another address to spend a specific number of tokens on behalf of the token owner.
            - **`transferFrom(address sender, address recipient, uint256 amount)`**: Transfers tokens from one address to another, if previously approved.
            - **`balanceOf(address account)`**: Returns the token balance of a specific address.
            - **`allowance(address owner, address spender)`**: Checks how many tokens an address is allowed to spend on behalf of another address.

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to quickly generate customized smart contracts. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment. Below is an example of an ERC-20 token contract created with it:

        ![Screenshot of the OpenZeppelin Contracts Wizard showing an ERC-20 contract configuration.](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-2.webp)
        

## Compile the Contract

The compilation transforms your Solidity source code into bytecode that can be deployed on the blockchain. During this process, the compiler checks your contract for syntax errors, ensures type safety, and generates the machine-readable instructions needed for blockchain execution. To compile your contract, follow the instructions below:

1. Select the **Solidity Compiler** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-3.webp)

2. Click the **Compile MyToken.sol** button.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-4.webp)

3. If the compilation succeeded, you'll see a green checkmark indicating success in the **Solidity Compiler** icon.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-5.webp)

## Deploy the Contract

Deployment is the process of publishing your compiled smart contract to the blockchain, making it permanently available for interaction. During deployment, you'll create a new instance of your contract on the blockchain, which involves:

1. Select the **Deploy & Run Transactions** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-6.webp)

2. Configure the deployment settings.
    1. From the **ENVIRONMENT** dropdown, select **Injected Provider - Talisman** (check the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts){target=\_blank} section of the Remix IDE guide for more details).
    2. From the **ACCOUNT** dropdown, select the account you want to use for the deploy.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-7.webp)

3. Configure the contract parameters:

    1. Enter the address that will own the deployed token contract.
    2. Click the **Deploy** button to initiate the deployment.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-8.webp)

4. **Talisman will pop up**: Review the transaction details. Click **Approve** to deploy your contract.

     ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-9.webp){: .browser-extension}

    If the deployment process succeeded, you will see the transaction details in the terminal, including the contract address and deployment transaction hash:

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-10.webp)

## Interact with Your ERC-20 Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-11.webp)

2. To mint new tokens:

    1. Click in the contract to expand its associated methods.
    2. Expand the **mint** function.
    3. Enter:
        - The recipient address.
        - The amount (remember to add 18 zeros for 1 whole token).
    4. Click **Transact**.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-12.webp)

3. Click **Approve** to confirm the transaction in the Talisman popup.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-13.webp){: .browser-extension}

    If the transaction succeeds, you will see the following output in the terminal:

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-14.webp)

Other common functions you can use:

- **`balanceOf(address)`**: Check token balance of any address.
- **`transfer(address to, uint256 amount)`**: Send tokens to another address.
- **`approve(address spender, uint256 amount)`**: Allow another address to spend your tokens.

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through Talisman when needed.


---

Page Title: Deploy an NFT to Polkadot Hub

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/tutorials-smart-contracts-deploy-nft.md
- Canonical (HTML): https://docs.polkadot.com/tutorials/smart-contracts/deploy-nft/
- Summary: Deploy an NFT on Polkadot Hub using PolkaVM and OpenZeppelin. Learn how to compile, deploy, and interact with your contract using Polkadot Remix IDE.

# Deploy an NFT to Polkadot Hub

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Polkadot Hub supports Ethereum-compatible smart contracts through PolkaVM, enabling straightforward NFT deployment.

This tutorial guides you through deploying an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract on the Polkadot Hub TestNet using the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}, a web-based development environment. To ensure security and standard compliance, it uses [OpenZeppelin's NFT contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.4.0){target=\_blank} implementation.

## Prerequisites

Before starting, make sure you have:

- [Talisman](https://talisman.xyz/){target=\_blank} installed and connected to the Polkadot Hub TestNet. Check the [Connect to Polkadot](/develop/smart-contracts/connect-to-polkadot/){target=\_blank} guide for more information.
- A funded account with some PAS tokens (you can get them from the [Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}, noting that the faucet imposes a daily token limit, which may require multiple requests to obtain sufficient funds for testing).
- Basic understanding of Solidity and NFTs, see the [Solidity Basics](https://soliditylang.org/){target=\_blank} and the [NFT Overview](https://ethereum.org/en/nft/){target=\_blank} guides for more details.

## Create the NFT Contract

To create the NFT contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io/){target=\_blank}.
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyNFT.sol`.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-1.webp)

3. Now, paste the following NFT contract code into the editor.

    ```solidity title="MyNFT.sol"
    // SPDX-License-Identifier: MIT
    // Compatible with OpenZeppelin Contracts ^5.0.0
    pragma solidity ^0.8.22;

    import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

    contract MyToken is ERC721, Ownable {
        uint256 private _nextTokenId;

        constructor(address initialOwner)
            ERC721("MyToken", "MTK")
            Ownable(initialOwner)
        {}

        function safeMint(address to) public onlyOwner {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }
    ```

    The key components of the code above are:

    - Contract imports:

        - **[`ERC721.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.4.0/contracts/token/ERC721/ERC721.sol){target=\_blank}**: The base contract for non-fungible tokens, implementing core NFT functionality like transfers and approvals.
        - **[`Ownable.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.4.0/contracts/access/Ownable.sol){target=\_blank}**: Provides basic authorization control, ensuring only the contract owner can mint new tokens.
    
    - Constructor parameters:

        - **`initialOwner`**: Sets the address that will have administrative rights over the contract.
        - **`"MyToken"`**: The full name of your NFT collection.
        - **`"MTK"`**: The symbol representing your token in wallets and marketplaces.

    - Key functions:

        - **[`_safeMint(to, tokenId)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.4.0/contracts/token/ERC721/ERC721.sol#L304){target=\_blank}**: An internal function from `ERC721` that safely mints new tokens. It includes checks to ensure the recipient can handle `ERC721` tokens, with the `_nextTokenId` mechanism automatically generating unique sequential token IDs and the `onlyOwner` modifier restricting minting rights to the contract owner.
        - Inherited [Standard ERC721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/){target=\_blank} functions provide a standardized set of methods that enable interoperability across different platforms, wallets, and marketplaces, ensuring that your NFT can be easily transferred, traded, and managed by any system that supports the `ERC721` standard:
            - **`transferFrom(address from, address to, uint256 tokenId)`**: Transfers a specific NFT from one address to another.
            - **`safeTransferFrom(address from, address to, uint256 tokenId)`**: Safely transfers an NFT, including additional checks to prevent loss.
            - **`approve(address to, uint256 tokenId)`**: Grants permission for another address to transfer a specific NFT.
            - **`setApprovalForAll(address operator, bool approved)`**: Allows an address to manage all of the owner's NFTs.
            - **`balanceOf(address owner)`**: Returns the number of NFTs owned by a specific address.
            - **`ownerOf(uint256 tokenId)`**: Returns the current owner of a specific NFT.

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to generate customized smart contracts quickly. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment. Below is an example of an ERC-721 token contract created with it:

        ![Screenshot of the OpenZeppelin Contracts Wizard showing an ERC-721 contract configuration.](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-2.webp)


## Compile the Contract

Compilation is a stage that converts your Solidity source code into bytecode suitable for deployment on the blockchain. Throughout this process, the compiler examines your contract for syntax errors, verifies type safety, and produces machine-readable instructions for execution on the blockchain.

1. Select the **Solidity Compiler** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-3.webp)

2. Click in the **Compile MyNFT.sol** button.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-4.webp)

3. If the compilation succeeded, you can see a green checkmark indicating success in the **Solidity Compiler** icon.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-5.webp)

## Deploy the Contract

Deployment is the process of uploading your compiled smart contract to the blockchain, allowing for interaction. During deployment, you will instantiate your contract on the blockchain, which involves:

1. Select the **Deploy & Run Transactions** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-6.webp)

2. Configure the deployment settings:

    1. From the **ENVIRONMENT** dropdown, select **Injected Provider - Talisman** (check the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts){target=\_blank} section of the Remix IDE guide for more details).
    2. From the **ACCOUNT** dropdown, select the account you want to use for the deploy.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-7.webp)

3. Configure the contract parameters:

    1. Enter the address that will own the deployed NFT.
    2. Click the **Deploy** button to initiate the deployment.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-8.webp)

4. **Talisman will pop up**: Review the transaction details. Click **Approve** to deploy your contract.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-9.webp){: .browser-extension}

    Deploying this contract requires paying gas fees in PAS tokens on the Polkadot Hub TestNet. Ensure your Talisman account is funded with sufficient PAS tokens from the faucet before confirming the transaction, check the [Test Tokens](/develop/smart-contracts/connect-to-polkadot/#test-tokens){target=\_blank} section for more information. Gas fees cover the computational resources needed to deploy and execute the smart contract on the blockchain.

    If the deployment process succeeded, you will see the following output in the terminal:

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-10.webp)

## Interact with Your NFT Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods for the contract.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-11.webp)

2. To mint an NFT:

    1. Click on the contract to expand its associated methods.
    2. Expand the **safeMint** function.
    3. Enter the recipient address.
    4. Click **Transact**.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-12.webp)

3. Click **Approve** to confirm the transaction in the Talisman popup.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-13.webp){: .browser-extension}

    If the transaction is successful, the terminal will display the following output, which details the information about the transaction, including the transaction hash, the block number, the associated logs, and so on.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-14.webp)

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through Talisman when needed.


---

Page Title: EVM vs PolkaVM

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-evm-vs-polkavm.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/
- Summary: Compares EVM and PolkaVM, highlighting key architectural differences, gas models, memory management, and account handling while ensuring Solidity compatibility.

# EVM vs PolkaVM

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

While [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design/){target=\_blank} strives for maximum Ethereum compatibility, several fundamental design decisions create necessary divergences from the [EVM](https://ethereum.org/en/developers/docs/evm/){target=\_blank}. These differences represent trade-offs that enhance performance and resource management while maintaining accessibility for Solidity developers.

## Core Virtual Machine Architecture

The most significant departure from Ethereum comes from PolkaVM's foundation itself. Rather than implementing the EVM, PolkaVM utilizes a RISC-V instruction set. For most Solidity developers, this architectural change remains transparent thanks to the [Revive compiler's](https://github.com/paritytech/revive){target=\_blank} complete Solidity support, including inline assembler functionality.

```mermaid
graph TD
    subgraph "Ethereum Path"
        EthCompile["Standard Solidity Compiler"] --> EVM_Bytecode["EVM Bytecode"]
        EVM_Bytecode --> EVM["Stack-based EVM"]
        EVM --> EthExecution["Contract Execution"]
    end

    subgraph "PolkaVM Path"
        ReviveCompile["Revive Compiler"] --> RISCV_Bytecode["RISC-V Format Bytecode"]
        RISCV_Bytecode --> PolkaVM["RISC-V Based PolkaVM"]
        PolkaVM --> PolkaExecution["Contract Execution"]
    end

    EthExecution -.-> DifferencesNote["Key Differences:
    - Instruction Set Architecture
    - Bytecode Format
    - Runtime Behavior"]
    PolkaExecution -.-> DifferencesNote
```

However, this architectural difference becomes relevant in specific scenarios. Tools that attempt to download and inspect contract bytecode will fail, as they expect EVM bytecode rather than PolkaVM's RISC-V format. Most applications typically pass bytecode as an opaque blob, making this a non-issue for standard use cases.

This primarily affects contracts using [`EXTCODECOPY`](https://www.evm.codes/?fork=cancun#3c){target=\_blank} to manipulate code at runtime. A contract encounters problems specifically when it uses `EXTCODECOPY` to copy contract code into memory and then attempts to mutate it. This pattern is not possible in standard Solidity and requires dropping down to YUL assembly. An example would be a factory contract written in assembly that constructs and instantiates new contracts by generating code at runtime. Such contracts are rare in practice.

PolkaVM offers an elegant alternative through its [on-chain constructors](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/struct.Pallet.html#method.bare_instantiate){target=\_blank}, enabling contract instantiation without runtime code modification, making this pattern unnecessary. This architectural difference also impacts how contract deployment works more broadly, as discussed in the [Contract Deployment](#contract-deployment) section.

### High-Level Architecture Comparison

|            Feature            |                            Ethereum Virtual Machine (EVM)                            |                        PolkaVM                         |
|:-----------------------------:|:------------------------------------------------------------------------------------:|:------------------------------------------------------:|
|      **Instruction Set**      |                               Stack-based architecture                               |                 RISC-V instruction set                 |
|      **Bytecode Format**      |                                     EVM bytecode                                     |                     RISC-V format                      |
|    **Contract Size Limit**    |                                 24KB code size limit                                 |            Contract-specific memory limits             |
|         **Compiler**          |                                  Solidity Compiler                                   |                    Revive Compiler                     |
|      **Inline Assembly**      |                                      Supported                                       |         Supported with the compatibility layer         |
|    **Code Introspection**     | Supported via [`EXTCODECOPY`](https://www.evm.codes/?fork=cancun#3c){target=\_blank} | Limited support, alternative via on-chain constructors |
|     **Resource Metering**     |                                  Single gas metric                                   |                   Multi-dimensional                    |
| **Runtime Code Modification** |                                      Supported                                       |               Limited, with alternatives               |
|  **Contract Instantiation**   |                                 Standard deployment                                  |    On-chain constructors for flexible instantiation    |

## Gas Model

Ethereum's resource model relies on a single metric: [gas](https://ethereum.org/en/developers/docs/gas/#what-is-gas){target=\_blank}, which serves as the universal unit for measuring computational costs. Each operation on the network consumes a specific amount of gas. Most platforms aiming for Ethereum compatibility typically adopt identical gas values to ensure seamless integration.

The significant changes to Ethereum's gas model will be outlined in the following sections.

### Dynamic Gas Value Scaling

Instead of adhering to Ethereum's fixed gas values, PolkaVM implements benchmark-based pricing that better reflects its improved execution performance. This makes instructions cheaper relative to I/O-bound operations but requires developers to avoid hardcoding gas values, particularly in cross-contract calls.

### Multi-Dimensional Resource Metering

Moving beyond Ethereum's single gas metric, PolkaVM meters three distinct resources:

- **`ref_time`**: Equivalent to traditional gas, measuring computation time.
- **`proof_size`**: Tracks state proof size for validator verification.
- **`storage_deposit`**: Manages state bloat through a deposit system.

All three resources can be limited at the transaction level, just like gas on Ethereum. The [Ethereum RPC proxy](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/revive/rpc){target=\_blank} maps all three dimensions into the single gas dimension, ensuring everything behaves as expected for users.

These resources can also be limited when making cross-contract calls, which is essential for security when interacting with untrusted contracts. However, Solidity only allows specifying `gas_limit` for cross-contract calls. The `gas_limit` is most similar to Polkadots `ref_time_limit`, but the Revive compiler doesn't supply any imposed `gas_limit` for cross-contract calls for two key reasons:

- **Semantic differences**: `gas_limit` and `ref_time_limit` are not semantically identical; blindly passing EVM gas as `ref_time_limit` can lead to unexpected behavior.
- **Incomplete protection**: The other two resources (`proof_size` and `storage_deposit`) would remain uncapped anyway, making it insufficient to prevent malicious callees from performing DOS attacks.

When resources are "uncapped" in cross-contract calls, they remain constrained by transaction-specified limits, preventing abuse of the transaction signer.

!!! note
    The runtime will provide a special precompile, allowing cross-contract calls with limits specified for all weight dimensions in the future.

All gas-related opcodes like [`GAS`](https://www.evm.codes/?fork=cancun#5a){target=\_blank} or [`GAS_LIMIT`](https://www.evm.codes/?fork=cancun#45){target=\_blank} return only the `ref_time` value as it's the closest match to traditional gas. Extended APIs will be provided through precompiles to make full use of all resources, including cross-contract calls with all three resources specified.

## Memory Management

The EVM and the PolkaVM take fundamentally different approaches to memory constraints:

|         Feature          |      Ethereum Virtual Machine (EVM)       |                    PolkaVM                     |
|:------------------------:|:-----------------------------------------:|:----------------------------------------------:|
|  **Memory Constraints**  |      Indirect control via gas costs       |        Hard memory limits per contract         |
|      **Cost Model**      | Increasing gas curve with allocation size |    Fixed costs separated from execution gas    |
|    **Memory Limits**     | Soft limits through prohibitive gas costs |         Hard fixed limits per contract         |
|  **Pricing Efficiency**  |     Potential overcharging for memory     | More efficient through separation of concerns  |
|   **Contract Nesting**   |         Limited by available gas          |    Limited by constant memory per contract     |
|   **Memory Metering**    |     Dynamic based on total allocation     |      Static limits per contract instance       |
| **Future Improvements**  |       Incremental gas cost updates        | Potential dynamic metering for deeper nesting  |
| **Cross-Contract Calls** |      Handled through gas forwarding       | Requires careful boundary limit implementation |

The architecture establishes a constant memory limit per contract, which is the basis for calculating maximum contract nesting depth. This calculation assumes worst-case memory usage for each nested contract, resulting in a straightforward but conservative limit that operates independently of actual memory consumption. Future iterations may introduce dynamic memory metering, allowing deeper nesting depths for contracts with smaller memory footprints. However, such an enhancement would require careful implementation of cross-contract boundary limits before API stabilization, as it would introduce an additional resource metric to the system.

### Current Memory Limits

The following table depicts memory-related limits at the time of writing:

|                   Limit                    |     Maximum     |
|:------------------------------------------:|:---------------:|
|              Call stack depth              |        5        |
|                Event topics                |        4        |
| Event data payload size (including topics) |    416 bytes    |
|             Storage value size             |    416 bytes    |
|        Transient storage variables         | 128 uint values |
|            Immutable variables             | 16 uint values  |
|          Contract code blob size           | ~100 kilobytes  |

!!! note
    Limits might be increased in the future. To guarantee existing contracts work as expected, limits will never be decreased.

## Account Management - Existential Deposit

Ethereum and Polkadot handle account persistence differently, affecting state management and contract interactions:

### Account Management Comparison

|          Feature          |                   Ethereum Approach                   |               PolkaVM/Polkadot Approach                |
|:-------------------------:|:-----------------------------------------------------:|:------------------------------------------------------:|
|  **Account Persistence**  | Accounts persist indefinitely, even with zero balance | Requires existential deposit (ED) to maintain account  |
|    **Minimum Balance**    |                         None                          |                      ED required                       |
|   **Account Deletion**    |               Accounts remain in state                |      Accounts below ED are automatically deleted       |
|   **Contract Accounts**   |                  Exist indefinitely                   |                    Must maintain ED                    |
|   **Balance Reporting**   |                 Reports full balance                  |      Reports ED-adjusted balance via Ethereum RPC      |
| **New Account Transfers** |                   Standard transfer                   |     Includes ED automatically with extra fee cost      |
| **Contract-to-Contract**  |                   Direct transfers                    | ED drawn from transaction signer, not sending contract |
|   **State Management**    |      Potential bloat from zero-balance accounts       |     Optimized with auto-deletion of dust accounts      |

This difference introduces potential compatibility challenges for Ethereum-based contracts and tools, particularly wallets. To mitigate this, PolkaVM implements several transparent adjustments:

- Balance queries via Ethereum RPC automatically deduct the ED, ensuring reported balances match spendable amounts.
- Account balance checks through EVM opcodes reflect the ED-adjusted balance.
- Transfers to new accounts automatically include the ED (`x + ED`), with the extra cost incorporated into transaction fees.
- Contract-to-contract transfers handle ED requirements by:
    - Drawing ED from the transaction signer instead of the sending contract.
    - Keeping transfer amounts transparent for contract logic.
    - Treating ED like other storage deposit costs.

This approach ensures that Ethereum contracts work without modifications while maintaining Polkadot's optimized state management.

## Contract Deployment

For most users deploying contracts (like ERC-20 tokens), contract deployment works seamlessly without requiring special steps. However, when using advanced patterns like factory contracts that dynamically create other contracts at runtime, you'll need to understand PolkaVM's unique deployment model.

In the PolkaVM, contract deployment follows a fundamentally different model from EVM. The EVM allows contracts to be deployed with a single transaction, where the contract code is bundled with the deployment transaction. In contrast, PolkaVM has a different process for contract instantiation.

- **Code must be pre-uploaded**: Unlike EVM, where contract code is bundled within the deploying contract, PolkaVM requires all contract bytecode to be uploaded to the chain before instantiation.
- **Factory pattern limitations**: The common EVM pattern, where contracts dynamically create other contracts, will fail with a `CodeNotFound` error unless the dependent contract code was previously uploaded.
- **Separate upload and instantiation**: This creates a two-step process where developers must first upload all contract code, then instantiate relationships between contracts.

This architecture impacts several common EVM patterns and requires developers to adapt their deployment strategies accordingly. _Factory contracts must be modified to work with pre-uploaded code rather than embedding bytecode_, and runtime code generation is not supported due to PolkaVM's RISC-V bytecode format. The specific behavior of contract creation opcodes is detailed in the [YUL IR Translation](#yul-function-translation-differences) section.

When migrating EVM projects to PolkaVM, developers should identify all contracts that will be instantiated at runtime and ensure they are pre-uploaded to the chain before any instantiation attempts.

## Solidity and YUL IR Translation Incompatibilities

While PolkaVM maintains high-level compatibility with Solidity, several low-level differences exist in the translation of YUL IR and specific Solidity constructs. These differences are particularly relevant for developers working with assembly code or utilizing advanced contract patterns.

### Contract Code Structure

PolkaVM's contract runtime does not differentiate between runtime code and deploy (constructor) code. Instead, both are emitted into a single PolkaVM contract code blob and live on-chain. Therefore, in EVM terminology, the deploy code equals the runtime code. For most standard Solidity contracts, this is transparent. However, if you are analyzing raw bytecode or building tools that expect separate deploy and runtime sections, you'll need to adjust for this unified structure.

In the constructor code, the `codesize` instruction returns the call data size instead of the actual code blob size, which differs from standard EVM behavior. Developers might consider that the constructor logic uses `codesize` to inspect the deployed contract's size (e.g., for self-validation or specific deployment patterns); this will return an incorrect value on PolkaVM. Re-evaluate such logic or use alternative methods to achieve your goal.

### Solidity-Specific Differences

Solidity constructs behave differently under PolkaVM:

- **`address.creationCode`**: Returns the bytecode keccak256 hash instead of the actual creation code, reflecting PolkaVM's hash-based code referencing system.
    - If your contract relies on `address.creationCode` to verify or interact with the full raw bytecode of a newly deployed contract, this will not work as expected. You will receive a hash, not the code itself. This typically affects highly specialized factory contracts or introspection tools.

### YUL Function Translation Differences

The following YUL functions exhibit notable behavioral differences in PolkaVM:

- Memory operations:

    - **`mload`, `mstore`, `msize`, `mcopy`**: PolkaVM preserves memory layout but implements several constraints.

        - EVM linear heap memory is emulated using a fixed 64KB byte buffer, limiting maximum contract memory usage.
        - Accessing memory offsets larger than the buffer size traps the contract with an `OutOfBound` error.
        - Compiler optimizations may eliminate unused memory operations, potentially causing `msize` to differ from EVM behavior.

        For Solidity developers, the compiler generally handles memory efficiently within this 64KB limit. However, if you are writing low-level YUL assembly and perform direct memory manipulations, you must respect the 64KB buffer limit. Attempting to access memory outside this range will cause your transaction to revert. Be aware that `msize` might not always reflect the exact EVM behavior if compiler optimizations occur.

- Call data operations:

    - **`calldataload`, `calldatacopy`**: In constructor code, the offset parameter is ignored and these functions always return `0`, diverging from EVM behavior where call data represents constructor arguments.

        - If your constructor logic in YUL assembly attempts to read constructor arguments using `calldataload` or `calldatacopy` with specific offsets, this will not yield the expected constructor arguments. Instead, these functions will return `zeroed` values. Standard Solidity constructors are handled correctly by the compiler, but manual YUL assembly for constructor argument parsing will need adjustment.

- Code operations:

    - **`codecopy`**: Only supported within constructor code, reflecting PolkaVM's different approach to code handling and the unified code blob structure.

        - If your contracts use `codecopy` (e.g., for self-modifying code or inspecting other contract's runtime bytecode) outside of the constructor, this will not be supported and will likely result in a compile-time error or runtime trap. This implies that patterns like dynamically generating or modifying contract code at runtime are not directly feasible with `codecopy` on PolkaVM.

- Control flow:

    - **`invalid`**: Traps the contract execution but does not consume remaining gas, unlike EVM where it consumes all available gas.

        - While `invalid` still reverts the transaction, the difference in gas consumption could subtly affect very specific error handling or gas accounting patterns that rely on `invalid` to consume all remaining gas. For most error scenarios, `revert()` is the standard and recommended practice.

- Cross-contract calls:

    - **`call`, `delegatecall`, `staticall`**: These functions ignore supplied gas limits and forward all remaining resources due to PolkaVM's multi-dimensional resource model. This creates important security implications:

        - Contract authors must implement reentrancy protection since gas stipends don't provide protection.
        - The compiler detects `address payable.{send,transfer}` patterns and disables call reentrancy as a protective heuristic.
        - Using `address payable.{send,transfer}` is already deprecated; PolkaVM will provide dedicated precompiles for safe balance transfers.

        The traditional EVM pattern of limiting gas in cross-contract calls (especially with the 2300 gas stipend for send/transfer) does not provide reentrancy protection on PolkaVM. Developers must explicitly implement reentrancy guards (e.g., using a reentrancy lock mutex) in their Solidity code when making external calls to untrusted contracts. Relying on gas limits alone for reentrancy prevention is unsafe and will lead to vulnerabilities on PolkaVM.

        !!! warning
            The 2300 gas stipend that is provided by solc for address payable.{send, transfer} calls offers no reentrancy protection in PolkaVM. While the compiler attempts to detect and mitigate this pattern, developers should avoid these deprecated functions.

- Contract creation:

    - **`create`, `create2`**: Contract instantiation works fundamentally differently in PolkaVM. Instead of supplying deploy code concatenated with constructor arguments, the runtime expects:

        1. A buffer containing the code hash to deploy.
        2. The constructor arguments buffer.

        PolkaVM translates `dataoffset` and `datasize` instructions to handle contract hashes instead of contract code, enabling seamless use of the `new` keyword in Solidity. However, this translation may fail for contracts creating other contracts within `assembly` blocks.

        If you use the Solidity `new` keyword to deploy contracts, the Revive compiler handles this transparently. However, if you are creating contracts manually in YUL assembly using `create` or `create2` opcodes, you must provide the code hash of the contract to be deployed, not its raw bytecode. Attempting to pass raw bytecode will fail. This fundamentally changes how manual contract creation is performed in assembly.

        !!! warning
            Avoid using `create` family opcodes for manual deployment crafting in `assembly` blocks. This pattern is discouraged due to translation complexity and offers no gas savings benefits in PolkaVM.

- Data operations:

    - **`dataoffset`**: Returns the contract hash instead of code offset, aligning with PolkaVM's hash-based code referencing.
    - **`datasize`**: Returns the constant contract hash size (32 bytes) rather than variable code size.

    These changes are primarily relevant for low-level YUL assembly developers who are trying to inspect or manipulate contract code directly. `dataoffset` will provide a hash, not a memory offset to the code, and `datasize` will always be 32 bytes (the size of a hash). This reinforces that direct manipulation of contract bytecode at runtime, as might be done in some EVM patterns, is not supported.

- Resource queries:

    - **`gas`, `gaslimit`**: Return only the `ref_time` component of PolkaVM's multi-dimensional weight system, providing the closest analog to traditional gas measurements.

        - While `gas` and `gaslimit` still provide a useful metric, consider that they represent `ref_time` (computation time) only. If your contract logic depends on precise knowledge of other resource costs (like `proof_size` or `storage_deposit`), you won't get that information from these opcodes. You'll need to use future precompiles for full multi-dimensional resource queries.

- Blockchain state:

    - **`prevrandao`, `difficulty`**: Both translate to a constant value of `2500000000000000`, as PolkaVM doesn't implement Ethereum's difficulty adjustment or randomness mechanisms.

        - If your Solidity contract relies on `block.difficulty` (or its equivalent YUL opcode `difficulty`) for randomness generation or any logic tied to Ethereum's proof-of-work difficulty, this will not provide true randomness on PolkaVM. The value will always be constant. Developers needing on-chain randomness should utilize Polkadot's native randomness sources or dedicated VRF (Verifiable Random Function) solutions if available. 

### Unsupported Operations

Several EVM operations are not supported in PolkaVM and produce compile-time errors:

- **`pc`, `extcodecopy`**: These operations are EVM-specific and have no equivalent functionality in PolkaVM's RISC-V architecture.

    - Any Solidity contracts that utilize inline assembly to interact with `pc` (program counter) or `extcodecopy` will fail to compile or behave unexpectedly. This means patterns involving introspection of the current execution location or copying external contract bytecode at runtime are not supported.

- **`blobhash`, `blobbasefee`**: Related to Ethereum's rollup model and blob data handling, these operations are unnecessary given Polkadot's superior rollup architecture.

    - If you are porting contracts designed for Ethereum's EIP-4844 (proto-danksharding) and rely on these blob-related opcodes, they will not be available on PolkaVM.

- **`extcodecopy`, `selfdestruct`**: These deprecated operations are not supported and generate compile-time errors.

    - The `selfdestruct` opcode, which allowed contracts to remove themselves from the blockchain, is not supported. Contracts cannot be self-destroyed on PolkaVM. This affects contract upgradeability patterns that rely on self-destruction and redeployment. Similarly, `extcodecopy` is unsupported, impacting contracts that intend to inspect or copy the bytecode of other deployed contracts.

### Compilation Pipeline Considerations

PolkaVM processes YUL IR exclusively, meaning all contracts exhibit behavior consistent with Solidity's `via-ir` compilation mode. Developers familiar with the legacy compilation pipeline should expect [IR-based codegen behavior](https://docs.soliditylang.org/en/latest/ir-breaking-changes.html){target=\_blank} when working with PolkaVM contracts.

If you've previously worked with older Solidity compilers that did not use the `via-ir` pipeline by default, you might observe subtle differences in compiled bytecode size or gas usage. It's recommended to familiarize yourself with Solidity's IR-based codegen behavior, as this is the standard for PolkaVM.

### Memory Pointer Limitations

YUL functions accepting memory buffer offset pointers or size arguments are limited by PolkaVM's 32-bit pointer size. Supplying values above `2^32-1` will trap the contract immediately. The Solidity compiler typically generates valid memory references, making this primarily a concern for low-level assembly code.

For standard Solidity development, this limitation is unlikely to be hit as the compiler handles memory addresses correctly within typical contract sizes. However, if you are writing extremely large contracts using YUL assembly that manually and extensively manipulate memory addresses, ensure that your memory offsets and sizes do not exceed PolkaVM's **fixed 64KB memory limit per contract**. While the YUL functions might accept 32-bit pointers (up to 2^32-1), attempting to access memory beyond the allocated 64KB buffer will trap the contract immediately.

These incompatibilities reflect the fundamental architectural differences between EVM and PolkaVM while maintaining high-level Solidity compatibility. Most developers using standard Solidity patterns will encounter no issues, but those working with assembly code or advanced contract patterns should carefully review these differences during migration.


---

Page Title: Fork a Chain with Chopsticks

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/tutorials-polkadot-sdk-testing-fork-live-chains.md
- Canonical (HTML): https://docs.polkadot.com/tutorials/polkadot-sdk/testing/fork-live-chains/
- Summary: Learn how to fork live Polkadot SDK chains with Chopsticks. Configure forks, replay blocks, test XCM, and interact programmatically or via UI.

# Fork a Chain with Chopsticks

## Introduction

Chopsticks is an innovative tool that simplifies the process of forking live Polkadot SDK chains. This guide provides step-by-step instructions to configure and fork chains, enabling developers to:

- Replay blocks for state analysis.
- Test cross-chain messaging (XCM).
- Simulate blockchain environments for debugging and experimentation.

With support for both configuration files and CLI commands, Chopsticks offers flexibility for diverse development workflows. Whether you're testing locally or exploring complex blockchain scenarios, Chopsticks empowers developers to gain deeper insights and accelerate application development.

Chopsticks uses the [Smoldot](https://github.com/smol-dot/smoldot){target=\_blank} light client, which does not support calls made through the Ethereum JSON-RPC. As a result, you can't fork your chain using Chopsticks and then interact with it using tools like MetaMask.

For additional support and information, please reach out through [GitHub Issues](https://github.com/AcalaNetwork/chopsticks/issues){target=\_blank}.

## Prerequisites

To follow this tutorial, ensure you have completed the following:

- **Installed Chopsticks**: If you still need to do so, see the [Install Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} guide for assistance.
- **Reviewed** [Configure Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#configure-chopsticks){target=\_blank}: And understand how forked chains are configured.

## Configuration File 

To run Chopsticks using a configuration file, utilize the `--config` flag. You can use a raw GitHub URL, a path to a local file, or simply the chain's name. The following commands all look different but they use the `polkadot` configuration in the same way:

=== "GitHub URL"

    ```bash
    npx @acala-network/chopsticks \
    --config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml
    ```

=== "Local File Path"

    ```bash
    npx @acala-network/chopsticks --config=configs/polkadot.yml
    ```

=== "Chain Name"

    ```bash
    npx @acala-network/chopsticks --config=polkadot
    ```

Regardless of which method you choose from the preceding examples, you'll see an output similar to the following:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx @acala-network/chopsticks --config=polkadot</span>
  <br />
  <span data-ty>[18:38:26.155] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty> chopsticks::executor TRACE: Calling Metadata_metadata</span>
  <span data-ty> chopsticks::executor TRACE: Completed Metadata_metadata</span>
  <span data-ty>[18:38:28.186] INFO: Polkadot RPC listening on port 8000</span>
  <span data-ty> app: "chopsticks"</span>
</div>

If using a file path, make sure you've downloaded the [Polkadot configuration file](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot.yml){target=\_blank}, or have created your own.

## Create a Fork

Once you've configured Chopsticks, use the following command to fork Polkadot at block 100:

```bash
npx @acala-network/chopsticks \
--endpoint wss://polkadot-rpc.dwellir.com \
--block 100
```

If the fork is successful, you will see output similar to the following:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx @acala-network/chopsticks \ --endpoint wss://polkadot-rpc.dwellir.com \ --block 100</span>
  <br />
  <span data-ty>[19:12:21.023] INFO: Polkadot RPC listening on port 8000</span>
  <span data-ty> app: "chopsticks"</span>
</div>

Access the running Chopsticks fork using the default address.

```bash
ws://localhost:8000
```

## Interact with a Fork

You can interact with the forked chain using various [libraries](/develop/toolkit/#libraries){target=\_blank} such as [Polkadot.js](https://polkadot.js.org/docs/){target=\_blank} and its user interface, [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Use Polkadot.js Apps

To interact with Chopsticks via the hosted user interface, visit [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} and follow these steps:

1. Select the network icon in the top left corner.

    ![](/images/tutorials/polkadot-sdk/testing/fork-live-chains/chopsticks-1.webp)

2. Scroll to the bottom and select **Development**.
3. Choose **Custom**.
4. Enter `ws://localhost:8000` in the input field.
5. Select the **Switch** button.

    ![](/images/tutorials/polkadot-sdk/testing/fork-live-chains/chopsticks-2.webp)

You should now be connected to your local fork and can interact with it as you would with a real chain.

### Use Polkadot.js Library

For programmatic interaction, you can use the Polkadot.js library. The following is a basic example:

```js
import { ApiPromise, WsProvider } from '@polkadot/api';

async function connectToFork() {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;

  // Now you can use 'api' to interact with your fork
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
}

connectToFork();

```

## Replay Blocks

Chopsticks allows you to replay specific blocks from a chain, which is useful for debugging and analyzing state changes. You can use the parameters in the [Configuration](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#configure-chopsticks){target=\_blank} section to set up the chain configuration, and then use the run-block subcommand with the following additional options:

- **`output-path`**: Path to print output.
- **`html`**: Generate HTML with storage diff.
- **`open`**: Open generated HTML.

For example, the command to replay block 1000 from Polkadot and save the output to a JSON file would be as follows:

```bash
npx @acala-network/chopsticks run-block  \
--endpoint wss://polkadot-rpc.dwellir.com  \
--output-path ./polkadot-output.json  \
--block 1000
```

??? code "polkadot-output.json"

    ```json
    {
        "Call": {
            "result": "0xba754e7478944d07a1f7e914422b4d973b0855abeb6f81138fdca35beb474b44a10f6fc59a4d90c3b78e38fac100fc6adc6f9e69a07565ec8abce6165bd0d24078cc7bf34f450a2cc7faacc1fa1e244b959f0ed65437f44208876e1e5eefbf8dd34c040642414245b501030100000083e2cc0f00000000d889565422338aa58c0fd8ebac32234149c7ce1f22ac2447a02ef059b58d4430ca96ba18fbf27d06fe92ec86d8b348ef42f6d34435c791b952018d0a82cae40decfe5faf56203d88fdedee7b25f04b63f41f23da88c76c876db5c264dad2f70c",
            "storageDiff": [
                [
                    "0x0b76934f4cc08dee01012d059e1b83eebbd108c4899964f707fdaffb82636065",
                    "0x00"
                ],
                [
                    "0x1cb6f36e027abb2091cfb5110ab5087f0323475657e0890fbdbf66fb24b4649e",
                    null
                ],
                [
                    "0x1cb6f36e027abb2091cfb5110ab5087f06155b3cd9a8c9e5e9a23fd5dc13a5ed",
                    "0x83e2cc0f00000000"
                ],
                [
                    "0x1cb6f36e027abb2091cfb5110ab5087ffa92de910a7ce2bd58e99729c69727c1",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef702a5c1b19ab7a04f536c519aca4983ac",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef70a98fdbe9ce6c55837576c60c7af3850",
                    "0x02000000"
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef734abf5cb34d6244378cddbf18e849d96",
                    "0xc03b86ae010000000000000000000000"
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7",
                    "0x080000000000000080e36a09000000000200000001000000000000ca9a3b00000000020000"
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef78a42f33323cb5ced3b44dd825fda9fcc",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef799e7f93fc6a98f0874fd057f111c4d2d",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7a44704b568d21667356a5a050c118746d366e7fe86e06375e7030000",
                    "0xba754e7478944d07a1f7e914422b4d973b0855abeb6f81138fdca35beb474b44"
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7a86da5a932684f199539836fcb8c886f",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7b06c3320c6ac196d813442e270868d63",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7bdc0bd303e9855813aa8a30d4efc5112",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7df1daeb8986837f21cc5d17596bb78d15153cb1f00942ff401000000",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7df1daeb8986837f21cc5d17596bb78d1b4def25cfda6ef3a00000000",
                    null
                ],
                [
                    "0x26aa394eea5630e07c48ae0c9558cef7ff553b5a9862a516939d82b3d3d8661a",
                    null
                ],
                [
                    "0x2b06af9719ac64d755623cda8ddd9b94b1c371ded9e9c565e89ba783c4d5f5f9b4def25cfda6ef3a000000006f3d6b177c8acbd8dc9974cdb3cebfac4d31333c30865ff66c35c1bf898df5c5dd2924d3280e7201",
                    "0x9b000000"
                ],
                ["0x3a65787472696e7369635f696e646578", null],
                [
                    "0x3f1467a096bcd71a5b6a0c8155e208103f2edf3bdf381debe331ab7446addfdc",
                    "0x550057381efedcffffffffffffffffff"
                ],
                [
                    "0x3fba98689ebed1138735e0e7a5a790ab0f41321f75df7ea5127be2db4983c8b2",
                    "0x00"
                ],
                [
                    "0x3fba98689ebed1138735e0e7a5a790ab21a5051453bd3ae7ed269190f4653f3b",
                    "0x080000"
                ],
                [
                    "0x3fba98689ebed1138735e0e7a5a790abb984cfb497221deefcefb70073dcaac1",
                    "0x00"
                ],
                [
                    "0x5f3e4907f716ac89b6347d15ececedca80cc6574281671b299c1727d7ac68cabb4def25cfda6ef3a00000000",
                    "0x204e0000183887050ecff59f58658b3df63a16d03a00f92890f1517f48c2f6ccd215e5450e380e00005809fd84af6483070acbb92378e3498dbc02fb47f8e97f006bb83f60d7b2b15d980d000082104c22c383925323bf209d771dec6e1388285abe22c22d50de968467e0bb6ce00b000088ee494d719d68a18aade04903839ea37b6be99552ceceb530674b237afa9166480d0000dc9974cdb3cebfac4d31333c30865ff66c35c1bf898df5c5dd2924d3280e72011c0c0000e240d12c7ad07bb0e7785ee6837095ddeebb7aef84d6ed7ea87da197805b343a0c0d0000"
                ],
                [
                    "0xae394d879ddf7f99595bc0dd36e355b5bbd108c4899964f707fdaffb82636065",
                    null
                ],
                [
                    "0xbd2a529379475088d3e29a918cd478721a39ec767bd5269111e6492a1675702a",
                    "0x4501407565175cfbb5dca18a71e2433f838a3d946ef532c7bff041685db1a7c13d74252fffe343a960ef84b15187ea0276687d8cb3168aeea5202ea6d651cb646517102b81ff629ee6122430db98f2cadf09db7f298b49589b265dae833900f24baa8fb358d87e12f3e9f7986a9bf920c2fb48ce29886199646d2d12c6472952519463e80b411adef7e422a1595f1c1af4b5dd9b30996fba31fa6a30bd94d2022d6b35c8bc5a8a51161d47980bf4873e01d15afc364f8939a6ce5a09454ab7f2dd53bf4ee59f2c418e85aa6eb764ad218d0097fb656900c3bdd859771858f87bf7f06fc9b6db154e65d50d28e8b2374898f4f519517cd0bedc05814e0f5297dc04beb307b296a93cc14d53afb122769dfd402166568d8912a4dff9c2b1d4b6b34d811b40e5f3763e5f3ab5cd1da60d75c0ff3c12bcef3639f5f792a85709a29b752ffd1233c2ccae88ed3364843e2fa92bdb49021ee36b36c7cdc91b3e9ad32b9216082b6a2728fccd191a5cd43896f7e98460859ca59afbf7c7d93cd48da96866f983f5ff8e9ace6f47ee3e6c6edb074f578efbfb0907673ebca82a7e1805bc5c01cd2fa5a563777feeb84181654b7b738847c8e48d4f575c435ad798aec01631e03cf30fe94016752b5f087f05adf1713910767b7b0e6521013be5370776471191641c282fdfe7b7ccf3b2b100a83085cd3af2b0ad4ab3479448e71fc44ff987ec3a26be48161974b507fb3bc8ad23838f2d0c54c9685de67dc6256e71e739e9802d0e6e3b456f6dca75600bc04a19b3cc1605784f46595bfb10d5e077ce9602ae3820436166aa1905a7686b31a32d6809686462bc9591c0bc82d9e49825e5c68352d76f1ac6e527d8ac02db3213815080afad4c2ecb95b0386e3e9ab13d4f538771dac70d3059bd75a33d0b9b581ec33bb16d0e944355d4718daccb35553012adfcdacb1c5200a2aec3756f6ad5a2beffd30018c439c1b0c4c0f86dbf19d0ad59b1c9efb7fe90906febdb9001af1e7e15101089c1ab648b199a40794d30fe387894db25e614b23e833291a604d07eec2ade461b9b139d51f9b7e88475f16d6d23de6fe7831cc1dbba0da5efb22e3b26cd2732f45a2f9a5d52b6d6eaa38782357d9ae374132d647ef60816d5c98e6959f8858cfa674c8b0d340a8f607a68398a91b3a965585cc91e46d600b1310b8f59c65b7c19e9d14864a83c4ad6fa4ba1f75bba754e7478944d07a1f7e914422b4d973b0855abeb6f81138fdca35beb474b44c7736fc3ab2969878810153aa3c93fc08c99c478ed1bb57f647d3eb02f25cee122c70424643f4b106a7643acaa630a5c4ac39364c3cb14453055170c01b44e8b1ef007c7727494411958932ae8b3e0f80d67eec8e94dd2ff7bbe8c9e51ba7e27d50bd9f52cbaf9742edecb6c8af1aaf3e7c31542f7d946b52e0c37d194b3dd13c3fddd39db0749755c7044b3db1143a027ad428345d930afcefc0d03c3a0217147900bdea1f5830d826f7e75ecd1c4e2bc8fd7de3b35c6409acae1b2215e9e4fd7e360d6825dc712cbf9d87ae0fd4b349b624d19254e74331d66a39657da81e73d7b13adc1e5efa8efd65aa32c1a0a0315913166a590ae551c395c476116156cf9d872fd863893edb41774f33438161f9b973e3043f819d087ba18a0f1965e189012496b691f342f7618fa9db74e8089d4486c8bd1993efd30ff119976f5cc0558e29b417115f60fd8897e13b6de1a48fbeee38ed812fd267ae25bffea0caa71c09309899b34235676d5573a8c3cf994a3d7f0a5dbd57ab614c6caf2afa2e1a860c6307d6d9341884f1b16ef22945863335bb4af56e5ef5e239a55dbd449a4d4d3555c8a3ec5bd3260f88cabca88385fe57920d2d2dfc5d70812a8934af5691da5b91206e29df60065a94a0a8178d118f1f7baf768d934337f570f5ec68427506391f51ab4802c666cc1749a84b5773b948fcbe460534ed0e8d48a15c149d27d67deb8ea637c4cc28240ee829c386366a0b1d6a275763100da95374e46528a0adefd4510c38c77871e66aeda6b6bfd629d32af9b2fad36d392a1de23a683b7afd13d1e3d45dad97c740106a71ee308d8d0f94f6771164158c6cd3715e72ccfbc49a9cc49f21ead8a3c5795d64e95c15348c6bf8571478650192e52e96dd58f95ec2c0fb4f2ccc05b0ab749197db8d6d1c6de07d6e8cb2620d5c308881d1059b50ffef3947c273eaed7e56c73848e0809c4bd93619edd9fd08c8c5c88d5f230a55d2c6a354e5dd94440e7b5bf99326cf4a112fe843e7efdea56e97af845761d98f40ed2447bd04a424976fcf0fe0a0c72b97619f85cf431fe4c3aa6b3a4f61df8bc1179c11e77783bfedb7d374bd1668d0969333cb518bd20add8329462f2c9a9f04d150d60413fdd27271586405fd85048481fc2ae25b6826cb2c947e4231dc7b9a0d02a9a03f88460bced3fef5d78f732684bd218a1954a4acfc237d79ccf397913ab6864cd8a07e275b82a8a72520624738368d1c5f7e0eaa2b445cf6159f2081d3483618f7fc7b16ec4e6e4d67ab5541bcda0ca1af40efd77ef8653e223191448631a8108c5e50e340cd405767ecf932c1015aa8856b834143dc81fa0e8b9d1d8c32278fca390f2ff08181df0b74e2d13c9b7b1d85543416a0dae3a77530b9cd1366213fcf3cd12a9cd3ae0a006d6b29b5ffc5cdc1ab24343e2ab882abfd719892fca5bf2134731332c5d3bef6c6e4013d84a853cb03d972146b655f0f8541bcd36c3c0c8a775bb606edfe50d07a5047fd0fe01eb125e83673930bc89e91609fd6dfe97132679374d3de4a0b3db8d3f76f31bed53e247da591401d508d65f9ee01d3511ee70e3644f3ab5d333ca7dbf737fe75217b4582d50d98b5d59098ea11627b7ed3e3e6ee3012eadd326cf74ec77192e98619427eb0591e949bf314db0fb932ed8be58258fb4f08e0ccd2cd18b997fb5cf50c90d5df66a9f3bb203bd22061956128b800e0157528d45c7f7208c65d0592ad846a711fa3c5601d81bb318a45cc1313b122d4361a7d7a954645b04667ff3f81d3366109772a41f66ece09eb93130abe04f2a51bb30e767dd37ec6ee6a342a4969b8b342f841193f4f6a9f0fac4611bc31b6cab1d25262feb31db0b8889b6f8d78be23f033994f2d3e18e00f3b0218101e1a7082782aa3680efc8502e1536c30c8c336b06ae936e2bcf9bbfb20dd514ed2867c03d4f44954867c97db35677d30760f37622b85089cc5d182a89e29ab0c6b9ef18138b16ab91d59c2312884172afa4874e6989172014168d3ed8db3d9522d6cbd631d581d166787c93209bec845d112e0cbd825f6df8b64363411270921837cfb2f9e7f2e74cdb9cd0d2b02058e5efd9583e2651239654b887ea36ce9537c392fc5dfca8c5a0facbe95b87dfc4232f229bd12e67937d32b7ffae2e837687d2d292c08ff6194a2256b17254748857c7e3c871c3fff380115e6f7faf435a430edf9f8a589f6711720cfc5cec6c8d0d94886a39bb9ac6c50b2e8ef6cf860415192ca4c1c3aaa97d36394021a62164d5a63975bcd84b8e6d74f361c17101e3808b4d8c31d1ee1a5cf3a2feda1ca2c0fd5a50edc9d95e09fb5158c9f9b0eb5e2c90a47deb0459cea593201ae7597e2e9245aa5848680f546256f3"
                ],
                [
                    "0xd57bce545fb382c34570e5dfbf338f5e326d21bc67a4b34023d577585d72bfd7",
                    null
                ],
                [
                    "0xd57bce545fb382c34570e5dfbf338f5ea36180b5cfb9f6541f8849df92a6ec93",
                    "0x00"
                ],
                [
                    "0xd57bce545fb382c34570e5dfbf338f5ebddf84c5eb23e6f53af725880d8ffe90",
                    null
                ],
                [
                    "0xd5c41b52a371aa36c9254ce34324f2a53b996bb988ea8ee15bad3ffd2f68dbda",
                    "0x00"
                ],
                [
                    "0xf0c365c3cf59d671eb72da0e7a4113c49f1f0515f462cdcf84e0f1d6045dfcbb",
                    "0x50defc5172010000"
                ],
                [
                    "0xf0c365c3cf59d671eb72da0e7a4113c4bbd108c4899964f707fdaffb82636065",
                    null
                ],
                [
                    "0xf68f425cf5645aacb2ae59b51baed90420d49a14a763e1cbc887acd097f92014",
                    "0x9501800300008203000082030000840300008503000086030000870300008703000089030000890300008b0300008b0300008d0300008d0300008f0300008f0300009103000092030000920300009403000094030000960300009603000098030000990300009a0300009b0300009b0300009d0300009d0300009f0300009f030000a1030000a2030000a3030000a4030000a5030000a6030000a6030000a8030000a8030000aa030000ab030000ac030000ad030000ae030000af030000b0030000b1030000b1030000b3030000b3030000b5030000b6030000b7030000b8030000b9030000ba030000ba030000bc030000bc030000be030000be030000c0030000c1030000c2030000c2030000c4030000c5030000c5030000c7030000c7030000c9030000c9030000cb030000cc030000cd030000ce030000cf030000d0030000d0030000d2030000d2030000d4030000d4030000d6030000d7030000d8030000d9030000da030000db030000db030000dd030000dd030000df030000e0030000e1030000e2030000e3030000e4030000e4030000"
                ],
                [
                    "0xf68f425cf5645aacb2ae59b51baed9049b58374218f48eaf5bc23b7b3e7cf08a",
                    "0xb3030000"
                ],
                [
                    "0xf68f425cf5645aacb2ae59b51baed904b97380ce5f4e70fbf9d6b5866eb59527",
                    "0x9501800300008203000082030000840300008503000086030000870300008703000089030000890300008b0300008b0300008d0300008d0300008f0300008f0300009103000092030000920300009403000094030000960300009603000098030000990300009a0300009b0300009b0300009d0300009d0300009f0300009f030000a1030000a2030000a3030000a4030000a5030000a6030000a6030000a8030000a8030000aa030000ab030000ac030000ad030000ae030000af030000b0030000b1030000b1030000b3030000b3030000b5030000b6030000b7030000b8030000b9030000ba030000ba030000bc030000bc030000be030000be030000c0030000c1030000c2030000c2030000c4030000c5030000c5030000c7030000c7030000c9030000c9030000cb030000cc030000cd030000ce030000cf030000d0030000d0030000d2030000d2030000d4030000d4030000d6030000d7030000d8030000d9030000da030000db030000db030000dd030000dd030000df030000e0030000e1030000e2030000e3030000e4030000e4030000"
                ]
            ],
            "offchainStorageDiff": [],
            "runtimeLogs": []
        }
    }

    ```

## XCM Testing

To test XCM (Cross-Consensus Messaging) messages between networks, you can fork multiple parachains and a relay chain locally using Chopsticks.

- **`relaychain`**: Relay chain config file.
- **`parachain`**: Parachain config file.

For example, to fork Moonbeam, Astar, and Polkadot enabling XCM between them, you can use the following command:

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p moonbeam \
--p astar
```

After running it, you should see output similar to the following:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx @acala-network/chopsticks xcm \</span>
  <span data-ty>--r polkadot \</span>
  <span data-ty>--p moonbeam \</span>
  <span data-ty>--p astar</span>
  <br />
  <span data-ty>[13:46:07.901] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/moonbeam.yml</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:12.631] INFO: Moonbeam RPC listening on port 8000</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:12.632] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/astar.yml</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty> chopsticks::executor TRACE: Calling Metadata_metadata</span>
  <span data-ty> chopsticks::executor TRACE: Completed Metadata_metadata</span>
  <span data-ty>[13:46:23.669] INFO: Astar RPC listening on port 8001</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:25.144] INFO (xcm): Connected parachains [2004,2006]</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:25.144] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty> chopsticks::executor TRACE: Calling Metadata_metadata</span>
  <span data-ty> chopsticks::executor TRACE: Completed Metadata_metadata</span>
  <span data-ty>[13:46:53.320] INFO: Polkadot RPC listening on port 8002</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:54.038] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Moonbeam'</span>
  <span data-ty> app: "chopsticks"</span>
  <span data-ty>[13:46:55.028] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Astar'</span>
  <span data-ty> app: "chopsticks"</span>
</div>

Now you can interact with your forked chains using the ports specified in the output.


---

Page Title: General Management

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-operational-tasks-general-management.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/operational-tasks/general-management/
- Summary: Optimize your Polkadot validator setup with advanced configuration techniques. Learn how to boost performance, enhance security, and ensure seamless operations.

# General Management

## Introduction

Validator performance is pivotal in maintaining the security and stability of the Polkadot network. As a validator, optimizing your setup ensures efficient transaction processing, minimizes latency, and maintains system reliability during high-demand periods. Proper configuration and proactive monitoring also help mitigate risks like slashing and service interruptions.

This guide covers essential practices for managing a validator, including performance tuning techniques, security hardening, and tools for real-time monitoring. Whether you're fine-tuning CPU settings, configuring NUMA balancing, or setting up a robust alert system, these steps will help you build a resilient and efficient validator operation.

## Configuration Optimization

For those seeking to optimize their validator's performance, the following configurations can improve responsiveness, reduce latency, and ensure consistent performance during high-demand periods.

### Deactivate Simultaneous Multithreading

Polkadot validators operate primarily in single-threaded mode for critical tasks, so optimizing single-core CPU performance can reduce latency and improve stability. Deactivating simultaneous multithreading (SMT) can prevent virtual cores from affecting performance. SMT is called Hyper-Threading on Intel and 2-way SMT on AMD Zen.

Take the following steps to deactivate every other (vCPU) core:

1. Loop though all the CPU cores and deactivate the virtual cores associated with them:

    ```bash
    for cpunum in $(cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list | \
    cut -s -d, -f2- | tr ',' '\n' | sort -un)
    do
    echo 0 > /sys/devices/system/cpu/cpu$cpunum/online
    done
    ```

2. To permanently save the changes, add `nosmt=force` to the `GRUB_CMDLINE_LINUX_DEFAULT` variable in `/etc/default/grub`:

    ```bash
    sudo nano /etc/default/grub
    # Add to GRUB_CMDLINE_LINUX_DEFAULT
    ```

    ```config title="/etc/default/grub"
    GRUB_DEFAULT = 0;
    GRUB_HIDDEN_TIMEOUT = 0;
    GRUB_HIDDEN_TIMEOUT_QUIET = true;
    GRUB_TIMEOUT = 10;
    GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
    GRUB_CMDLINE_LINUX_DEFAULT = 'nosmt=force';
    GRUB_CMDLINE_LINUX = '';
    ```

3. Update GRUB to apply changes:

    ```bash
    sudo update-grub
    ```

4. After the reboot, you should see that half of the cores are offline. To confirm, run:

    ```bash
    lscpu --extended
    ```

### Deactivate Automatic NUMA Balancing

Deactivating NUMA (Non-Uniform Memory Access) balancing for multi-CPU setups helps keep processes on the same CPU node, minimizing latency.

Follow these stpes:

1. Deactivate NUMA balancing in runtime:

    ```bash
    sysctl kernel.numa_balancing=0
    ```

2. Deactivate NUMA balancing permanently by adding `numa_balancing=disable` to the GRUB settings:

    ```bash
    sudo nano /etc/default/grub
    # Add to GRUB_CMDLINE_LINUX_DEFAULT
    ```

    ```config title="/etc/default/grub"
    GRUB_DEFAULT = 0;
    GRUB_HIDDEN_TIMEOUT = 0;
    GRUB_HIDDEN_TIMEOUT_QUIET = true;
    GRUB_TIMEOUT = 10;
    GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
    GRUB_CMDLINE_LINUX_DEFAULT = 'numa_balancing=disable';
    GRUB_CMDLINE_LINUX = '';
    ```

3. Update GRUB to apply changes:

    ```bash
    sudo update-grub
    ```

4. Confirm the deactivation:

    ```bash
    sysctl -a | grep 'kernel.numa_balancing'
    ```

If you successfully deactivated NUMA balancing, the preceding command should return `0`.

### Spectre and Meltdown Mitigations

[Spectre](https://en.wikipedia.org/wiki/Spectre_(security_vulnerability)){target=\_blank} and [Meltdown](https://en.wikipedia.org/wiki/Meltdown_(security_vulnerability)){target=\_blank} are well-known CPU vulnerabilities that exploit speculative execution to access sensitive data. These vulnerabilities have been patched in recent Linux kernels, but the mitigations can slightly impact performance, especially in high-throughput or containerized environments.

If your security requirements allow it, you can deactivate specific mitigations, such as Spectre V2 and Speculative Store Bypass Disable (SSBD), to improve performance.

To selectively deactivate the Spectre mitigations, take these steps:

1. Update the `GRUB_CMDLINE_LINUX_DEFAULT` variable in your `/etc/default/grub` configuration:

    ```bash
    sudo nano /etc/default/grub
    # Add to GRUB_CMDLINE_LINUX_DEFAULT
    ```

    ```config title="/etc/default/grub"
    GRUB_DEFAULT = 0;
    GRUB_HIDDEN_TIMEOUT = 0;
    GRUB_HIDDEN_TIMEOUT_QUIET = true;
    GRUB_TIMEOUT = 10;
    GRUB_DISTRIBUTOR = `lsb_release -i -s 2> /dev/null || echo Debian`;
    GRUB_CMDLINE_LINUX_DEFAULT =
      'spec_store_bypass_disable=prctl spectre_v2_user=prctl';
    ```

2. Update GRUB to apply changes and then reboot:

    ```bash
    sudo update-grub
    sudo reboot
    ```

This approach selectively deactivates the Spectre V2 and Spectre V4 mitigations, leaving other protections intact. For full security, keep mitigations activated unless there's a significant performance need, as disabling them could expose the system to potential attacks on affected CPUs.

## Monitor Your Node

Monitoring your node's performance is critical for network reliability and security. Tools like the following provide valuable insights:

- **[Prometheus](https://prometheus.io/){target=\_blank}**: An open-source monitoring toolkit for collecting and querying time-series data.
- **[Grafana](https://grafana.com/){target=\_blank}**: A visualization tool for real-time metrics, providing interactive dashboards.
- **[Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/){target=\_blank}**: A tool for managing and routing alerts based on Prometheus data.

This section covers setting up these tools and configuring alerts to notify you of potential issues.

### Environment Setup

Before installing Prometheus, ensure the environment is set up securely by running Prometheus with restricted user privileges.

Follow these steps:

1. Create a Prometheus user to ensure Prometheus runs with minimal permissions:

    ```bash
    sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus
    ```

2. Create directories for configuration and data storage:

    ```bash
    sudo mkdir /etc/prometheus
    sudo mkdir /var/lib/prometheus
    ```
  
3. Change directory ownership to ensure Prometheus has access:

    ```bash
    sudo chown -R prometheus:prometheus /etc/prometheus
    sudo chown -R prometheus:prometheus /var/lib/prometheus
    ```

### Install and Configure Prometheus

After setting up the environment, install and configure the latest version of Prometheus as follows:

1. Download Prometheus for your system architecture from the [releases page](https://github.com/prometheus/prometheus/releases/){target=\_blank}. Replace `INSERT_RELEASE_DOWNLOAD` with the release binary URL (e.g., `https://github.com/prometheus/prometheus/releases/download/v3.0.0/prometheus-3.0.0.linux-amd64.tar.gz`):

    ```bash
    sudo apt-get update && sudo apt-get upgrade
    wget INSERT_RELEASE_DOWNLOAD_LINK
    tar xfz prometheus-*.tar.gz
    cd prometheus-3.0.0.linux-amd64
    ```

2. Set up Prometheus:

    1. Copy binaries:

        ```bash
        sudo cp ./prometheus /usr/local/bin/
        sudo cp ./promtool /usr/local/bin/
        sudo cp ./prometheus /usr/local/bin/
        ```

    2. Copy directories and assign ownership of these files to the `prometheus` user:

        ```bash
        sudo cp -r ./consoles /etc/prometheus
        sudo cp -r ./console_libraries /etc/prometheus
        sudo chown -R prometheus:prometheus /etc/prometheus/consoles
        sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
        ```

    3. Clean up the download directory:

        ```bash
        cd .. && rm -r prometheus*
        ```

3. Create `prometheus.yml` to define global settings, rule files, and scrape targets:

    ```bash
    sudo nano /etc/prometheus/prometheus.yml
    ```

    {% raw %}
    ```yaml title="prometheus-config.yml"
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      # - "first.rules"
      # - "second.rules"

    scrape_configs:
      - job_name: 'prometheus'
        scrape_interval: 5s
        static_configs:
          - targets: ['localhost:9090']
      - job_name: 'substrate_node'
        scrape_interval: 5s
        static_configs:
          - targets: ['localhost:9615']
    ```
    {% endraw %}

    Prometheus is scraped every 5 seconds in this example configuration file, ensuring detailed internal metrics. Node metrics with customizable intervals are scraped from port `9615` by default.

4. Verify the configuration with `promtool`, an open source monitoring tool:

    ```bash
    promtool check config /etc/prometheus/prometheus.yml
    ```

5. Save the configuration and change the ownership of the file to `prometheus` user:

    ```bash
    sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml
    ```

### Start Prometheus

1. Launch Prometheus with the appropriate configuration file, storage location, and necessary web resources, running it with restricted privileges for security:

    ```bash
    sudo -u prometheus /usr/local/bin/prometheus --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries
    ```

    If you set the server up properly, you should see terminal output similar to the following:

    
2. Verify you can access the Prometheus interface by navigating to:

    ```text
    http://SERVER_IP_ADDRESS:9090/graph
    ```

    If the interface appears to work as expected, exit the process using `Control + C`.

3. Create a systemd service file to ensure Prometheus starts on boot:

    ```bash
    sudo nano /etc/systemd/system/prometheus.service
    ```

    ```bash title="prometheus.service"
    [Unit]
    Description=Prometheus Monitoring
    Wants=network-online.target
    After=network-online.target

    [Service]
    User=prometheus
    Group=prometheus
    Type=simple
    ExecStart=/usr/local/bin/prometheus \
     --config.file /etc/prometheus/prometheus.yml \
     --storage.tsdb.path /var/lib/prometheus/ \
     --web.console.templates=/etc/prometheus/consoles \
     --web.console.libraries=/etc/prometheus/console_libraries
    ExecReload=/bin/kill -HUP $MAINPID

    [Install]
    WantedBy=multi-user.target

    ```

4. Reload systemd and enable the service to start on boot:

    ```bash
    sudo systemctl daemon-reload && sudo systemctl enable prometheus && sudo systemctl start prometheus
    ```

5. Verify the service is running by visiting the Prometheus interface again at:

    ```text
    http://SERVER_IP_ADDRESS:9090/
    ```

### Install and Configure Grafana

This guide follows [Grafana's canonical installation instructions](https://grafana.com/docs/grafana/latest/setup-grafana/installation/debian/#install-from-apt-repository){target=\_blank}.

To install and configure Grafana, follow these steps:

1. Install Grafana prerequisites:

    ```bash
    sudo apt-get install -y apt-transport-https software-properties-common wget    
    ```

2. Import the [GPG key](https://gnupg.org/){target=\_blank}:

    ```bash
    sudo mkdir -p /etc/apt/keyrings/
    wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
    ```

3. Configure the stable release repo and update packages:

    ```bash
    echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
    sudo apt-get update
    ```

4. Install the latest stable version of Grafana:

    ```bash
    sudo apt-get install grafana
    ```

To configure Grafana, take these steps:

1. Configure Grafana to start automatically on boot and start the service:

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable grafana-server.service
    sudo systemctl start grafana-server
    ```

2. Check if Grafana is running:

    ```bash
    sudo systemctl status grafana-server
    ```

    If necessary, you can stop or restart the service with the following commands:

    ```bash
    sudo systemctl stop grafana-server
    sudo systemctl restart grafana-server
    ```

3. Access Grafana by navigating to the following URL and logging in with the default username and password (`admin`):

    ```text
    http://SERVER_IP_ADDRESS:3000/login
    ```

    !!! tip "Change default port"
        To change Grafana's port, edit `/usr/share/grafana/conf/defaults.ini`:

        ```bash
        sudo vim /usr/share/grafana/conf/defaults.ini
        ```

        Modify the `http_port` value, then restart Grafana:

        ```bash
        sudo systemctl restart grafana-server
        ```

![Grafana login screen](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-1.webp)

To visualize node metrics, follow these steps:

1. Select the gear icon to access **Data Sources** settings.
2. Select **Add data source** to define the data source.

    ![Select Prometheus](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-2.webp)

3. Select **Prometheus**.

    ![Save and test](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-3.webp)

4. Enter `http://localhost:9090` in the **URL** field and click **Save & Test**. If **"Data source is working"** appears, your connection is configured correctly.

    ![Import dashboard](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-4.webp)

5. Select **Import** from the left menu, choose **Prometheus** from the dropdown, and click **Import**.

6. Start your Polkadot node by running `./polkadot`. You should now be able to monitor node performance, block height, network traffic, and tasks tasks on the Grafana dashboard.

    ![Live dashboard](/images/infrastructure/running-a-validator/operational-tasks/general-management/general-management-5.webp)

The [Grafana dashboards](https://grafana.com/grafana/dashboards){target=\_blank} page features user created dashboards made available for public use. For an example, see the [Substrate Node Metrics](https://grafana.com/grafana/dashboards/21715-substrate-node-metrics/){target=\_blank} dashboard.

### Install and Configure Alertmanager

[Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/){target=\_blank} is an optional component that complements Prometheus by managing alerts and notifying users about potential issues.

Follow these steps to install and configure Alertmanager:

1. Download Alertmanager for your system architecture from the [releases page](https://github.com/prometheus/alertmanager/releases){target=\_blank}. Replace `INSERT_RELEASE_DOWNLOAD` with the release binary URL (e.g., `https://github.com/prometheus/alertmanager/releases/download/v0.28.0-rc.0/alertmanager-0.28.0-rc.0.linux-amd64.tar.gz`):

    ```bash
    wget INSERT_RELEASE_DOWNLOAD_LINK
    tar -xvzf alertmanager*
    ```

2. Copy the binaries to the system directory and set permissions:

    ```bash
    cd alertmanager-0.28.0-rc.0.linux-amd64
    sudo cp ./alertmanager /usr/local/bin/
    sudo cp ./amtool /usr/local/bin/
    sudo chown prometheus:prometheus /usr/local/bin/alertmanager
    sudo chown prometheus:prometheus /usr/local/bin/amtool
    ```

3. Create the `alertmanager.yml` configuration file under `/etc/alertmanager`:

    ```bash
    sudo mkdir /etc/alertmanager
    sudo nano /etc/alertmanager/alertmanager.yml
    ```

    Generate an [app password in your Google account](https://support.google.com/accounts/answer/185833?hl=en){target=\_blank} to enable email notifications from Alertmanager. Then, add the following code to the configuration file to define email notifications using your  email and app password: 

    {% raw %}
    ```yml title="alertmanager.yml"
    global:
      resolve_timeout: 1m

    route:
      receiver: 'gmail-notifications'

    receivers:
      - name: 'gmail-notifications'
        email_configs:
          - to: INSERT_YOUR_EMAIL
            from: INSERT_YOUR_EMAIL
            smarthost: smtp.gmail.com:587
            auth_username: INSERT_YOUR_EMAIL
            auth_identity: INSERT_YOUR_EMAIL
            auth_password: INSERT_YOUR_APP_PASSWORD
            send_resolved: true

    ```
    {% endraw %}


    ```bash
    sudo chown -R prometheus:prometheus /etc/alertmanager
    ```

4. Configure Alertmanager as a service by creating a systemd service file:

    ```bash
    sudo nano /etc/systemd/system/alertmanager.service
    ```

    {% raw %}
    ```yml title="alertmanager.service"
    [Unit]
    Description=AlertManager Server Service
    Wants=network-online.target
    After=network-online.target

    [Service]
    User=root
    Group=root
    Type=simple
    ExecStart=/usr/local/bin/alertmanager --config.file /etc/alertmanager/alertmanager.yml --web.external-url=http://SERVER_IP:9093 --cluster.advertise-address='0.0.0.0:9093'

    [Install]
    WantedBy=multi-user.target

    ```
    {% endraw %}

5. Reload and enable the service:

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable alertmanager
    sudo systemctl start alertmanager
    ```

6. Verify the service status:

    ```bash
    sudo systemctl status alertmanager
    ```

    If you have configured Alertmanager properly, the **Active** field should display **active (running)** similar to below:

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>sudo systemctl status alertmanager</span>
      <span data-ty>alertmanager.service - AlertManager Server Service</span>
      <span data-ty>Loaded: loaded (/etc/systemd/system/alertmanager.service; enabled; vendor preset: enabled)</span>
      <span data-ty>Active: active (running) since Thu 2020-08-20 22:01:21 CEST; 3 days ago</span>
      <span data-ty>Main PID: 20592 (alertmanager)</span>
      <span data-ty>Tasks: 70 (limit: 9830)</span>
      <span data-ty>CGroup: /system.slice/alertmanager.service</span>
      <span data-ty="input"><span class="file-path"></span></span>
    </div>

#### Grafana Plugin

There is an [Alertmanager plugin in Grafana](https://grafana.com/grafana/plugins/alertmanager/){target=\_blank} that can help you monitor alert information.

Follow these steps to use the plugin:

1. Install the plugin:

    ```bash
    sudo grafana-cli plugins install camptocamp-prometheus-alertmanager-datasource
    ```

2. Restart Grafana:

    ```bash
    sudo systemctl restart grafana-server
    ```

3. Configure Alertmanager as a data source in your Grafana dashboard (`SERVER_IP:3000`):

    1. Go to **Configuration** > **Data Sources** and search for **Prometheus Alertmanager**.
    2. Enter the server URL and port for the Alertmanager service, and select **Save & Test** to verify the connection.

4. Import the [8010](https://grafana.com/grafana/dashboards/8010-prometheus-alertmanager/){target=\_blank} dashboard for Alertmanager, selecting **Prometheus Alertmanager** in the last column, then select **Import**.

#### Integrate Alertmanager

Complete the integration by following these steps to enable communication between Prometheus and Alertmanager and configure detection and alert rules:

1. Update the `etc/prometheus/prometheus.yml` configuration file to include the following code:

    {% raw %}
    ```yml title="prometheus.yml"
    rule_files:
      - 'rules.yml'

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
                - localhost:9093
    ```
    {% endraw %}

    Expand the following item to view the complete `prometheus.yml` file.

    ??? code "prometheus.yml"

        {% raw %}
        ```yml title="prometheus.yml"
        global:
          scrape_interval: 15s
          evaluation_interval: 15s

        rule_files:
          - 'rules.yml'

        alerting:
          alertmanagers:
            - static_configs:
                - targets:
                    - localhost:9093

        scrape_configs:
          - job_name: 'prometheus'
            scrape_interval: 5s
            static_configs:
              - targets: ['localhost:9090']
          - job_name: 'substrate_node'
            scrape_interval: 5s
            static_configs:
              - targets: ['localhost:9615']

        ```
        {% endraw %}

2. Create the rules file for detection and alerts:

    ```bash
    sudo nano /etc/prometheus/rules.yml
    ```

    Add a sample rule to trigger email notifications for node downtime over five minutes:

    {% raw %}
    ```yml title="rules.yml"
    groups:
      - name: alert_rules
        rules:
          - alert: InstanceDown
            expr: up == 0
            for: 5m
            labels:
              severity: critical
            annotations:
              summary: 'Instance [{{ $labels.instance }}] down'
              description: '[{{ $labels.instance }}] of job [{{ $labels.job }}] has been down for more than 5 minutes.'

    ```
    {% endraw %}

    If any of the conditions defined in the rules file are met, an alert will be triggered. For more on alert rules, refer to [Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/){target=\_blank} and [additional alerts](https://samber.github.io/awesome-prometheus-alerts/rules.html){target=\_blank}.

3. Update the file ownership to `prometheus`:

    ```bash
    sudo chown prometheus:prometheus rules.yml
    ```

4. Validate the rules syntax:

    ```bash
    sudo -u prometheus promtool check rules rules.yml
    ```

5. Restart Prometheus and Alertmanager:

    ```bash
    sudo systemctl restart prometheus && sudo systemctl restart alertmanager
    ```

Now you will receive an email alert if one of your rule triggering conditions is met. 
        
## Secure Your Validator

Validators in Polkadot's Proof of Stake (PoS) network play a critical role in maintaining network integrity and security by keeping the network in consensus and verifying state transitions. To ensure optimal performance and minimize risks, validators must adhere to strict guidelines around security and reliable operations.

### Key Management

Though they don't transfer funds, session keys are essential for validators as they sign messages related to consensus and parachains. Securing session keys is crucial as allowing them to be exploited or used across multiple nodes can lead to a loss of staked funds via [slashing](/infrastructure/staking-mechanics/offenses-and-slashes/){target=\_blank}.

Given the current limitations in high-availability setups and the risks associated with double-signing, it’s recommended to run only a single validator instance. Keys should be securely managed, and processes automated to minimize human error.

There are two approaches for generating session keys:

- **Generate and store in node**: Using the `author.rotateKeys` RPC call. For most users, generating keys directly within the client is recommended. You must submit a session certificate from your staking proxy to register new keys. See the [How to Validate](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/){target=\_blank} guide for instructions on setting keys.

- **Generate outside node and insert**: Using the `author.setKeys` RPC call. This flexibility accommodates advanced security setups and should only be used by experienced validator operators.

### Signing Outside the Client

Polkadot plans to support external signing, allowing session keys to reside in secure environments like Hardware Security Modules (HSMs). However, these modules can sign any payload they receive, potentially enabling an attacker to perform slashable actions.

### Secure-Validator Mode

Polkadot's Secure-Validator mode offers an extra layer of protection through strict filesystem, networking, and process sandboxing. This secure mode is activated by default if the machine meets the following requirements:

- **Linux (x86-64 architecture)**: Usually Intel or AMD.
- **Enabled `seccomp`**: This kernel feature facilitates a more secure approach for process management on Linux. Verify by running.

    ```bash
    cat /boot/config-`uname -r` | grep CONFIG_SECCOMP=
    ```

    If `seccomp` is enabled, you should see output similar to the following:

    ```bash
    CONFIG_SECCOMP=y
    ```

!!! tip 
    Optionally, **Linux 5.13** may also be used, as it provides access to even more strict filesystem protections.

### Linux Best Practices

Follow these best practices to keep your validator secure:

- Use a non-root user for all operations.
- Regularly apply OS security patches.
- Enable and configure a firewall.
- Use key-based SSH authentication; deactivate password-based login.
- Regularly back up data and harden your SSH configuration. Visit this [SSH guide](https://blog.stribik.technology/2015/01/04/secure-secure-shell.html){target=\_blank} for more details.

### Validator Best Practices

Additional best practices can add an additional layer of security and operational reliability:

- Only run the Polkadot binary, and only listen on the configured p2p port.
- Run on bare-metal machines, as opposed to virtual machines.
- Provisioning of the validator machine should be automated and defined in code which is kept in private version control, reviewed, audited, and tested.
- Generate and provide session keys in a secure way.
- Start Polkadot at boot and restart if stopped for any reason.
- Run Polkadot as a non-root user.
- Establish and maintain an on-call rotation for managing alerts.
- Establish and maintain a clear protocol with actions to perform for each level of each alert with an escalation policy.

## Additional Resources

- [Certus One's Knowledge Base](https://knowledgebase.certus.com/FAQ/){target=\_blank}
- [EOS Block Producer Security List](https://github.com/slowmist/eos-bp-nodes-security-checklist){target=\_blank}
- [HSM Policies and the Importance of Validator Security](https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f){target=\_blank}

For additional guidance, connect with other validators and the Polkadot engineering team in the [Polkadot Validator Lounge](https://matrix.to/#/#polkadotvalidatorlounge:web3.foundation){target=\_blank} on Element.


---

Page Title: Glossary

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-glossary.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/glossary/
- Summary: Glossary of terms used within the Polkadot ecosystem, Polkadot SDK, its subsequent libraries, and other relevant Web3 terminology.

# Glossary

Key definitions, concepts, and terminology specific to the Polkadot ecosystem are included here.

Additional glossaries from around the ecosystem you might find helpful:

- [Polkadot Wiki Glossary](https://wiki.polkadot.com/general/glossary){target=\_blank}
- [Polkadot SDK Glossary](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/glossary/index.html){target=\_blank}

## Authority

The role in a blockchain that can participate in consensus mechanisms. 

- **[GRANDPA](#grandpa)**: The authorities vote on chains they consider final.
- **[Blind Assignment of Blockchain Extension](#blind-assignment-of-blockchain-extension-babe) (BABE)**: The authorities are also [block authors](#block-author).

Authority sets can be used as a basis for consensus mechanisms such as the [Nominated Proof of Stake (NPoS)](#nominated-proof-of-stake-npos) protocol.

## Authority Round (Aura)

A deterministic [consensus](#consensus) protocol where block production is limited to a rotating list of [authorities](#authority) that take turns creating blocks. In authority round (Aura) consensus, most online authorities are assumed to be honest. It is often used in combination with [GRANDPA](#grandpa) as a [hybrid consensus](#hybrid-consensus) protocol.

Learn more by reading the official [Aura consensus algorithm](https://openethereum.github.io/Aura){target=\_blank} wiki article.

## Blind Assignment of Blockchain Extension (BABE)

A [block authoring](#block-author) protocol similar to [Aura](#authority-round-aura), except [authorities](#authority) win [slots](#slot) based on a Verifiable Random Function (VRF) instead of the round-robin selection method. The winning authority can select a chain and submit a new block.

Learn more by reading the official Web3 Foundation [BABE research document](https://research.web3.foundation/Polkadot/protocols/block-production/Babe){target=\_blank}.

## Block Author

The node responsible for the creation of a block, also called _block producers_. In a Proof of Work (PoW) blockchain, these nodes are called _miners_.

## Byzantine Fault Tolerance (BFT)

The ability of a distributed computer network to remain operational if a certain proportion of its nodes or [authorities](#authority) are defective or behaving maliciously. A distributed network is typically considered Byzantine fault tolerant if it can remain functional, with up to one-third of nodes assumed to be defective, offline, actively malicious, and part of a coordinated attack.

### Byzantine Failure

The loss of a network service due to node failures that exceed the proportion of nodes required to reach consensus.

### Practical Byzantine Fault Tolerance (pBFT)

An early approach to Byzantine fault tolerance (BFT), practical Byzantine fault tolerance (pBFT) systems tolerate Byzantine behavior from up to one-third of participants.

The communication overhead for such systems is `O(n²)`, where `n` is the number of nodes (participants) in the system.

### Preimage

A preimage is the data that is input into a hash function to calculate a hash. Since a hash function is a [one-way function](https://en.wikipedia.org/wiki/One-way_function){target=\_blank}, the output, the hash, cannot be used to reveal the input, the preimage.

## Call

In the context of pallets containing functions to be dispatched to the runtime, `Call` is an enumeration data type that describes the functions that can be dispatched with one variant per pallet. A `Call` represents a [dispatch](#dispatchable) data structure object.

## Chain Specification 

A chain specification file defines the properties required to run a node in an active or new Polkadot SDK-built network. It often contains the initial genesis runtime code, network properties (such as the network's name), the initial state for some pallets, and the boot node list. The chain specification file makes it easy to use a single Polkadot SDK codebase as the foundation for multiple independently configured chains.

## Collator

An [author](#block-author) of a [parachain](#parachain) network.
They aren't [authorities](#authority) in themselves, as they require a [relay chain](#relay-chain) to coordinate [consensus](#consensus).

More details are found on the [Polkadot Collator Wiki](https://wiki.polkadot.com/learn/learn-collator/){target=\_blank}.

## Collective

Most often used to refer to an instance of the Collective pallet on Polkadot SDK-based networks such as [Kusama](#kusama) or [Polkadot](#polkadot) if the Collective pallet is part of the FRAME-based runtime for the network.

## Consensus

Consensus is the process blockchain nodes use to agree on a chain's canonical fork. It is composed of [authorship](#block-author), finality, and [fork-choice rule](#fork-choice-rulestrategy). In the Polkadot ecosystem, these three components are usually separate and the term consensus often refers specifically to authorship.

See also [hybrid consensus](#hybrid-consensus).

## Consensus Algorithm

Ensures a set of [actors](#authority)—who don't necessarily trust each other—can reach an agreement about the state as the result of some computation. Most consensus algorithms assume that up to one-third of the actors or nodes can be [Byzantine fault tolerant](#byzantine-fault-tolerance-bft).

Consensus algorithms are generally concerned with ensuring two properties:

- **Safety**: Indicating that all honest nodes eventually agreed on the state of the chain.
- **Liveness**: Indicating the ability of the chain to keep progressing.

## Consensus Engine

The node subsystem responsible for consensus tasks.

For detailed information about the consensus strategies of the [Polkadot](#polkadot) network, see the [Polkadot Consensus](/polkadot-protocol/architecture/polkadot-chain/pos-consensus/){target=\_blank} blog series.

See also [hybrid consensus](#hybrid-consensus).

## Coretime

The time allocated for utilizing a core, measured in relay chain blocks. There are two types of coretime: *on-demand* and *bulk*.

On-demand coretime refers to coretime acquired through bidding in near real-time for the validation of a single parachain block on one of the cores reserved specifically for on-demand orders. They are available as an on-demand coretime pool. Set of cores that are available on-demand. Cores reserved through bulk coretime could also be made available in the on-demand coretime pool, in parts or in entirety.

Bulk coretime is a fixed duration of continuous coretime represented by an NFT that can be split, shared, or resold. It is managed by the [Broker pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=\_blank}.

## Development Phrase

A [mnemonic phrase](https://en.wikipedia.org/wiki/Mnemonic#For_numerical_sequences_and_mathematical_operations){target=\_blank} that is intentionally made public.

Well-known development accounts, such as Alice, Bob, Charlie, Dave, Eve, and Ferdie, are generated from the same secret phrase:

```
bottom drive obey lake curtain smoke basket hold race lonely fit walk
```

Many tools in the Polkadot SDK ecosystem, such as [`subkey`](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2506-2/substrate/bin/utils/subkey){target=\_blank}, allow you to implicitly specify an account using a derivation path such as `//Alice`.

## Digest

An extensible field of the [block header](#header) that encodes information needed by several actors in a blockchain network, including:

- [Light clients](#light-client) for chain synchronization.
- Consensus engines for block verification.
- The runtime itself, in the case of pre-runtime digests.

## Dispatchable

Function objects that act as the entry points in FRAME [pallets](#pallet). Internal or external entities can call them to interact with the blockchain’s state. They are a core aspect of the runtime logic, handling [transactions](#transaction) and other state-changing operations.

## Events

A means of recording that some particular [state](#state) transition happened.

In the context of [FRAME](#frame-framework-for-runtime-aggregation-of-modularized-entities), events are composable data types that each [pallet](#pallet) can individually define. Events in FRAME are implemented as a set of transient storage items inspected immediately after a block has been executed and reset during block initialization.

## Executor

A means of executing a function call in a given [runtime](#runtime) with a set of dependencies.
There are two orchestration engines in Polkadot SDK, _WebAssembly_ and _native_.

- The _native executor_ uses a natively compiled runtime embedded in the node to execute calls. This is a performance optimization available to up-to-date nodes.

- The _WebAssembly executor_ uses a [Wasm](#webassembly-wasm) binary and a Wasm interpreter to execute calls. The binary is guaranteed to be up-to-date regardless of the version of the blockchain node because it is persisted in the [state](#state) of the Polkadot SDK-based chain.

## Existential Deposit

The minimum balance an account is allowed to have in the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/index.html){target=\_blank}. Accounts cannot be created with a balance less than the existential deposit amount. 

If an account balance drops below this amount, the Balances pallet uses [a FRAME System API](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.dec_ref){target=\_blank} to drop its references to that account.

If the Balances pallet reference to an account is dropped, the account can be [reaped](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.allow_death){target=\_blank}.

## Extrinsic

A general term for data that originates outside the runtime, is included in a block, and leads to some action. This includes user-initiated transactions and inherent transactions placed into the block by the block builder.

It is a SCALE-encoded array typically consisting of a version number, signature, and varying data types indicating the resulting runtime function to be called. Extrinsics can take two forms: [inherents](#inherent-transactions) and [transactions](#transaction). 

For more technical details, see the [Polkadot spec](https://spec.polkadot.network/id-extrinsics){target=\_blank}.

## Fork Choice Rule/Strategy

A fork choice rule or strategy helps determine which chain is valid when reconciling several network forks. A common fork choice rule is the [longest chain](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/struct.LongestChain.html){target=\_blank}, in which the chain with the most blocks is selected.

## FRAME (Framework for Runtime Aggregation of Modularized Entities)

Enables developers to create blockchain [runtime](#runtime) environments from a modular set of components called [pallets](#pallet). It utilizes a set of procedural macros to construct runtimes.

[Visit the Polkadot SDK docs for more details on FRAME.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank}

## Full Node

A node that prunes historical states, keeping only recently finalized block states to reduce storage needs. Full nodes provide current chain state access and allow direct submission and validation of [extrinsics](#extrinsic), maintaining network decentralization.

## Genesis Configuration

A mechanism for specifying the initial state of a blockchain. By convention, this initial state or first block is commonly referred to as the genesis state or genesis block. The genesis configuration for Polkadot SDK-based chains is accomplished by way of a [chain specification](#chain-specification) file.

## GRANDPA

A deterministic finality mechanism for blockchains that is implemented in the [Rust](https://www.rust-lang.org/){target=\_blank} programming language.

The [formal specification](https://github.com/w3f/consensus/blob/master/pdf/grandpa-old.pdf){target=\_blank} is maintained by the [Web3 Foundation](https://web3.foundation/){target=\_blank}.

## Header

A structure that aggregates the information used to summarize a block. Primarily, it consists of cryptographic information used by [light clients](#light-client) to get minimally secure but very efficient chain synchronization.

## Hybrid Consensus

A blockchain consensus protocol that consists of independent or loosely coupled mechanisms for [block production](#block-author) and finality.

Hybrid consensus allows the chain to grow as fast as probabilistic consensus protocols, such as [Aura](#authority-round-aura), while maintaining the same level of security as deterministic finality consensus protocols, such as [GRANDPA](#grandpa).

## Inherent Transactions

A special type of unsigned transaction, referred to as _inherents_, that enables a block authoring node to insert information that doesn't require validation directly into a block.

Only the block-authoring node that calls the inherent transaction function can insert data into its block. In general, validators assume the data inserted using an inherent transaction is valid and reasonable even if it can't be deterministically verified.

## JSON-RPC

A stateless, lightweight remote procedure call protocol encoded in JavaScript Object Notation (JSON). JSON-RPC provides a standard way to call functions on a remote system by using JSON.

For Polkadot SDK, this protocol is implemented through the [Parity JSON-RPC](https://github.com/paritytech/jsonrpc){target=\_blank} crate.

## Keystore

A subsystem for managing keys for the purpose of producing new blocks.

## Kusama

[Kusama](https://kusama.network/){target=\_blank} is a Polkadot SDK-based blockchain that implements a design similar to the [Polkadot](#polkadot) network.

Kusama is a [canary](https://en.wiktionary.org/wiki/canary_in_a_coal_mine){target=\_blank} network and is referred to as [Polkadot's "wild cousin."](https://wiki.polkadot.com/learn/learn-comparisons-kusama/){target=\_blank}.

As a canary network, Kusama is expected to be more stable than a test network like [Westend](#westend) but less stable than a production network like [Polkadot](#polkadot). Kusama is controlled by its network participants and is intended to be stable enough to encourage meaningful experimentation.

## libp2p

A peer-to-peer networking stack that allows the use of many transport mechanisms, including WebSockets (usable in a web browser).

Polkadot SDK uses the [Rust implementation](https://github.com/libp2p/rust-libp2p){target=\_blank} of the `libp2p` networking stack.

## Light Client

A type of blockchain node that doesn't store the [chain state](#state) or produce blocks.

A light client can verify cryptographic primitives and provides a [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call){target=\_blank} server, enabling blockchain users to interact with the network.

## Metadata

Data that provides information about one or more aspects of a system.
The metadata that exposes information about a Polkadot SDK blockchain enables you to interact with that system.

## Nominated Proof of Stake (NPoS)

A method for determining [validators](#validator) or _[authorities](#authority)_ based on a willingness to commit their stake to the proper functioning of one or more block-producing nodes.

## Oracle

An entity that connects a blockchain to a non-blockchain data source. Oracles enable the blockchain to access and act upon information from existing data sources and incorporate data from non-blockchain systems and services.

## Origin

A [FRAME](#frame-framework-for-runtime-aggregation-of-modularized-entities) primitive that identifies the source of a [dispatched](#dispatchable) function call into the [runtime](#runtime). The FRAME System pallet defines three built-in [origins](#origin). As a [pallet](#pallet) developer, you can also define custom origins, such as those defined by the [Collective pallet](https://paritytech.github.io/substrate/master/pallet_collective/enum.RawOrigin.html){target=\_blank}.

## Pallet

A module that can be used to extend the capabilities of a [FRAME](#frame-framework-for-runtime-aggregation-of-modularized-entities)-based [runtime](#runtime).
Pallets bundle domain-specific logic with runtime primitives like [events](#events) and [storage items](#storage-item).

## Parachain

A parachain is a blockchain that derives shared infrastructure and security from a _[relay chain](#relay-chain)_.
You can learn more about parachains on the [Polkadot Wiki](https://wiki.polkadot.com/learn/learn-parachains/){target=\_blank}.

## Paseo

Paseo TestNet provisions testing on Polkadot's "production" runtime, which means less chance of feature or code mismatch when developing parachain apps. Specifically, after the [Polkadot Technical fellowship](https://wiki.polkadot.com/learn/learn-polkadot-technical-fellowship/){target=\_blank} proposes a runtime upgrade for Polkadot, this TestNet is updated, giving a period where the TestNet will be ahead of Polkadot to allow for testing.

## Polkadot

The [Polkadot network](https://polkadot.com/){target=\_blank} is a blockchain that serves as the central hub of a heterogeneous blockchain network. It serves the role of the [relay chain](#relay-chain) and provides shared infrastructure and security to support [parachains](#parachain).

## Polkadot Cloud

Polkadot Cloud is a platform for deploying resilient, customizable and scalable Web3 applications through Polkadot's functionality. It encompasses the wider Polkadot network infrastructure and security layer where parachains operate. The platform enables users to launch Ethereum-compatible chains, build specialized blockchains, and flexibly manage computing resources through on-demand or bulk coretime purchases. Initially launched with basic parachain functionality, Polkadot Cloud has evolved to offer enhanced flexibility with features like coretime, elastic scaling, and async backing for improved performance.

## Polkadot Hub

Polkadot Hub is a Layer 1 platform that serves as the primary entry point to the Polkadot ecosystem, providing essential functionality without requiring parachain deployment. It offers core services including smart contracts, identity management, staking, governance, and interoperability with other ecosystems, making it simple and fast for both builders and users to get started in Web3.

## PolkaVM

PolkaVM is a custom virtual machine optimized for performance, leveraging a RISC-V-based architecture to support Solidity and any language that compiles to RISC-V. It is specifically designed for the Polkadot ecosystem, enabling smart contract deployment and execution.

## Relay Chain

Relay chains are blockchains that provide shared infrastructure and security to the [parachains](#parachain) in the network. In addition to providing [consensus](#consensus) capabilities, relay chains allow parachains to communicate and exchange digital assets without needing to trust one another.

## Rococo

A [parachain](#parachain) test network for the Polkadot network. The [Rococo](#rococo) network is a Polkadot SDK-based blockchain with an October 14, 2024 deprecation date. Development teams are encouraged to use the Paseo TestNet instead.

## Runtime

The runtime represents the [state transition function](#state-transition-function-stf) for a blockchain. In Polkadot SDK, the runtime is stored as a [Wasm](#webassembly-wasm) binary in the chain state. The Runtime is stored under a unique state key and can be modified during the execution of the state transition function.

## Slot

A fixed, equal interval of time used by consensus engines such as [Aura](#authority-round-aura) and [BABE](#blind-assignment-of-blockchain-extension-babe). In each slot, a subset of [authorities](#authority) is permitted, or obliged, to [author](#block-author) a block.

## Sovereign Account

The unique account identifier for each chain in the relay chain ecosystem. It is often used in cross-consensus (XCM) interactions to sign XCM messages sent to the relay chain or other chains in the ecosystem.

The sovereign account for each chain is a root-level account that can only be accessed using the Sudo pallet or through governance. The account identifier is calculated by concatenating the Blake2 hash of a specific text string and the registered parachain identifier.

## SS58 Address Format

A public key address based on the Bitcoin [`Base-58-check`](https://en.bitcoin.it/wiki/Base58Check_encoding){target=\_blank} encoding. Each Polkadot SDK SS58 address uses a `base-58` encoded value to identify a specific account on a specific Polkadot SDK-based chain

The [canonical `ss58-registry`](https://github.com/paritytech/ss58-registry){target=\_blank} provides additional details about the address format used by different Polkadot SDK-based chains, including the network prefix and website used for different networks

## State Transition Function (STF)

The logic of a blockchain that determines how the state changes when a block is processed. In Polkadot SDK, the state transition function is effectively equivalent to the [runtime](#runtime).

## Storage Item

[FRAME](#frame-framework-for-runtime-aggregation-of-modularized-entities) primitives that provide type-safe data persistence capabilities to the [runtime](#runtime).
Learn more in the [storage items](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank} reference document in the Polkadot SDK.

## Substrate

A flexible framework for building modular, efficient, and upgradeable blockchains. Substrate is written in the [Rust](https://www.rust-lang.org/){target=\_blank} programming language and is maintained by [Parity Technologies](https://www.parity.io/){target=\_blank}.

## Transaction

An [extrinsic](#extrinsic) that includes a signature that can be used to verify the account authorizing it inherently or via [signed extensions](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/signed_extensions/index.html){target=\_blank}.

## Transaction Era

A definable period expressed as a range of block numbers during which a transaction can be included in a block.
Transaction eras are used to protect against transaction replay attacks if an account is reaped and its replay-protecting nonce is reset to zero.

## Trie (Patricia Merkle Tree)

A data structure used to represent sets of key-value pairs and enables the items in the data set to be stored and retrieved using a cryptographic hash. Because incremental changes to the data set result in a new hash, retrieving data is efficient even if the data set is very large. With this data structure, you can also prove whether the data set includes any particular key-value pair without access to the entire data set.

In Polkadot SDK-based blockchains, state is stored in a trie data structure that supports the efficient creation of incremental digests. This trie is exposed to the [runtime](#runtime) as [a simple key/value map](#storage-item) where both keys and values can be arbitrary byte arrays.

## Validator

A validator is a node that participates in the consensus mechanism of the network. Its roles include block production, transaction validation, network integrity, and security maintenance.

## WebAssembly (Wasm)

An execution architecture that allows for the efficient, platform-neutral expression of
deterministic, machine-executable logic.

[Wasm](https://webassembly.org/){target=\_blank} can be compiled from many languages, including
the [Rust](https://www.rust-lang.org/){target=\_blank} programming language. Polkadot SDK-based chains use a Wasm binary to provide portable [runtimes](#runtime) that can be included as part of the chain's state.

## Weight

A convention used in Polkadot SDK-based blockchains to measure and manage the time it takes to validate a block.
Polkadot SDK defines one unit of weight as one picosecond of execution time on reference hardware.

The maximum block weight should be equivalent to one-third of the target block time with an allocation of one-third each for:

- Block construction
- Network propagation
- Import and verification

By defining weights, you can trade-off the number of transactions per second and the hardware required to maintain the target block time appropriate for your use case. Weights are defined in the runtime, meaning you can tune them using runtime updates to keep up with hardware and software improvements.

## Westend

Westend is a Parity-maintained, Polkadot SDK-based blockchain that serves as a test network for the [Polkadot](#polkadot) network.


---

Page Title: Introduction to XCM

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-intro-to-xcm.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/intro-to-xcm/
- Summary: Unlock blockchain interoperability with XCM — Polkadot's Cross-Consensus Messaging format for cross-chain interactions.

# Introduction to XCM

## Introduction

Polkadot’s unique value lies in its ability to enable interoperability between parachains and other blockchain systems. At the core of this capability is XCM (Cross-Consensus Messaging)—a flexible messaging format that facilitates communication and collaboration between independent consensus systems.

With XCM, one chain can send intents to another one, fostering a more interconnected ecosystem. Although it was developed specifically for Polkadot, XCM is a universal format, usable in any blockchain environment. This guide provides an overview of XCM’s core principles, design, and functionality, alongside practical examples of its implementation.

## Messaging Format

XCM is not a protocol but a standardized [messaging format](https://github.com/polkadot-fellows/xcm-format){target=\_blank}. It defines the structure and behavior of messages but does not handle their delivery. This separation allows developers to focus on crafting instructions for target systems without worrying about transmission mechanics.

XCM messages are intent-driven, outlining desired actions for the receiving blockchain to consider and potentially alter its state. These messages do not directly execute changes; instead, they rely on the host chain's environment to interpret and implement them. By utilizing asynchronous composability, XCM facilitates efficient execution where messages can be processed independently of their original order, similar to how RESTful services handle HTTP requests without requiring sequential processing.

## The Four Principles of XCM

XCM adheres to four guiding principles that ensure robust and reliable communication across consensus systems:

- **Asynchronous**: XCM messages operate independently of sender acknowledgment, avoiding delays due to blocked processes.
- **Absolute**: XCM messages are guaranteed to be delivered and interpreted accurately, in order, and timely. Once a message is sent, one can be sure it will be processed as intended.
- **Asymmetric**: XCM messages follow the 'fire and forget' paradigm meaning no automatic feedback is provided to the sender. Any results must be communicated separately to the sender with an additional message back to the origin.
- **Agnostic**: XCM operates independently of the specific consensus mechanisms, making it compatible across diverse systems.

These principles guarantee that XCM provides a reliable framework for cross-chain communication, even in complex environments.

## The XCM Tech Stack

![Diagram of the XCM tech stack](/images/develop/interoperability/intro-to-xcm/intro-to-xcm-01.webp)

The XCM tech stack is designed to facilitate seamless interoperable communication between chains that reside within the Polkadot ecosystem. XCM can be used to express the meaning of the messages over each of the communication channels.

## Core Functionalities of XCM

XCM enhances cross-consensus communication by introducing several powerful features:

- **Programmability**: Supports dynamic message handling, allowing for more comprehensive use cases. Includes branching logic, safe dispatches for version checks, and asset operations like NFT management.
- **Functional Multichain Decomposition**: Enables mechanisms such as remote asset locking, asset namespacing, and inter-chain state referencing, with contextual message identification.
- **Bridging**: Establishes a universal reference framework for multi-hop setups, connecting disparate systems like Ethereum and Bitcoin with the Polkadot relay chain acting as a universal location.

The standardized format for messages allows parachains to handle tasks like user balances, governance, and staking, freeing the Polkadot relay chain to focus on shared security. These features make XCM indispensable for implementing scalable and interoperable blockchain applications. 

## XCM Example

The following is a simplified XCM message demonstrating a token transfer from Alice to Bob on the same chain (ParaA).

```rust
let message = Xcm(vec![
    WithdrawAsset((Here, amount).into()),
    BuyExecution { 
        fees: (Here, amount).into(), 
        weight_limit: WeightLimit::Unlimited 
    },
    DepositAsset {
        assets: All.into(),
        beneficiary: MultiLocation {
            parents: 0,
            interior: Junction::AccountId32 {
                network: None,
                id: BOB.clone().into()
            }.into(),
        }.into()
    }
]);
```

The message consists of three instructions described as follows:

- **[WithdrawAsset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#withdrawasset){target=\_blank}**: Transfers a specified number of tokens from Alice's account to a holding register.

    ```rust
        WithdrawAsset((Here, amount).into()),
    ```

    - **`Here`**: The native parachain token.
    - **`amount`**: The number of tokens that are transferred.

    The first instruction takes as an input the MultiAsset that should be withdrawn. The MultiAsset describes the native parachain token with the `Here` keyword. The `amount` parameter is the number of tokens that are transferred. The withdrawal account depends on the origin of the message. In this example the origin of the message is Alice. The `WithdrawAsset` instruction moves `amount` number of native tokens from Alice's account into the holding register.

- **[BuyExecution](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#buyexecution){target=\_blank}**: Allocates fees to cover the execution [weight](/polkadot-protocol/glossary/#weight){target=\_blank} of the XCM instructions.

    ```rust
        BuyExecution { 
            fees: (Here, amount).into(), 
            weight_limit: WeightLimit::Unlimited 
        },
    ```

    - **`fees`**: Describes the asset in the holding register that should be used to pay for the weight.
    - **`weight_limit`**: Defines the maximum fees that can be used to buy weight.

- **[DepositAsset](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#depositasset){target=\_blank}**: Moves the remaining tokens from the holding register to Bob’s account.

    ```rust
        DepositAsset {
            assets: All.into(),
            beneficiary: MultiLocation {
                parents: 0,
                interior: Junction::AccountId32 {
                    network: None,
                    id: BOB.clone().into()
                }.into(),
            }.into()
        }
    ```

    - **`All`**: The wildcard for the asset(s) to be deposited. In this case, all assets in the holding register should be deposited.
    
This step-by-step process showcases how XCM enables precise state changes within a blockchain system. You can find a complete XCM message example in the [XCM repository](https://github.com/paritytech/xcm-docs/blob/main/examples/src/0_first_look/mod.rs){target=\_blank}.

## Overview

XCM revolutionizes cross-chain communication by enabling use cases such as:

- Token transfers between blockchains.
- Asset locking for cross-chain smart contract interactions.
- Remote execution of functions on other blockchains.

These functionalities empower developers to build innovative, multi-chain applications, leveraging the strengths of various blockchain networks. To stay updated on XCM’s evolving format or contribute, visit the [XCM repository](https://github.com/paritytech/xcm-docs/blob/main/examples/src/0_first_look/mod.rs){target=\_blank}.


---

Page Title: JSON-RPC APIs

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-smart-contracts-json-rpc-apis.md
- Canonical (HTML): https://docs.polkadot.com/develop/smart-contracts/json-rpc-apis/
- Summary: JSON-RPC APIs guide for Polkadot Hub, covering supported methods, parameters, and examples for interacting with the chain.

# JSON-RPC APIs

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Polkadot Hub provides Ethereum compatibility through its JSON-RPC interface, allowing developers to interact with the chain using familiar Ethereum tooling and methods. This document outlines the supported [Ethereum JSON-RPC methods](https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods){target=\_blank} and provides examples of how to use them.

This guide uses the Polkadot Hub TestNet endpoint:

```text
https://testnet-passet-hub-eth-rpc.polkadot.io
```

## Available Methods

### eth_accounts

Returns a list of addresses owned by the client. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="eth_accounts"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_accounts",
    "params":[],
    "id":1
}'
```

---

### eth_blockNumber

Returns the number of the most recent block. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="eth_blockNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_blockNumber",
    "params":[],
    "id":1
}'
```

---

### eth_call

Executes a new message call immediately without creating a transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call){target=\_blank}.

**Parameters**:

- **`transaction` ++"object"++**: The transaction call object.
    - **`to` ++"string"++**: Recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`data` ++"string"++**: Hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`from` ++"string"++**: (Optional) Sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`gas` ++"string"++**: (Optional) Gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`gasPrice` ++"string"++**: (Optional) Gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`value` ++"string"++**: (Optional) Value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) Block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.

**Example**:

```bash title="eth_call"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_CALL"
    }, "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_RECIPIENT_ADDRESS`, `INSERT_ENCODED_CALL`, and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_chainId

Returns the chain ID used for signing transactions. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="eth_chainId"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_chainId",
    "params":[],
    "id":1
}'
```

---

### eth_estimateGas

Estimates gas required for a transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas){target=\_blank}.

**Parameters**:

- **`transaction` ++"object"++**: The transaction call object.
    - **`to` ++"string"++**: Recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`data` ++"string"++**: Hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`from` ++"string"++**: (Optional) Sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`gas` ++"string"++**: (Optional) Gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`gasPrice` ++"string"++**: (Optional) Gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`value` ++"string"++**: (Optional) Value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) Block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.

**Example**:

```bash title="eth_estimateGas"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_estimateGas",
    "params":[{
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_FUNCTION_CALL"
    }],
    "id":1
}'
```

Ensure to replace the `INSERT_RECIPIENT_ADDRESS` and `INSERT_ENCODED_CALL` with the proper values.

---

### eth_gasPrice

Returns the current gas price in Wei. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="eth_gasPrice"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_gasPrice",
    "params":[],
    "id":1
}'
```

---

### eth_getBalance

Returns the balance of a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance){target=\_blank}.

**Parameters**:

- **`address` ++"string"++**: Address to query balance. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.

**Example**:

```bash title="eth_getBalance"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getBlockByHash

Returns information about a block by its hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash){target=\_blank}.

**Parameters**:

- **`blockHash` ++"string"++**: The hash of the block to retrieve. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`fullTransactions` ++"boolean"++**: If `true`, returns full transaction details; if `false`, returns only transaction hashes.

**Example**:

```bash title="eth_getBlockByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockByHash",
    "params":["INSERT_BLOCK_HASH", INSERT_BOOLEAN],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` and `INSERT_BOOLEAN` with the proper values.

---

### eth_getBlockByNumber

Returns information about a block by its number. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber){target=\_blank}.

**Parameters**:

- **`blockValue` ++"string"++**: (Optional) The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
- **`fullTransactions` ++"boolean"++**: If `true`, returns full transaction details; if `false`, returns only transaction hashes.

**Example**:

```bash title="eth_getBlockByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockByNumber",
    "params":["INSERT_BLOCK_VALUE", INSERT_BOOLEAN],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` and `INSERT_BOOLEAN` with the proper values.

---

### eth_getBlockTransactionCountByNumber

Returns the number of transactions in a block from a block number. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber){target=\_blank}.

**Parameters**:

- **`blockValue` ++"string"++**: The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.

**Example**:

```bash title="eth_getBlockTransactionCountByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockTransactionCountByNumber",
    "params":["INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getBlockTransactionCountByHash

Returns the number of transactions in a block from a block hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash){target=\_blank}.

**Parameters**:

- **`blockHash` ++"string"++**: The hash of the block to retrieve. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getBlockTransactionCountByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockTransactionCountByHash",
    "params":["INSERT_BLOCK_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` with the proper values.

---

### eth_getCode

Returns the code at a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode){target=\_blank}.

**Parameters**:

- **`address` ++"string"++**: Contract or account address to query code. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block).

**Example**:

```bash title="eth_getCode"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getLogs

Returns an array of all logs matching a given filter object. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs){target=\_blank}.

**Parameters**:

- **`filter` ++"object"++**: The filter object.
    - **`fromBlock` ++"string"++**: (Optional) Block number or tag to start from. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
    - **`toBlock` ++"string"++**: (Optional) Block number or tag to end at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
    - **`address` ++"string" or "array of strings"++**: (Optional) Contract address or a list of addresses from which to get logs. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`topics` ++"array of strings"++**: (Optional) Array of topics for filtering logs. Each topic can be a single [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string or an array of such strings (meaning OR).
    - **`blockhash` ++"string"++**: (Optional) Hash of a specific block. Cannot be used with `fromBlock` or `toBlock`. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getLogs"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getLogs",
    "params":[{
        "fromBlock": "latest",
        "toBlock": "latest"
    }],
    "id":1
}'
```

---

### eth_getStorageAt

Returns the value from a storage position at a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat){target=\_blank}.

**Parameters**:

- **`address` ++"string"++**: Contract or account address to query code. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`storageKey` ++"string"++**: Position in storage to retrieve data from. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block).

**Example**:

```bash title="eth_getStorageAt"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getStorageAt",
    "params":["INSERT_ADDRESS", "INSERT_STORAGE_KEY", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS`, `INSERT_STORAGE_KEY`, and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getTransactionCount

Returns the number of transactions sent from an address (nonce). [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount){target=\_blank}.

**Parameters**:

- **`address` ++"string"++**: Address to query balance. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block).

**Example**:

```bash title="eth_getTransactionCount"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionCount",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getTransactionByHash

Returns information about a transaction by its hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash){target=\_blank}.

**Parameters**:

- **`transactionHash` ++"string"++**: The hash of the transaction. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getTransactionByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByHash",
    "params":["INSERT_TRANSACTION_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper values.

---

### eth_getTransactionByBlockNumberAndIndex

Returns information about a transaction by block number and transaction index. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyblocknumberandindex){target=\_blank}.

**Parameters**:

- **`blockValue` ++"string"++**: The block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
- **`transactionIndex` ++"string"++**: The index of the transaction in the block. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getTransactionByBlockNumberAndIndex"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByBlockNumberAndIndex",
    "params":["INSERT_BLOCK_VALUE", "INSERT_TRANSACTION_INDEX"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` and `INSERT_TRANSACTION_INDEX` with the proper values.

---

### eth_getTransactionByBlockHashAndIndex

Returns information about a transaction by block hash and transaction index. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyblockhashandindex){target=\_blank}.

**Parameters**:

- **`blockHash` ++"string"++**: The hash of the block. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`transactionIndex` ++"string"++**: The index of the transaction in the block. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getTransactionByBlockHashAndIndex"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByBlockHashAndIndex",
    "params":["INSERT_BLOCK_HASH", "INSERT_TRANSACTION_INDEX"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` and `INSERT_TRANSACTION_INDEX` with the proper values.

---

### eth_getTransactionReceipt

Returns the receipt of a transaction by transaction hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt){target=\_blank}.

**Parameters**:

- **`transactionHash` ++"string"++**: The hash of the transaction. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.

**Example**:

```bash title="eth_getTransactionReceipt"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionReceipt",
    "params":["INSERT_TRANSACTION_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper values.

---

### eth_maxPriorityFeePerGas

Returns an estimate of the current priority fee per gas, in Wei, to be included in a block.

**Parameters**:

None.

**Example**:

```bash title="eth_maxPriorityFeePerGas"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_maxPriorityFeePerGas",
    "params":[],
    "id":1
}'
```

---

### eth_sendRawTransaction

Submits a raw transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction){target=\_blank}.

**Parameters**:

- **`callData` ++"string"++**: Signed transaction data. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.

**Example**:

```bash title="eth_sendRawTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_sendRawTransaction",
    "params":["INSERT_CALL_DATA"],
    "id":1
}'
```

Ensure to replace the `INSERT_CALL_DATA` with the proper values.

---

### eth_sendTransaction

Creates and sends a new transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction){target=\_blank}.

**Parameters**:

- **`transaction` ++"object"++**: The transaction object.
    - **`from` ++"string"++**: Address sending the transaction. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`to` ++"string"++**: (Optional) Recipient address. No need to provide this value when deploying a contract. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`gas` ++"string"++**: (optional, default: `90000`) gas limit for execution. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`gasPrice` ++"string"++**: (Optional) Gas price per unit. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`value` ++"string"++**: (Optional) Amount of Ether to send. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`data` ++"string"++**: (Optional) Contract bytecode or encoded method call. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`nonce` ++"string"++**: (Optional) Transaction nonce. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.

**Example**:

```bash title="eth_sendTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_sendTransaction",
    "params":[{
        "from": "INSERT_SENDER_ADDRESS",
        "to": "INSERT_RECIPIENT_ADDRESS",
        "gas": "INSERT_GAS_LIMIT",
        "gasPrice": "INSERT_GAS_PRICE",
        "value": "INSERT_VALUE",
        "input": "INSERT_INPUT_DATA",
        "nonce": "INSERT_NONCE"
    }],
    "id":1
}'
```

Ensure to replace the `INSERT_SENDER_ADDRESS`, `INSERT_RECIPIENT_ADDRESS`, `INSERT_GAS_LIMIT`, `INSERT_GAS_PRICE`, `INSERT_VALUE`, `INSERT_INPUT_DATA`, and `INSERT_NONCE` with the proper values.

---

### eth_syncing

Returns an object with syncing data or `false` if not syncing. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_syncing){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="eth_syncing"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_syncing",
    "params":[],
    "id":1
}'
```

---

### net_listening

Returns `true` if the client is currently listening for network connections, otherwise `false`. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#net_listening){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="net_listening"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_listening",
    "params":[],
    "id":1
}'
```

---

### net_peerCount

Returns the number of peers currently connected to the client.

**Parameters**:

None.

**Example**:

```bash title="net_peerCount"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_peerCount",
    "params":[],
    "id":1
}'
```

---

### net_version

Returns the current network ID as a string. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#net_version){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="net_version"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_version",
    "params":[],
    "id":1
}'
```

---

### system_health

Returns information about the health of the system.

**Parameters**:

None.

**Example**:

```bash title="system_health"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"system_health",
    "params":[],
    "id":1
}'
```

---

### web3_clientVersion

Returns the current client version. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#web3_clientversion){target=\_blank}.

**Parameters**:

None.

**Example**:

```bash title="web3_clientVersion"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"web3_clientVersion",
    "params":[],
    "id":1
}'
```

---

### debug_traceBlockByNumber 

Traces a block's execution by its number and returns a detailed execution trace for each transaction.

**Parameters**:

- **`blockValue` ++"string"++**: The block number or tag to trace. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
- **`options` ++"object"++**: (Optional) An object containing tracer options.
    - **`tracer` ++"string"++**: The name of the tracer to use (e.g., `"callTracer"`, `"opTracer"`).
    - Other tracer-specific options may be supported.

**Example**:

```bash title="debug_traceBlockByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceBlockByNumber",
    "params":["INSERT_BLOCK_VALUE", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace `INSERT_BLOCK_VALUE` with a proper block number if needed.

---

### debug_traceTransaction

Traces the execution of a single transaction by its hash and returns a detailed execution trace.

**Parameters**:

- **`transactionHash` ++"string"++**: The hash of the transaction to trace. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
- **`options` ++"object"++**: (Optional) An object containing tracer options (e.g., `tracer: "callTracer"`).

**Example**:

```bash title="debug_traceTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceTransaction",
    "params":["INSERT_TRANSACTION_HASH", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper value.

---

### debug_traceCall

Executes a new message call and returns a detailed execution trace without creating a transaction on the blockchain.

**Parameters**:

- **`transaction` ++"object"++**: The transaction call object, similar to `eth_call` parameters.
    - **`to` ++"string"++**: Recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`data` ++"string"++**: Hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`from` ++"string"++**: (Optional) Sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding){target=\_blank} string.
    - **`gas` ++"string"++**: (Optional) Gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`gasPrice` ++"string"++**: (Optional) Gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
    - **`value` ++"string"++**: (Optional) Value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string.
- **`blockValue` ++"string"++**: (Optional) Block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding){target=\_blank} string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block){target=\_blank}.
- **`options` ++"object"++**: (Optional) An object containing tracer options (e.g., `tracer: "callTracer"`).

**Example**:

```bash title="debug_traceCall"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceCall",
    "params":[{
        "from": "INSERT_SENDER_ADDRESS",
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_CALL"
    }, "INSERT_BLOCK_VALUE", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace the `INSERT_SENDER_ADDRESS`, `INSERT_RECIPIENT_ADDRESS`, `INSERT_ENCODED_CALL`, and `INSERT_BLOCK_VALUE` with the proper value.

---

## Response Format

All responses follow the standard JSON-RPC 2.0 format:

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": ... // The return value varies by method
}
```

## Error Handling

If an error occurs, the response will include an error object:

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "error": {
        "code": -32000,
        "message": "Error message here"
    }
}
```


---

Page Title: Networks

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-networks.md
- Canonical (HTML): https://docs.polkadot.com/develop/networks/
- Summary: Explore the Polkadot ecosystem networks and learn the unique purposes of each, tailored for blockchain innovation, testing, and enterprise-grade solutions.

# Networks

## Introduction

The Polkadot ecosystem consists of multiple networks designed to support different stages of blockchain development, from main networks to test networks. Each network serves a unique purpose, providing developers with flexible environments for building, testing, and deploying blockchain applications.

This section includes essential network information such as RPC endpoints, currency symbols and decimals, and how to acquire TestNet tokens for the Polkadot ecosystem of networks.

## Production Networks

### Polkadot

Polkadot is the primary production blockchain network for high-stakes, enterprise-grade applications. Polkadot MainNet has been running since May 2020 and has implementations in various programming languages ranging from Rust to JavaScript.

=== "Network Details"

    **Currency symbol**: `DOT`

    ---
    
    **Currency decimals**: 10

    ---

    **Block explorer**: [Polkadot Subscan](https://polkadot.subscan.io/){target=\_blank}

=== "RPC Endpoints"

    Blockops

    ```
    wss://polkadot-public-rpc.blockops.network/ws
    ```

    ---

    Dwellir

    ```
    wss://polkadot-rpc.dwellir.com
    ```

    ---

    Dwellir Tunisia

    ```
    wss://polkadot-rpc-tn.dwellir.com
    ```

    ---

    IBP1

    ```
    wss://rpc.ibp.network/polkadot
    ```

    ---

    IBP2

    ```
    wss://polkadot.dotters.network
    ```

    ---

    LuckyFriday

    ```
    wss://rpc-polkadot.luckyfriday.io
    ```

    ---

    OnFinality

    ```
    wss://polkadot.api.onfinality.io/public-ws
    ```

    ---

    RadiumBlock

    ```
    wss://polkadot.public.curie.radiumblock.co/ws
    ```

    ---

    RockX

    ```
    wss://rockx-dot.w3node.com/polka-public-dot/ws
    ```

    ---

    Stakeworld

    ```
    wss://dot-rpc.stakeworld.io
    ```

    ---

    SubQuery

    ```
    wss://polkadot.rpc.subquery.network/public/ws
    ```

    ---

    Light client

    ```
    light://substrate-connect/polkadot
    ```

### Kusama

Kusama is a network built as a risk-taking, fast-moving "canary in the coal mine" for its cousin Polkadot. As it is built on top of the same infrastructure, Kusama often acts as a final testing ground for new features before they are launched on Polkadot. Unlike true TestNets, however, the Kusama KSM native token does have economic value. This incentive encourages participants to maintain this robust and performant structure for the benefit of the community.

=== "Network Details"

    **Currency symbol**: `KSM`

    ---

    **Currency decimals**: 12

    ---
    
    **Block explorer**: [Kusama Subscan](https://kusama.subscan.io/){target=\_blank}

=== "RPC Endpoints"

    Dwellir

    ```
    wss://kusama-rpc.dwellir.com
    ```

    ---

    Dwellir Tunisia

    ```
    wss://kusama-rpc-tn.dwellir.com
    ```

    ---

    IBP1

    ```
    wss://rpc.ibp.network/kusama
    ```

    ---

    IBP2

    ```
    wss://kusama.dotters.network
    ```

    ---

    LuckyFriday

    ```
    wss://rpc-kusama.luckyfriday.io
    ```

    ---

    OnFinality

    ```
    wss://kusama.api.onfinality.io/public-ws
    ```

    ---

    RadiumBlock

    ```
    wss://kusama.public.curie.radiumblock.co/ws
    ```

    ---

    RockX

    ```
    wss://rockx-ksm.w3node.com/polka-public-ksm/ws
    ```

    ---

    Stakeworld

    ```
    wss://rockx-ksm.w3node.com/polka-public-ksm/ws
    ```

    ---

    Light client

    ```
    light://substrate-connect/kusama
    ```

## Test Networks

### Westend

Westend is the primary test network that mirrors Polkadot's functionality for protocol-level feature development. As a true TestNet, the WND native token intentionally does not have any economic value. Use the faucet information in the following section to obtain WND tokens.

=== "Network Information"

    **Currency symbol**: `WND`

    ---

    **Currency decimals**: 12

    ---
    
    **Block explorer**: [Westend Subscan](https://westend.subscan.io/){target=\_blank}

    ---

    **Faucet**: [Official Westend faucet](https://faucet.polkadot.io/westend){target=\_blank}


=== "RPC Endpoints"

    Dwellir

    ```
    wss://westend-rpc.dwellir.com
    ```

    ---

    Dwellir Tunisia

    ```
    wss://westend-rpc-tn.dwellir.com
    ```

    ---

    IBP1

    ```
    wss://rpc.ibp.network/westend
    ```

    ---

    IBP2

    ```
    wss://westend.dotters.network
    ```

    ---

    OnFinality

    ```
    wss://westend.api.onfinality.io/public-ws
    ```

    ---

    Parity

    ```
    wss://westend-rpc.polkadot.io
    ```

    ---

    Light client

    ```
    light://substrate-connect/westend
    ```

### Paseo

Paseo is a decentralised, community run, stable testnet for parachain and dapp developers to build and test their applications. Unlike Westend, Paseo is not intended for protocol-level testing. As a true TestNet, the PAS native token intentionally does not have any economic value. Use the faucet information in the following section to obtain PAS tokens.

=== "Network Information"

    **Currency symbol**: `PAS`

    ---

    **Currency decimals**: 10

    ---
    
    **Block explorer**: [Paseo Subscan](https://paseo.subscan.io/){target=\_blank}

    ---

    **Faucet**: [Official Paseo faucet](https://faucet.polkadot.io/){target=\_blank}

=== "RPC Endpoints"

    Amforc
    
    ```
    wss://paseo.rpc.amforc.com
    ```
    
    ---
    
    Dwellir
    
    ```
    wss://paseo-rpc.dwellir.com
    ```
    
    ---
    
    IBP1
    
    ```
    wss://rpc.ibp.network/paseo
    ```
    
    ---
    
    IBP2
    
    ```
    wss://paseo.dotters.network
    ```
    
    ---
    
    StakeWorld
    
    ```
    wss://pas-rpc.stakeworld.io
    ```

## Additional Resources

- [**Polkadot Fellowship runtimes repository**](https://github.com/polkadot-fellows/runtimes){target=\_blank}: Find a collection of runtimes for Polkadot, Kusama, and their system-parachains as maintained by the community via the [Polkadot Technical Fellowship](https://wiki.polkadot.com/learn/learn-polkadot-technical-fellowship/){target=\_blank}.


---

Page Title: Networks for Polkadot Hub Smart Contracts

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-networks.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/networks/
- Summary: Explore the available networks for smart contract development on Polkadot Hub, including Westend Hub, Kusama Hub, and Polkadot Hub.

# Networks

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Polkadot Hub provides smart contract functionality across multiple networks to facilitate smart contract development in the Polkadot ecosystem. Whether you're testing new contracts or deploying to production, Polkadot Hub offers several network environments tailored for each stage of development. Developers can thoroughly test, iterate, and validate their smart contracts from local testing environments to production networks like Polkadot Hub.

This guide will introduce you to the current and upcoming networks available for smart contract development and explain how they fit into the development workflow.

## Network Overview

Smart contract development on Polkadot Hub follows a structured process to ensure rigorous testing of new contracts and upgrades before deployment on production networks. Development progresses through a well-defined path, beginning with local environments, advancing through TestNets, and ultimately reaching MainNets. The diagram below illustrates this progression:

``` mermaid
flowchart LR
    id1[Local Polkadot Hub] --> id2[TestNet Polkadot Hub] --> id4[MainNet Polkadot Hub]
```

This progression ensures developers can thoroughly test and iterate their smart contracts without risking real tokens or affecting production networks. A typical development journey consists of three main stages:

1. Local development:

    - Developers start in a local environment to create, test, and iterate on smart contracts.
    - Provides rapid experimentation in an isolated setup without external dependencies.

2. TestNet development:

    - Contracts move to TestNets like Westend Hub and Passet Hub.
    - Enables testing in simulated real-world conditions without using real tokens.

3. Production deployment:

    - Final deployment to MainNets like Kusama Hub and Polkadot Hub.
    - Represents the live environment where contracts interact with real economic value.

## Local Development

The local development environment is crucial for smart contract development on Polkadot Hub. It provides developers a controlled space for rapid testing and iteration before moving to public networks. The local setup consists of several key components:

- **[Kitchensink node](https://paritytech.github.io/polkadot-sdk/master/kitchensink_runtime/index.html){target=\_blank}**: A local node that can be run for development and testing. It includes logging capabilities for debugging contract execution and provides a pre-configured development environment with pre-funded accounts for testing purposes.
- **[Ethereum RPC proxy](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/index.html){target=\_blank}**: Bridges Ethereum-compatible tools with the Polkadot SDK-based network. It enables seamless integration with popular development tools like MetaMask and Remix IDE. The purpose of this component is to translate Ethereum RPC calls into Substrate format.

## Test Networks

The following test networks provide controlled environments for testing smart contracts. TestNet tokens are available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. They provide a stable environment for testing your contracts without using real tokens.

``` mermaid
flowchart TB
    id1[Polkadot Hub TestNets] --> id2[Passet Hub]
    id1[Polkadot Hub TestNets] --> id3[Westend Hub]
```

### Passet Hub

The Passet Hub will be a community-managed TestNet designed specifically for smart contract development. It will mirror Asset Hub's runtime and provide developers with an additional environment for testing their contracts before deployment to production networks.

### Westend Hub

Westend Hub is the TestNet for smart contract development and its cutting-edge features. The network maintains the same features and capabilities as the production Polkadot Hub, and also incorporates the latest features developed by core developers.

## Production Networks

The MainNet environments represent the final destination for thoroughly tested and validated smart contracts, where they operate with real economic value and serve actual users.

``` mermaid
flowchart TB
    id1[Polkadot Hub MainNets] --> id2[Polkadot Hub]
    id1[Polkadot Hub MainNets] --> id3[Kusama Hub]
```

### Polkadot Hub

Polkadot Hub is the primary production network for deploying smart contracts in the Polkadot ecosystem. It provides a secure and stable environment for running smart contracts with real economic value. The network supports PolkaVM-compatible contracts written in Solidity or Rust, maintaining compatibility with Ethereum-based development tools.

### Kusama Hub

Kusama Hub is the canary version of Polkadot Hub. It is designed for developers who want to move quickly and test their smart contracts in a real-world environment with economic incentives. It provides a more flexible space for innovation while maintaining the same core functionality as Polkadot Hub.


---

Page Title: Offenses and Slashes

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-staking-mechanics-offenses-and-slashes.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/staking-mechanics/offenses-and-slashes/
- Summary: Learn about how Polkadot discourages validator misconduct via an offenses and slashing system, including details on offenses and their consequences.

# Offenses and Slashes

## Introduction

In Polkadot's Nominated Proof of Stake (NPoS) system, validator misconduct is deterred through a combination of slashing, disabling, and reputation penalties. Validators and nominators who stake tokens face consequences for validator misbehavior, which range from token slashes to restrictions on network participation.

This page outlines the types of offenses recognized by Polkadot, including block equivocations and invalid votes, as well as the corresponding penalties. While some parachains may implement additional custom slashing mechanisms, this guide focuses on the offenses tied to staking within the Polkadot ecosystem.

## Offenses

Polkadot is a public permissionless network. As such, it has a mechanism to disincentivize offenses and incentivize good behavior. You can review the [parachain protocol](https://wiki.polkadot.com/learn/learn-parachains-protocol/#parachain-protocol){target=\_blank} to understand better the terminology used to describe offenses. Polkadot validator offenses fall into two categories: invalid votes and equivocations. 

### Invalid Votes

A validator will be penalized for inappropriate voting activity during the block inclusion and approval processes. The invalid voting related offenses are as follows:

- **Backing an invalid block**: A para-validator backs an invalid block for inclusion in a fork of the relay chain.
- **`ForInvalid` vote**: When acting as a secondary checker, the validator votes in favor of an invalid block.
- **`AgainstValid` vote**: When acting as a secondary checker, the validator votes against a valid block. This type of vote wastes network resources required to resolve the disparate votes and resulting dispute.

### Equivocations

Equivocation occurs when a validator produces statements that conflict with each other when producing blocks or voting. Unintentional equivocations usually occur when duplicate signing keys reside on the validator host. If keys are never duplicated, the probability of an honest equivocation slash decreases to near zero. The equivocation related offenses are as follows:

- **Equivocation**: The validator produces two or more of the same block or vote.
    - **GRANDPA and BEEFY equivocation**: The validator signs two or more votes in the same round on different chains.
    - **BABE equivocation**: The validator produces two or more blocks on the relay chain in the same time slot.
- **Double seconded equivocation**: The validator attempts to second, or back, more than one block in the same round.
- **Seconded and valid equivocation**: The validator seconds, or backs, a block and then attempts to hide their role as the responsible backer by later placing a standard validation vote.

## Penalties

On Polkadot, offenses to the network incur different penalties depending on severity. There are three main penalties: slashing, disabling, and reputation changes.

### Slashing

Validators engaging in bad actor behavior in the network may be subject to slashing if they commit a qualifying offense. When a validator is slashed, they and their nominators lose a percentage of their staked DOT or KSM, from as little as 0.01% up to 100% based on the severity of the offense. Nominators are evaluated for slashing against their active validations at any given time. Validator nodes are evaluated as discrete entities, meaning an operator can't attempt to mitigate the offense on another node they operate in order to avoid a slash. 

Any slashed DOT or KSM will be added to the [Treasury](https://wiki.polkadot.com/learn/learn-polkadot-opengov-treasury/){target=\_blank} rather than burned or distributed as rewards. Moving slashed funds to the Treasury allows tokens to be quickly moved away from malicious validators while maintaining the ability to revert faulty slashes when needed.

A nominator with a very large bond may nominate several validators in a single era. In this case, a slash is proportionate to the amount staked to the offending validator. Stake allocation and validator activation is controlled by the [Phragmén algorithm](https://wiki.polkadot.com/learn/learn-phragmen/#algorithm){target=\_blank}.

A validator slash creates an `unapplied` state transition. You can view pending slashes on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/staking/slashes){target=\_blank}. The UI will display the slash per validator, the affected nominators, and the slash amounts. The unapplied state includes a 27-day grace period during which a governance proposal can be made to reverse the slash. Once this grace period expires, the slash is applied.

#### Equivocation Slash

The Web3 Foundation's [Slashing mechanisms](https://research.web3.foundation/Polkadot/security/slashing/amounts){target=\_blank} page provides guidelines for evaluating the security threat level of different offenses and determining penalties proportionate to the threat level of the offense. Offenses requiring coordination between validators or extensive computational costs to the system will typically call for harsher penalties than those more likely to be unintentional than malicious. A description of potential offenses for each threat level and the corresponding penalties is as follows:

- **Level 1**: Honest misconduct such as isolated cases of unresponsiveness.
    - **Penalty**: Validator can be kicked out or slashed up to 0.1% of stake in the validator slot.
- **Level 2**: Misconduct that can occur honestly but is a sign of bad practices. Examples include repeated cases of unresponsiveness and isolated cases of equivocation.
    - **Penalty**: Slash of up to 1% of stake in the validator slot.
- **Level 3**: Misconduct that is likely intentional but of limited effect on the performance or security of the network. This level will typically include signs of coordination between validators. Examples include repeated cases of equivocation or isolated cases of unjustified voting on GRANDPA.
    - **Penalty**: Reduction in networking reputation metrics, slash of up to 10% of stake in the validator slot.
- **Level 4**: Misconduct that poses severe security or monetary risk to the system or mass collusion. Examples include signs of extensive coordination, creating a serious security risk to the system, or forcing the system to use extensive resources to counter the misconduct.
    - **Penalty**: Slash of up to 100% of stake in the validator slot.

See the next section to understand how slash amounts for equivocations are calculated. If you want to know more details about slashing, please look at the research page on [Slashing mechanisms](https://research.web3.foundation/Polkadot/security/slashing/amounts){target=\_blank}.

#### Slash Calculation for Equivocation

The slashing penalty for GRANDPA, BABE, and BEEFY equivocations is calculated using the formula below, where `x` represents the number of offenders and `n` is the total number of validators in the active set:

```text
min((3 * x / n )^2, 1)
```

The following scenarios demonstrate how this formula means slash percentages can increase exponentially based on the number of offenders involved compared to the size of the validator pool:

- **Minor offense**: Assume 1 validator out of a 100 validator active set equivocates in a slot. A single validator committing an isolated offense is most likely a mistake rather than malicious attack on the network. This offense results in a 0.09% slash to the stake in the validator slot.

    ``` mermaid
    flowchart LR
    N["Total Validators = 100"]
    X["Offenders = 1"]
    F["min((3 * 1 / 100)^2, 1) = 0.0009"]
    G["0.09% slash of stake"]

    N --> F
    X --> F
    F --> G
    ```

- **Moderate offense**: Assume 5 validators out a 100 validator active set equivocate in a slot. This is a slightly more serious event as there may be some element of coordination involved. This offense results in a 2.25% slash to the stake in the validator slot.

    ``` mermaid
    flowchart LR
    N["Total Validators = 100"]
    X["Offenders = 5"]
    F["min((3 * 5 / 100)^2, 1) = 0.0225"]
    G["2.25% slash of stake"]

    N --> F
    X --> F
    F --> G
    ```

- **Major offense**: Assume 20 validators out a 100 validator active set equivocate in a slot. This is a major security threat as it possible represents a coordinated attack on the network. This offense results in a 36% slash and all slashed validators will also be chilled.
    ``` mermaid
    flowchart LR
    N["Total Validators = 100"]
    X["Offenders = 20"]
    F["min((3 * 20 / 100)^2, 1) = 0.36"]
    G["36% slash of stake"]

    N --> F
    X --> F
    F --> G
    ```

The examples above show the risk of nominating or running many validators in the active set. While rewards grow linearly (two validators will get you approximately twice as many staking rewards as one), slashing grows exponentially. Going from a single validator equivocating to two validators equivocating causes a slash four time as much as the single validator.

Validators may run their nodes on multiple machines to ensure they can still perform validation work if one of their nodes goes down. Still, validator operators should be cautious when setting these up. Equivocation is possible if they don't coordinate well in managing signing machines.

#### Best Practices to Avoid Slashing

The following are advised to node operators to ensure that they obtain pristine binaries or source code and to ensure the security of their node:

- Always download either source files or binaries from the official Parity repository.
- Verify the hash of downloaded files.
- Use the W3F secure validator setup or adhere to its principles.
- Ensure essential security items are checked, use a firewall, manage user access, use SSH certificates.
- Avoid using your server as a general-purpose system. Hosting a validator on your workstation or one that hosts other services increases the risk of maleficence.
- Avoid cloning servers (copying all contents) when migrating to new hardware. If an image is needed, create it before generating keys.
- High Availability (HA) systems are generally not recommended as equivocation may occur if concurrent operations happen—such as when a failed server restarts or two servers are falsely online simultaneously.
- Copying the keystore folder when moving a database between instances can cause equivocation. Even brief use of duplicated keystores can result in slashing.

Below are some examples of small equivocations that happened in the past:

| Network  | Era  | Event Type         | Details                                                                                                                                                                                                                                                                                                                                                             | Action Taken                                                                                                                      |
|----------|------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Polkadot | 774  | Small Equivocation | [The validator](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io/$165562246360408hKCfC:matrix.org?via=matrix.parity.io&via=corepaper.org&via=matrix.org){target=\_blank} migrated servers and cloned the keystore folder. The on-chain event can be viewed on [Subscan](https://polkadot.subscan.io/extrinsic/11190109-0?event=11190109-5){target=\_blank}. | The validator didn't submit a request for the slash to be canceled.                                                               |
| Kusama   | 3329 | Small Equivocation | The validator operated a test machine with cloned keys. The test machine was online simultaneously as the primary, which resulted in a slash.                                                                                                                                                                                                                       | The validator requested a slash cancellation, but the council declined.                                                           |
| Kusama   | 3995 | Small Equivocation | The validator noticed several errors, after which the client crashed, and a slash was applied. The validator recorded all events and opened GitHub issues to allow for technical opinions to be shared.                                                                                                                                                             | The validator requested to cancel the slash. The council approved the request as they believed the error wasn't operator-related. |

#### Slashing Across Eras

There are three main difficulties to account for with slashing in NPoS:

- A nominator can nominate multiple validators and be slashed as a result of actions taken by any of them.
- Until slashed, the stake is reused from era to era.
- Slashable offenses can be found after the fact and out of order.

To balance this, the system applies only the maximum slash a participant can receive in a given time period rather than the sum. This ensures protection from excessive slashing.

### Disabling

The disabling mechanism is triggered when validators commit serious infractions, such as backing invalid blocks or engaging in equivocations. Disabling stops validators from performing specific actions after they have committed an offense. Disabling is further divided into:

- **On-chain disabling**: Lasts for a whole era and stops validators from authoring blocks, backing, and initiating a dispute.
- **Off-chain disabling**: Lasts for a session, is caused by losing a dispute, and stops validators from initiating a dispute.

Off-chain disabling is always a lower priority than on-chain disabling. Off-chain disabling prioritizes disabling first backers and then approval checkers.

The material in this guide reflects the changes introduced in Stage 4. For more details, see the [State of Disabling issue](https://github.com/paritytech/polkadot-sdk/issues/4359){target=\_blank} on GitHub.


### Reputation Changes

Some minor offenses, such as spamming, are only punished by networking reputation changes. Validators use a reputation metric when choosing which peers to connect with. The system adds reputation if a peer provides valuable data and behaves appropriately. If they provide faulty or spam data, the system reduces their reputation. If a validator loses enough reputation, their peers will temporarily close their channels to them. This helps in fighting against Denial of Service (DoS) attacks. Performing validator tasks under reduced reputation will be harder, resulting in lower validator rewards.

### Penalties by Offense

Refer to the Polkadot Wiki's [offenses page](https://wiki.polkadot.com/learn/learn-offenses/){target=\_blank} for a summary of penalties for specific offenses.


---

Page Title: Pause Validating

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-operational-tasks-pause-validating.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/operational-tasks/pause-validating/
- Summary: Learn how to temporarily pause staking activity in Polkadot using the chill extrinsic, with guidance for validators and nominators.

# Pause Validating

## Introduction

If you need to temporarily stop participating in Polkadot staking activities without fully unbonding your funds, chilling your account allows you to do so efficiently. Chilling removes your node from active validation or nomination in the next era while keeping your funds bonded, making it ideal for planned downtimes or temporary pauses.

This guide covers the steps for chilling as a validator or nominator, using the `chill` and `chillOther` extrinsics, and how these affect your staking status and nominations.

## Chilling Your Node

If you need to temporarily step back from staking without unbonding your funds, you can "chill" your account. Chilling pauses your active staking participation, setting your account to inactive in the next era while keeping your funds bonded.

To chill your account, go to the **Network > Staking > Account Actions** page on [Polkadot.js Apps](https://polkadot.js.org/apps){target=\_blank}, and select **Stop**. Alternatively, you can call the [`chill`](https://paritytech.github.io/polkadot-sdk/master/pallet_staking/enum.Call.html#variant.chill){target=\_blank} extrinsic in the Staking pallet. 

## Staking Election Timing Considerations

When a node actively participates in staking but then chills, it will continue contributing for the remainder of the current era. However, its eligibility for the next election depends on the chill status at the start of the new era:

- **Chilled during previous era**: Will not participate in the current era election and will remain inactive until reactivated.
-**Chilled during current era**: Will not be selected for the next era's election.
-**Chilled after current era**: May be selected if it was active during the previous era and is now chilled.

## Chilling as a Nominator

When you choose to chill as a nominator, your active nominations are reset. Upon re-entering the nominating process, you must reselect validators to support manually. Depending on preferences, these can be the same validators as before or a new set. Remember that your previous nominations won’t be saved or automatically reactivated after chilling.

While chilled, your nominator account remains bonded, preserving your staked funds without requiring a full unbonding process. When you’re ready to start nominating again, you can issue a new nomination call to activate your bond with a fresh set of validators. This process bypasses the need for re-bonding, allowing you to maintain your stake while adjusting your involvement in active staking.

## Chilling as a Validator

When you chill as a validator, your active validator status is paused. Although your nominators remain bonded to you, the validator bond will no longer appear as an active choice for new or revised nominations until reactivated. Any existing nominators who take no action will still have their stake linked to the validator, meaning they don’t need to reselect the validator upon reactivation. However, if nominators adjust their stakes while the validator is chilled, they will not be able to nominate the chilled validator until it resumes activity.

Upon reactivating as a validator, you must also reconfigure your validator preferences, such as commission rate and other parameters. These can be set to match your previous configuration or updated as desired. This step is essential for rejoining the active validator set and regaining eligibility for nominations.

## Chill Other

Historical constraints in the runtime prevented unlimited nominators and validators from being supported. These constraints created a need for checks to keep the size of the staking system manageable. One of these checks is the `chillOther` extrinsic, allowing users to chill accounts that no longer met standards such as minimum staking requirements set through on-chain governance.

This control mechanism included a `ChillThreshold`, which was structured to define how close to the maximum number of nominators or validators the staking system would be allowed to get before users could start chilling one another. With the passage of [Referendum #90](https://polkadot-old.polkassembly.io/referendum/90){target=\_blank}, the value for `maxNominatorCount` on Polkadot was set to `None`, effectively removing the limit on how many nominators and validators can participate. This means the `ChillThreshold` will never be met; thus, `chillOther` no longer has any effect.


---

Page Title: PolkaVM Design

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-polkavm-design.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/polkavm-design/
- Summary: Discover PolkaVM, a high-performance smart contract VM for Polkadot, enabling Ethereum compatibility via pallet_revive, Solidity support & optimized execution.

# PolkaVM Design

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

The Asset Hub smart contracts solution includes multiple components to ensure Ethereum compatibility and high performance. Its architecture allows for integration with current Ethereum tools, while its innovative virtual machine design enhances performance characteristics.

## PolkaVM

[**PolkaVM**](https://github.com/paritytech/polkavm){target=\_blank} is a custom virtual machine optimized for performance with [RISC-V-based](https://en.wikipedia.org/wiki/RISC-V){target=\_blank} architecture, supporting Solidity and additional high-performance languages. It serves as the core execution environment, integrated directly within the runtime. It features:

- An efficient interpreter for immediate code execution.
- A planned JIT compiler for optimized performance.
- Dual-mode execution capability, allowing selection of the most appropriate backend for specific workloads.
- Optimized performance for short-running contract calls through the interpreter.

The interpreter remains particularly beneficial for contracts with minimal code execution, as it eliminates JIT compilation overhead and enables immediate code execution through lazy interpretation.

## Architecture

The smart contract solution consists of the following key components that work together to enable Ethereum compatibility on Polkadot-based chains.

### Pallet Revive

[**`pallet_revive`**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} is a runtime module that executes smart contracts by adding extrinsics, runtime APIs, and logic to convert Ethereum-style transactions into formats compatible with Polkadot SDK-based blockchains. It processes Ethereum-style transactions through the following workflow:

```mermaid
sequenceDiagram
    participant User as User/dApp
    participant Proxy as Ethereum JSON RPC Proxy
    participant Chain as Blockchain Node
    participant Pallet as pallet_revive
    
    User->>Proxy: Submit Ethereum Transaction
    Proxy->>Chain: Repackage as Polkadot Compatible Transaction
    Chain->>Pallet: Process Transaction
    Pallet->>Pallet: Decode Ethereum Transaction
    Pallet->>Pallet: Execute Contract via PolkaVM
    Pallet->>Chain: Return Results
    Chain->>Proxy: Forward Results
    Proxy->>User: Return Ethereum-compatible Response
```

This proxy-based approach eliminates the need for node binary modifications, maintaining compatibility across different client implementations. Preserving the original Ethereum transaction payload simplifies adapting existing tools, which can continue processing familiar transaction formats.

### PolkaVM Design Fundamentals

PolkaVM introduces two fundamental architectural differences compared to the Ethereum Virtual Machine (EVM):

```mermaid
flowchart TB
    subgraph "EVM Architecture"
        EVMStack[Stack-Based]
        EVM256[256-bit Word Size]
    end
    
    subgraph "PolkaVM Architecture"
        PVMReg[Register-Based]
        PVM64[64-bit Word Size]
    end
```

- **Register-based design**: PolkaVM utilizes a RISC-V register-based approach. This design:

    - Employs a finite set of registers for argument passing instead of an infinite stack.
    - Facilitates efficient translation to underlying hardware architectures.
    - Optimizes register allocation through careful register count selection.
    - Enables simple 1:1 mapping to x86-64 instruction sets.
    - Reduces compilation complexity through strategic register limitation.
    - Improves overall execution performance through hardware-aligned design.

- **64-bit word size**: PolkaVM operates with a 64-bit word size. This design:

    - Enables direct hardware-supported arithmetic operations.
    - Maintains compatibility with Solidity's 256-bit operations through YUL translation.
    - Allows integration of performance-critical components written in lower-level languages.
    - Optimizes computation-intensive operations through native word size alignment.
    - Reduces overhead for operations not requiring extended precision.
    - Facilitates efficient integration with modern CPU architectures.

## Compilation Process

When compiling a Solidity smart contract, the code passes through the following stages:

```mermaid
flowchart LR
    Dev[Developer] --> |Solidity<br>Source<br>Code| Solc
    
    subgraph "Compilation Process"
        direction LR
        Solc[solc] --> |YUL<br>IR| Revive
        Revive[Revive Compiler] --> |LLVM<br>IR| LLVM
        LLVM[LLVM<br>Optimizer] --> |RISC-V ELF<br>Shared Object| PVMLinker
    end
    
    PVMLinker[PVM Linker] --> PVM[PVM Blob<br>with Metadata]
```

The compilation process integrates several specialized components:

1. **Solc**: The standard Ethereum Solidity compiler that translates Solidity source code to [YUL IR](https://docs.soliditylang.org/en/latest/yul.html){target=\_blank}.
2. **Revive Compiler**: Takes YUL IR and transforms it to [LLVM IR](https://llvm.org/){target=\_blank}.
3. **LLVM**: A compiler infrastructure that optimizes the code and generates RISC-V ELF objects.
4. **PVM linker**: Links the RISC-V ELF object into a final PolkaVM blob with metadata.


---

Page Title: Rewards Payout

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-staking-mechanics-rewards-payout.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/staking-mechanics/rewards-payout/
- Summary: Learn how validator rewards work on the network, including era points, payout distribution, running multiple validators, and nominator payments.

# Rewards Payout

## Introduction

Understanding how rewards are distributed to validators and nominators is essential for network participants. In Polkadot and Kusama, validators earn rewards based on their era points, which are accrued through actions like block production and parachain validation.

This guide explains the payout scheme, factors influencing rewards, and how multiple validators affect returns. Validators can also share rewards with nominators, who contribute by staking behind them. By following the payout mechanics, validators can optimize their earnings and better engage with their nominators.

## Era Points

The Polkadot ecosystem measures its reward cycles in a unit called an era. Kusama eras are approximately 6 hours long, and Polkadot eras are 24 hours long. At the end of each era, validators are paid proportionally to the amount of [era points](/infrastructure/staking-mechanics/rewards-payout/#era-points){target=\_blank} they have collected. Era points are reward points earned for payable actions like:

- Issuing validity statements for [parachain blocks](/polkadot-protocol/parachain-basics/blocks-transactions-fees/blocks/){target=\_blank}.
- Producing a non-uncle block in the relay chain.
- Producing a reference to a previously unreferenced uncle block.
- Producing a referenced uncle block.

An uncle block is a relay chain block that is valid in every regard but has failed to become canonical. This can happen when two or more validators are block producers in a single slot, and the block produced by one validator reaches the next block producer before the others. The lagging blocks are called uncle blocks.

## Reward Variance

Rewards in Polkadot and Kusama staking systems can fluctuate due to differences in era points earned by para-validators and non-para-validators. Para-validators generally contribute more to the overall reward distribution due to their role in validating parachain blocks, thus influencing the variance in staking rewards.

To illustrate this relationship:

- Para-validator era points tend to have a higher impact on the expected value of staking rewards compared to non-para-validator points.
- The variance in staking rewards increases as the total number of validators grows relative to the number of para-validators.
- In simpler terms, when more validators are added to the active set without increasing the para-validator pool, the disparity in rewards between validators becomes more pronounced.

However, despite this increased variance, rewards tend to even out over time due to the continuous rotation of para-validators across eras. The network's design ensures that over multiple eras, each validator has an equal opportunity to participate in para-validation, eventually leading to a balanced distribution of rewards.

??? interface "Probability in Staking Rewards"

    This should only serve as a high-level overview of the probabilistic nature for staking rewards.

    Let:

    - `pe` = para-validator era points
    - `ne` = non-para-validator era points
    - `EV` = expected value of staking rewards

    Then, `EV(pe)` has more influence on the `EV` than `EV(ne)`.

    Since `EV(pe)` has a more weighted probability on the `EV`, the increase in variance against the `EV` becomes apparent between the different validator pools (aka. validators in the active set and the ones chosen to para-validate).

    Also, let:

    - `v` = the variance of staking rewards
    - `p` = number of para-validators
    - `w` = number validators in the active set
    - `e` = era

    Then, `v` &#8593; if `w` &#8593;, as this reduces `p` : `w`, with respect to `e`.

    Increased `v` is expected, and initially keeping `p` &#8595; using the same para-validator set for all parachains ensures [availability](https://spec.polkadot.network/chapter-anv){target=\_blank} and [voting](https://wiki.polkadot.com/learn/learn-polkadot-opengov/){target=\_blank}. In addition, despite `v` &#8593; on an `e` to `e` basis, over time, the amount of rewards each validator receives will equal out based on the continuous selection of para-validators.

    There are plans to scale the active para-validation set in the future.

## Payout Scheme

Validator rewards are distributed equally among all validators in the active set, regardless of the total stake behind each validator. However, individual payouts may differ based on the number of era points a validator has earned. Although factors like network connectivity can affect era points, well-performing validators should accumulate similar totals over time.

Validators can also receive tips from users, which incentivize them to include certain transactions in their blocks. Validators retain 100% of these tips.

Rewards are paid out in the network's native token (DOT for Polkadot and KSM for Kusama). 

The following example illustrates a four member validator set with their names, amount they have staked, and how payout of rewards is divided. This scenario assumes all validators earned the same amount of era points and no one received tips: 

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D
```

Note that this is different than most other Proof of Stake (PoS) systems. As long as a validator is in the validator set, it will receive the same block reward as every other validator. Validator Alice, who had 18 DOT staked, received the same 2 DOT reward in this era as Dave, who had only 7 DOT staked.

## Running Multiple Validators

Running multiple validators can offer a more favorable risk/reward ratio compared to running a single one. If you have sufficient DOT or nominators staking on your validators, maintaining multiple validators within the active set can yield higher rewards.

In the preceding section, with 18 DOT staked and no nominators, Alice earned 2 DOT in one era. This example uses DOT, but the same principles apply for KSM on the Kusama network. By managing stake across multiple validators, you can potentially increase overall returns. Recall the set of validators from the preceding section:

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D 
```

Now, assume Alice decides to split their stake and run two validators, each with a nine DOT stake. This validator set only has four spots and priority is given to validators with a larger stake. In this example, Dave has the smallest stake and loses his spot in the validator set. Now, Alice will earn two shares of the total payout each era as illustrated below:

``` mermaid
flowchart TD
    A["Alice (9 DOT)"]
    F["Alice (9 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> F 
```

With enough stake, you could run more than two validators. However, each validator must have enough stake behind it to maintain a spot in the validator set.

## Nominators and Validator Payments

A nominator's stake allows them to vote for validators and earn a share of the rewards without managing a validator node. Although staking rewards depend on validator activity during an era, validators themselves never control or own nominator rewards. To trigger payouts, anyone can call the `staking.payoutStakers` or `staking.payoutStakerByPage` methods, which mint and distribute rewards directly to the recipients. This trustless process ensures nominators receive their earned rewards.

Validators set a commission rate as a percentage of the block reward, affecting how rewards are shared with nominators. A 0% commission means the validator keeps only rewards from their self-stake, while a 100% commission means they retain all rewards, leaving none for nominators.

The following examples model splitting validator payments between nominator and validator using various commission percentages. For simplicity, these examples assume a Polkadot-SDK based relay chain that uses DOT as a native token and a single nominator per validator. Calculations of KSM reward payouts for Kusama follow the same formula. 

Start with the original validator set from the previous section: 

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D 
```

The preceding diagram shows each validator receiving a 2 DOT payout, but doesn't account for sharing rewards with nominators. The following diagram shows what nominator payout might look like for validator Alice. Alice has a 20% commission rate and holds 50% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    E["Commission = 20%"]
    F["Alice Validator Payment = 0.4 DOT"]
    G["Total Stake Rewards = 1.6 DOT"]
    B["Alice Validator Stake = 18 DOT"]
    C["9 DOT Alice (50%)"]
    H["Alice Stake Reward = 0.8 DOT"]
    I["Total Alice Validator Reward = 1.2 DOT"]
    D["9 DOT Nominator (50%)"]
    J["Total Nominator Reward = 0.8 DOT"]
    
    A --> E
    E --(2 x 0.20)--> F
    F --(2 - 0.4)--> G
    B --> C
    B --> D
    C --(1.6 x 0.50)--> H
    H --(0.4 + 0.8)--> I
    D --(1.60 x 0.50)--> J
```

Notice the validator commission rate is applied against the gross amount of rewards for the era. The validator commission is subtracted from the total rewards. After the commission is paid to the validator, the remaining amount is split among stake owners according to their percentage of the total stake. A validator's total rewards for an era include their commission plus their piece of the stake rewards. 

Now, consider a different scenario for validator Bob where the commission rate is 40%, and Bob holds 33% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    E["Commission = 40%"]
    F["Bob Validator Payment = 0.8 DOT"]
    G["Total Stake Rewards = 1.2 DOT"]
    B["Bob Validator Stake = 9 DOT"]
    C["3 DOT Bob (33%)"]
    H["Bob Stake Reward = 0.4 DOT"]
    I["Total Bob Validator Reward = 1.2 DOT"]
    D["6 DOT Nominator (67%)"]
    J["Total Nominator Reward = 0.8 DOT"]
    
    A --> E
    E --(2 x 0.4)--> F
    F --(2 - 0.8)--> G
    B --> C
    B --> D
    C --(1.2 x 0.33)--> H
    H --(0.8 + 0.4)--> I
    D --(1.2 x 0.67)--> J
```

Bob holds a smaller percentage of their node's total stake, making their stake reward smaller than Alice's. In this scenario, Bob makes up the difference by charging a 40% commission rate and ultimately ends up with the same total payment as Alice. Each validator will need to find their ideal balance between the amount of stake and commission rate to attract nominators while still making running a validator worthwhile.


---

Page Title: Send XCM Messages

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-send-messages.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/send-messages/
- Summary: Send cross-chain messages using XCM, Polkadot's Cross-Consensus Messaging format, designed to support secure communication between chains.

# Send XCM Messages

## Introduction

One of the core FRAME pallets that enables parachains to engage in cross-chain communication using the Cross-Consensus Message (XCM) format is [`pallet-xcm`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/index.html){target=\_blank}. It facilitates the sending, execution, and management of XCM messages, thereby allowing parachains to interact with other chains within the ecosystem. Additionally, `pallet-xcm`, also referred to as the XCM pallet, supports essential operations like asset transfers, version negotiation, and message routing.

This page provides a detailed overview of the XCM pallet's key features, its primary roles in XCM operations, and the main extrinsics it offers. Whether aiming to execute XCM messages locally or send them to external chains, this guide covers the foundational concepts and practical applications you need to know.

## XCM Frame Pallet Overview

The [`pallet-xcm`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/index.html){target=\_blank} provides a set of pre-defined, commonly used [XCVM programs](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#12-the-xcvm){target=\_blank} in the form of a [set of extrinsics](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/index.html){target=\blank}. This pallet provides some [default implementations](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/struct.Pallet.html#implementations){target=\_blank} for traits required by [`XcmConfig`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm_benchmarks/trait.Config.html#associatedtype.XcmConfig){target=\_blank}. The [XCM executor](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/struct.XcmExecutor.html){target=\_blank} is also included as an associated type within the pallet's configuration. 

For further details about the XCM configuration, see the [XCM Configuration](/develop/interoperability/xcm-config/){target=\_blank} page.

Where the [XCM format](https://github.com/polkadot-fellows/xcm-format){target=\_blank} defines a set of instructions used to construct XCVM programs, `pallet-xcm` defines a set of extrinsics that can be utilized to build XCVM programs, either to target the local or external chains. The `pallet-xcm` functionality is divided into three categories:

- **Primitive**: Dispatchable functions to execute XCM locally.
- **High-level**: Functions for asset transfers between chains.
- **Version negotiation-specific**: Functions for managing XCM version compatibility.

### Key Roles of the XCM Pallet

The XCM pallet plays a central role in managing cross-chain messages, with its primary responsibilities including:

- **Execute XCM messages**: Interacts with the XCM executor to validate and execute messages, adhering to predefined security and filter criteria.
- **Send messages across chains**: Allows authorized origins to send XCM messages, enabling controlled cross-chain communication.
- **Reserve-based transfers and teleports**: Supports asset movement between chains, governed by filters that restrict operations to authorized origins.
- **XCM version negotiation**: Ensures compatibility by selecting the appropriate XCM version for inter-chain communication.
- **Asset trapping and recovery**: Manages trapped assets, enabling safe reallocation or recovery when issues occur during cross-chain transfers.
- **Support for XCVM operations**: Oversees state and configuration requirements necessary for executing cross-consensus programs within the XCVM framework.

## Primary Extrinsics of the XCM Pallet

This page will highlight the two **Primary Primitive Calls** responsible for sending and executing XCVM programs as dispatchable functions within the pallet.

### Execute

The [`execute`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.execute){target=\_blank} call directly interacts with the XCM executor, allowing for the execution of XCM messages originating from a locally signed origin. The executor validates the message, ensuring it complies with any configured barriers or filters before executing.

Once validated, the message is executed locally, and an event is emitted to indicate the result—whether the message was fully executed or only partially completed. Execution is capped by a maximum weight ([`max_weight`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.execute.field.max_weight){target=\_blank}); if the required weight exceeds this limit, the message will not be executed.

```rust
pub fn execute<T: Config>(
    message: Box<VersionedXcm<<T as Config>::RuntimeCall>>,
    max_weight: Weight,
)
```

For further details about the `execute` extrinsic, see the [`pallet-xcm` documentation](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/struct.Pallet.html){target=\_blank}.

!!!warning
    Partial execution of messages may occur depending on the constraints or barriers applied.



### Send

The [`send`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.send){target=\_blank} call enables XCM messages to be sent to a specified destination. This could be a parachain, smart contract, or any external system governed by consensus. Unlike the execute call, the message is not executed locally but is transported to the destination chain for processing.

The destination is defined using a [Location](https://paritytech.github.io/polkadot-sdk/master/xcm_docs/glossary/index.html#location){target=\_blank}, which describes the target chain or system. This ensures precise delivery through the configured XCM transport mechanism.

```rust
pub fn send<T: Config>(
    dest: Box<MultiLocation>,
    message: Box<VersionedXcm<<T as Config>::RuntimeCall>>,
)
```

For further information about the `send` extrinsic, see the [`pallet-xcm` documentation](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/struct.Pallet.html){target=\_blank}.



## XCM Router

The [`XcmRouter`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/trait.Config.html#associatedtype.XcmRouter){target=\_blank} is a critical component the XCM pallet requires to facilitate sending XCM messages. It defines where messages can be sent and determines the appropriate XCM transport protocol for the operation.

For instance, the Kusama network employs the [`ChildParachainRouter`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_common/xcm_sender/struct.ChildParachainRouter.html){target=\_blank}, which restricts routing to [Downward Message Passing (DMP)](https://wiki.polkadot.com/learn/learn-xcm-transport/#dmp-downward-message-passing){target=\_blank} from the relay chain to parachains, ensuring secure and controlled communication.

```rust
pub type PriceForChildParachainDelivery =
	ExponentialPrice<FeeAssetId, BaseDeliveryFee, TransactionByteFee, Dmp>;
```

For more details about XCM transport protocols, see the [XCM Channels](/develop/interoperability/xcm-channels/){target=\_blank} page.


---

Page Title: Set Up a Bootnode

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-node-setup-bootnode.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-node/setup-bootnode/
- Summary: Learn how to configure and run a bootnode for Polkadot, including P2P, WS, and secure WSS connections with network key management and proxies.

# Set Up a Bootnode

## Introduction

Bootnodes are essential for helping blockchain nodes discover peers and join the network. When a node starts, it needs to find other nodes, and bootnodes provide an initial point of contact. Once connected, a node can expand its peer connections and play its role in the network, like participating as a validator.

This guide will walk you through setting up a Polkadot bootnode, configuring P2P, WebSocket (WS), secure WSS connections, and managing network keys. You'll also learn how to test your bootnode to ensure it is running correctly and accessible to other nodes.

## Prerequisites

Before you start, you need to have the following prerequisites:

- Verify a working Polkadot (`polkadot`) binary is available on your machine.
- Ensure you have nginx installed. Please refer to the [Installation Guide](https://nginx.org/en/docs/install.html){target=\_blank} for help with installation if needed.
- A VPS or other dedicated server setup.

## Accessing the Bootnode

Bootnodes must be accessible through three key channels to connect with other nodes in the network:

- **P2P**: A direct peer-to-peer connection, set by.

    ```bash

    --listen-addr /ip4/0.0.0.0/tcp/INSERT_PORT

    ```
    
    This is not enabled by default on non-validator nodes like archive RPC nodes.

- **P2P/WS**: A WebSocket (WS) connection, also configured via `--listen-addr`.
- **P2P/WSS**: A secure WebSocket (WSS) connection using SSL, often required for light clients. An SSL proxy is needed, as the node itself cannot handle certificates.

## Node Key

A node key is the ED25519 key used by `libp2p` to assign your node an identity or peer ID. Generating a known node key for a bootnode is crucial, as it gives you a consistent key that can be placed in chain specifications as a known, reliable bootnode.

Starting a node creates its node key in the `chains/INSERT_CHAIN/network/secret_ed25519` file.

You can create a node key using:

 ``` bash
 polkadot key generate-node-key
 ``` 
 
This key can be used in the startup command line.

It is imperative that you backup the node key. If it is included in the `polkadot` binary, it is hardcoded into the binary, which must be recompiled to change the key.

## Running the Bootnode

A bootnode can be run as follows:

 ``` bash
 polkadot --chain polkadot \
 --name dot-bootnode \
 --listen-addr /ip4/0.0.0.0/tcp/30310 \
 --listen-addr /ip4/0.0.0.0/tcp/30311/ws
 ```

This assigns the p2p to port 30310 and p2p/ws to port 30311. For the p2p/wss port, a proxy must be set up with a DNS name and a corresponding certificate. The following example is for the popular nginx server and enables p2p/wss on port 30312 by adding a proxy to the p2p/ws port 30311:

``` conf title="/etc/nginx/sites-enabled/dot-bootnode"
server {
       listen       30312 ssl http2 default_server;
       server_name  dot-bootnode.stakeworld.io;
       root         /var/www/html;

       ssl_certificate "INSERT_YOUR_CERT";
       ssl_certificate_key "INSERT_YOUR_KEY";

       location / {
         proxy_buffers 16 4k;
         proxy_buffer_size 2k;
         proxy_pass http://localhost:30311;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "Upgrade";
         proxy_set_header Host $host;
   }

}
```

## Testing Bootnode Connection

If the preceding node is running with DNS name `dot-bootnode.stakeworld.io`, which contains a proxy with a valid certificate and node-id `12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg` then the following commands should output `syncing 1 peers`.

!!!tip
    You can add `-lsub-libp2p=trace` on the end to get libp2p trace logging for debugging purposes.

### P2P

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30310/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```

### P2P/WS

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30311/ws/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```

### P2P/WSS

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30312/wss/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```


---

Page Title: Set Up a Node

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-node-setup-full-node.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-node/setup-full-node/
- Summary: Learn how to install, configure, and run Polkadot nodes, including setting up different node types and connecting to the network.

# Set Up a Node

## Introduction

Running a node on Polkadot provides direct interaction with the network, enhanced privacy, and full control over RPC requests, transactions, and data queries. As the backbone of the network, nodes ensure decentralized data propagation, transaction validation, and seamless communication across the ecosystem.

Polkadot supports multiple node types, including pruned, archive, and light nodes, each suited to specific use cases. During setup, you can use configuration flags to choose the node type you wish to run.

This guide walks you through configuring, securing, and maintaining a node on Polkadot or any Polkadot SDK-based chain. It covers instructions for the different node types and how to safely expose your node's RPC server for external access. Whether you're building a local development environment, powering dApps, or supporting network decentralization, this guide provides all the essentials.

## Set Up a Node

Now that you're familiar with the different types of nodes, this section will walk you through configuring, securing, and maintaining a node on Polkadot or any Polkadot SDK-based chain.

### Prerequisites

Before getting started, ensure the following prerequisites are met:

- Ensure [Rust](https://www.rust-lang.org/tools/install){target=\_blank} is installed on your operating system.
- [Install the necessary dependencies for the Polkadot SDK](/develop/parachains/install-polkadot-sdk/){target=\_blank}.

!!! warning
    This setup is not recommended for validators. If you plan to run a validator, refer to the [Running a Validator](/infrastructure/running-a-validator/){target=\_blank} guide for proper instructions.

### Install and Build the Polkadot Binary

This section will walk you through installing and building the Polkadot binary for different operating systems and methods.

??? interface "macOS"

    To get started, update and configure the Rust toolchain by running the following commands:

    ```bash
    source ~/.cargo/env

    rustup default stable
    rustup update

    rustup update nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    rustup component add rust-src --toolchain stable-aarch64-apple-darwin
    ```

    You can verify your installation by running:

    ```bash
    rustup show
    rustup +nightly show
    ```

    You should see output similar to the following:

    <div id="termynal" data-termynal>
      <span data-ty="input"
        ><span class="file-path"></span>rustup show <br />
        rustup +nightly show</span
      >
      <span data-ty>active toolchain</span>
      <span data-ty>----------------</span>
      <span data-ty></span>
      <span data-ty>stable-aarch64-apple-darwin (default)</span>
      <span data-ty>rustc 1.82.0 (f6e511eec 2024-10-15)</span>
      <span data-ty></span>
      <span data-ty>active toolchain</span>
      <span data-ty>----------------</span>
      <span data-ty></span>
      <span data-ty>nightly-aarch64-apple-darwin (overridden by +toolchain on the command line) </span>
      <span data-ty>rustc 1.84.0-nightly (03ee48451 2024-11-18)</span>
      <span data-ty="input"><span class="file-path"></span></span>
    </div>

    Then, run the following commands to clone and build the Polkadot binary:
  
    ```bash
    git clone https://github.com/paritytech/polkadot-sdk polkadot-sdk
    cd polkadot-sdk
    cargo build --release
    ```

    Depending upon the specs of your machine, compiling the binary may take an hour or more. After building the Polkadot node from source, the executable binary will be located in the `./target/release/polkadot` directory.

??? interface "Windows"

    To get started, make sure that you have [WSL and Ubuntu](https://learn.microsoft.com/en-us/windows/wsl/install){target=\_blank} installed on your Windows machine.

    Once installed, you have a couple options for installing the Polkadot binary:

    - If Rust is installed, then `cargo` can be used similar to the macOS instructions.
    - Or, the instructions in the Linux section can be used.

??? interface "Linux (pre-built binary)"

    To grab the [latest release of the Polkadot binary](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}, you can use `wget`:

    ```bash
    wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-INSERT_VERSION/polkadot
    ```
    
    Ensure you note the executable binary's location, as you'll need to use it when running the start-up command. If you prefer, you can specify the output location of the executable binary with the `-O` flag, for example:

    ```bash
    wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-INSERT_VERSION/polkadot \
    - O /var/lib/polkadot-data/polkadot
    ```

    !!!tip
        The nature of pre-built binaries means that they may not work on your particular architecture or Linux distribution. If you see an error like `cannot execute binary file: Exec format error` it likely means the binary is incompatible with your system. You will either need to compile the binary or use [Docker](#use-docker).

    Ensure that you properly configure the permissions to make the Polkadot release binary executable:

    ```bash
    sudo chmod +x polkadot
    ```

??? interface "Linux (compile binary)"

    The most reliable (although perhaps not the fastest) way of launching a full node is to compile the binary yourself. Depending on your machine's specs, this may take an hour or more.

    To get started, run the following commands to configure the Rust toolchain:

    ```bash
    rustup default stable
    rustup update
    rustup update nightly
    rustup target add wasm32-unknown-unknown --toolchain nightly
    rustup target add wasm32-unknown-unknown --toolchain stable-x86_64-unknown-linux-gnu
    rustup component add rust-src --toolchain stable-x86_64-unknown-linux-gnu
    ```

    You can verify your installation by running:

    ```bash
    rustup show
    ```

    You should see output similar to the following:

    <div id="termynal" data-termynal>
      <span data-ty="input"
        ><span class="file-path"></span>rustup show <br />
        rustup +nightly show</span
      >
      <span data-ty>active toolchain</span>
      <span data-ty>----------------</span>
      <span data-ty></span>
      <span data-ty>stable-x86_64-unknown-linux-gnu (default)</span>
      <span data-ty>rustc 1.82.0 (f6e511eec 2024-10-15)</span>
    </div>

    Once Rust is configured, run the following commands to clone and build Polkadot:
  
    ```bash
    git clone https://github.com/paritytech/polkadot-sdk polkadot-sdk
    cd polkadot-sdk
    cargo build --release
    ```

    Compiling the binary may take an hour or more, depending on your machine's specs. After building the Polkadot node from the source, the executable binary will be located in the `./target/release/polkadot` directory.

??? interface "Linux (snap package)"

    Polkadot can be installed as a [snap package](https://snapcraft.io/polkadot){target=\_blank}. If you don't already have Snap installed, take the following steps to install it:

    ```bash
    sudo apt update
    sudo apt install snapd
    ```

    Install the Polkadot snap package:

    ```bash
    sudo snap install polkadot
    ```
    
    Before continuing on with the following instructions, check out the [Configure and Run Your Node](#configure-and-run-your-node) section to learn more about the configuration options.

    To configure your Polkadot node with your desired options, you'll run a command similar to the following:

    ```bash
    sudo snap set polkadot service-args="--name=MyName --chain=polkadot"
    ```

    Then to start the node service, run:

    ```bash
    sudo snap start polkadot
    ```

    You can review the logs to check on the status of the node: 

    ```bash
    snap logs polkadot -f
    ```

    And at any time, you can stop the node service:

    ```bash
    sudo snap stop polkadot
    ```

    You can optionally prevent the service from stopping when snap is updated with the following command:

    ```bash
    sudo snap set polkadot endure=true
    ```

### Use Docker

As an additional option, you can use Docker to run your node in a container. Doing this is more advanced, so it's best left up to those already familiar with Docker or who have completed the other set-up instructions in this guide. You can review the latest versions on [DockerHub](https://hub.docker.com/r/parity/polkadot/tags){target=\_blank}.

Be aware that when you run Polkadot in Docker, the process only listens on `localhost` by default. If you would like to connect to your node's services (RPC and Prometheus) you need to ensure that you run the node with the `--rpc-external`, and `--prometheus-external` commands.

```bash
docker run -p 9944:9944 -p 9615:9615 parity/polkadot:v1.16.2 --name "my-polkadot-node-calling-home" --rpc-external --prometheus-external
```

If you're running Docker on an Apple Silicon machine (e.g. M4), you'll need to adapt the command slightly:

```bash
docker run --platform linux/amd64 -p 9944:9944 -p 9615:9615 parity/polkadot:v1.16.2 --name "kearsarge-calling-home" --rpc-external --prometheus-external
```

## Configure and Run Your Node

Now that you've installed and built the Polkadot binary, the next step is to configure the start-up command depending on the type of node that you want to run. You'll need to modify the start-up command accordingly based on the location of the binary. In some cases, it may be located within the `./target/release/` folder, so you'll need to replace polkadot with `./target/release/polkadot` in the following commands.

Also, note that you can use the same binary for Polkadot as you would for Kusama or any other relay chain. You'll need to use the `--chain` flag to differentiate between chains.

If you aren't sure which type of node to run, see the [Types of Full Nodes](/infrastructure/running-a-node/#types-of-nodes){target=\_blank} section.

The base commands for running a Polkadot node are as follows:

=== "Default pruned node"

    This uses the default pruning value of the last 256 blocks:

    ```bash
    polkadot --chain polkadot \
    --name "INSERT_NODE_NAME"
    ```

=== "Custom pruned node"

    You can customize the pruning value, for example, to the last 1000 finalized blocks:

    ```bash
    polkadot --chain polkadot \
    --name INSERT_YOUR_NODE_NAME \
    --state-pruning 1000 \
    --blocks-pruning archive \
    --rpc-cors all \
    --rpc-methods safe
    ```

=== "Archive node"

    To support the full state, use the `archive` option:

    ```bash
    polkadot --chain polkadot \
    --name INSERT_YOUR_NODE_NAME \
    --state-pruning archive \
    --blocks-pruning archive \
    ```

If you want to run an RPC node, please refer to the following [RPC Configurations](#rpc-configurations) section.

To review a complete list of the available commands, flags, and options, you can use the `--help` flag:

```bash
polkadot --help
```

Once you've fully configured your start-up command, you can execute it in your terminal and your node will start [syncing](#sync-your-node).

### RPC Configurations

The node startup settings allow you to choose what to expose, how many connections to expose, and which systems should be granted access through the RPC server.

- You can limit the methods to use with `--rpc-methods`; an easy way to set this to a safe mode is `--rpc-methods safe`.
- You can set your maximum connections through `--rpc-max-connections`, for example, `--rpc-max-connections 200`.
- By default, localhost and Polkadot.js can access the RPC server. You can change this by setting `--rpc-cors`. To allow access from everywhere, you can use `--rpc-cors all`.

For a list of important flags when running RPC nodes, refer to the Parity DevOps documentation: [Important Flags for Running an RPC Node](https://paritytech.github.io/devops-guide/guides/rpc_index.html?#important-flags-for-running-an-rpc-node){target=\_blank}.

## Sync Your Node

The syncing process will take a while, depending on your capacity, processing power, disk speed, and RAM. The process may be completed on a $10 DigitalOcean droplet in about ~36 hours. While syncing, your node name should be visible in gray on Polkadot Telemetry, and once it is fully synced, your node name will appear in white on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/Polkadot){target=_blank}.

A healthy node syncing blocks will output logs like the following:

<div id="termynal" data-termynal>
  <span data-ty>2024-11-19 23:49:57 Parity Polkadot</span>
  <span data-ty>2024-11-19 23:49:57 ✌️ version 1.14.1-7c4cd60da6d</span>
  <span data-ty>2024-11-19 23:49:57 ❤️ by Parity Technologies &lt;admin@parity.io&gt;, 2017-2024</span>
  <span data-ty>2024-11-19 23:49:57 📋 Chain specification: Polkadot</span>
  <span data-ty>2024-11-19 23:49:57 🏷 Node name: myPolkadotNode</span>
  <span data-ty>2024-11-19 23:49:57 👤 Role: FULL</span>
  <span data-ty>2024-11-19 23:49:57 💾 Database: RocksDb at /home/ubuntu/.local/share/polkadot/chains/polkadot/db/full</span>
  <span data-ty>2024-11-19 23:50:00 🏷 Local node identity is: 12D3KooWDmhHEgPRJUJnUpJ4TFWn28EENqvKWH4dZGCN9TS51y9h</span>
  <span data-ty>2024-11-19 23:50:00 Running libp2p network backend</span>
  <span data-ty>2024-11-19 23:50:00 💻 Operating system: linux</span>
  <span data-ty>2024-11-19 23:50:00 💻 CPU architecture: x86_64</span>
  <span data-ty>2024-11-19 23:50:00 💻 Target environment: gnu</span>
  <span data-ty>2024-11-19 23:50:00 💻 CPU: Intel(R) Xeon(R) CPU E3-1245 V2 @ 3.40GHz</span>
  <span data-ty>2024-11-19 23:50:00 💻 CPU cores: 4</span>
  <span data-ty>2024-11-19 23:50:00 💻 Memory: 32001MB</span>
  <span data-ty>2024-11-19 23:50:00 💻 Kernel: 5.15.0-113-generic</span>
  <span data-ty>2024-11-19 23:50:00 💻 Linux distribution: Ubuntu 22.04.5 LTS</span>
  <span data-ty>2024-11-19 23:50:00 💻 Virtual machine: no</span>
  <span data-ty>2024-11-19 23:50:00 📦 Highest known block at #9319</span>
  <span data-ty>2024-11-19 23:50:00 〽️ Prometheus exporter started at 127.0.0.1:9615</span>
  <span data-ty>2024-11-19 23:50:00 Running JSON-RPC server: addr=127.0.0.1:9944, allowed origins=["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"]</span>
  <span data-ty>2024-11-19 23:50:00 🏁 CPU score: 671.67 MiBs</span>
  <span data-ty>2024-11-19 23:50:00 🏁 Memory score: 7.96 GiBs</span>
  <span data-ty>2024-11-19 23:50:00 🏁 Disk score (seq. writes): 377.87 MiBs</span>
  <span data-ty>2024-11-19 23:50:00 🏁 Disk score (rand. writes): 147.92 MiBs</span>
  <span data-ty>2024-11-19 23:50:00 🥩 BEEFY gadget waiting for BEEFY pallet to become available...</span>
  <span data-ty>2024-11-19 23:50:00 🔍 Discovered new external address for our node: /ip4/37.187.93.17/tcp/30333/ws/p2p/12D3KooWDmhHEgPRJUJnUpJ4TFWn28EENqvKWH4dZGCN9TS51y9h</span>
  <span data-ty>2024-11-19 23:50:01 🔍 Discovered new external address for our node: /ip6/2001:41d0:a:3511::1/tcp/30333/ws/p2p/12D3KooWDmhHEgPRJUJnUpJ4TFWn28EENqvKWH4dZGCN9TS51y9h</span>
  <span data-ty>2024-11-19 23:50:05 ⚙️ Syncing, target=#23486325 (5 peers), best: #12262 (0x8fb5…f310), finalized #11776 (0x9de1…32fb), ⬇ 430.5kiB/s ⬆ 17.8kiB/s</span>
  <span data-ty>2024-11-19 23:50:10 ⚙️ Syncing 628.8 bps, target=#23486326 (6 peers), best: #15406 (0x9ce1…2d76), finalized #15360 (0x0e41…a064), ⬇ 255.0kiB/s ⬆ 1.8kiB/s</span>
</div>

Congratulations, you're now syncing a Polkadot full node! Remember that the process is identical when using any other Polkadot SDK-based chain, although individual chains may have chain-specific flag requirements.

### Connect to Your Node

Open [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer){target=\_blank} and click the logo in the top left to switch the node. Activate the **Development** toggle and input your node's domain or IP address. The default WSS endpoint for a local node is:

```bash
ws://127.0.0.1:9944
```


---

Page Title: Set Up a Validator

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-onboarding-and-offboarding-set-up-validator.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/
- Summary: Set up a Polkadot validator node to secure the network and earn staking rewards. Follow this step-by-step guide to install, configure, and manage your node.

# Set Up a Validator

## Introduction

Setting up a Polkadot validator node is essential for securing the network and earning staking rewards. This guide walks you through the technical steps to set up a validator, from installing the necessary software to managing keys and synchronizing your node with the chain.

Running a validator requires a commitment to maintaining a stable, secure infrastructure. Validators are responsible for their own stakes and those of nominators who trust them with their tokens. Proper setup and ongoing management are critical to ensuring smooth operation and avoiding potential penalties such as slashing.

## Prerequisites

To get the most from this guide, ensure you've done the following before going forward:

- Read [Validator Requirements](/infrastructure/running-a-validator/requirements/){target=\_blank} and understand the recommended minimum skill level and hardware needs.
- Read [General Management](/infrastructure/running-a-validator/operational-tasks/general-management){target=\_blank}, [Upgrade Your Node](/infrastructure/running-a-validator/operational-tasks/upgrade-your-node/){target=\_blank}, and [Pause Validating](/infrastructure/running-a-validator/onboarding-and-offboarding/stop-validating/){target=\_blank} and understand the tasks required to keep your validator operational.
- Read [Rewards Payout](/infrastructure/staking-mechanics/rewards-payout/){target=\_blank} and understand how validator rewards are determined and paid out.
- Read [Offenses and Slashes](/infrastructure/staking-mechanics/offenses-and-slashes/){target=\_blank} and understand how validator performance and security can affect tokens staked by you or your nominators.

## Initial Setup

Before running your validator, you must configure your server environment to meet the operational and security standards required for validating.

You must use a Linux-based operating system with Kernel 5.16 or later. Configuration includes setting up time synchronization, ensuring critical security features are active, and installing the necessary binaries. Proper setup at this stage is essential to prevent issues like block production errors or being penalized for downtime. Below are the essential steps to get your system ready.

### Install Network Time Protocol Client

Accurate timekeeping is critical to ensure your validator is synchronized with the network. Validators need local clocks in sync with the blockchain to avoid missing block authorship opportunities. Using [Network Time Protocol (NTP)](https://en.wikipedia.org/wiki/Network_Time_Protocol){target=\_blank} is the standard solution to keep your system's clock accurate.

If you are using Ubuntu version 18.04 or newer, the NTP Client should be installed by default. You can check whether you have the NTP client by running:

```sh
timedatectl
```

If NTP is running, you should see a message like the following:

``` sh
System clock synchronized: yes
```

If NTP is not installed or running, you can install it using:

```sh
sudo apt-get install ntp
```

After installation, NTP will automatically start. To check its status:

```sh
sudo ntpq -p
```

This command will return a message with the status of the NTP synchronization. Skipping this step could result in your validator node missing blocks due to minor clock drift, potentially affecting its network performance.

### Verify Landlock is Activated

[Landlock](https://docs.kernel.org/userspace-api/landlock.html){target=\_blank} is an important security feature integrated into Linux kernels starting with version 5.13. It allows processes, even those without special privileges, to limit their access to the system to reduce the machine's attack surface. This feature is crucial for validators, as it helps ensure the security and stability of the node by preventing unauthorized access or malicious behavior.

To use Landlock, ensure you use the reference kernel or newer versions. Most Linux distributions should already have Landlock activated. You can check if Landlock is activated on your machine by running the following command as root:

```sh
dmesg | grep landlock || journalctl -kg landlock
```

If Landlock is not activated, your system logs won't show any related output. In this case, you will need to activate it manually or ensure that your Linux distribution supports it. Most modern distributions with the required kernel version should have Landlock activated by default. However, if your system lacks support, you may need to build the kernel with Landlock activated. For more information on doing so, refer to the [official kernel documentation](https://docs.kernel.org/userspace-api/landlock.html#kernel-support){target=\_blank}.

Implementing Landlock ensures your node operates in a restricted, self-imposed sandbox, limiting potential damage from security breaches or bugs. While not a mandatory requirement, enabling this feature greatly improves the security of your validator setup.

## Install the Polkadot Binaries

You must install the Polkadot binaries required to run your validator node. These binaries include the main `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries. All three are needed to run a fully functioning validator node.

Depending on your preference and operating system setup, there are multiple methods to install these binaries. Below are the main options:

### Install from Official Releases

The preferred, most straightforward method to install the required binaries is downloading the latest versions from the official releases. You can visit the [Github Releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the most current versions of the `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries.

You can also download the binaries by using the following direct links:

=== "`polkadot`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot.asc
    
    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot.asc
    ```

=== "`polkadot-prepare-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot-prepare-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot-prepare-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-prepare-worker.asc
    ```

=== "`polkadot-execute-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot-execute-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2506-2/polkadot-execute-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-execute-worker.asc
    ```


Signature verification cryptographically ensures the downloaded binaries are authentic and have not been tampered with by using GPG signing keys. Polkadot releases use two different signing keys:

- ParityReleases (release-team@parity.io) with key [`90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE`](https://keyserver.ubuntu.com/pks/lookup?search=90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE&fingerprint=on&op=index){target=\_blank} for current and new releases.
- Parity Security Team (security@parity.io) with key [`9D4B2B6EB8F97156D19669A9FF0812D491B96798`](https://keyserver.ubuntu.com/pks/lookup?search=9D4B2B6EB8F97156D19669A9FF0812D491B96798&fingerprint=on&op=index){target=\_blank} for old releases.

    !!!warning
        When verifying a signature, a "Good signature" message indicates successful verification, while any other output signals a potential security risk.

### Install with Package Managers

Users running Debian-based distributions like Ubuntu can install the binaries using the [APT](https://wiki.debian.org/Apt){target=\_blank} package manager.

Execute the following commands as root to add the official repository and install the binaries:

```bash
# Import the release-team@parity.io GPG key
gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE
gpg --export 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE > /usr/share/keyrings/parity.gpg

# Add the Parity repository and update the package index
echo 'deb [signed-by=/usr/share/keyrings/parity.gpg] https://releases.parity.io/deb release main' > /etc/apt/sources.list.d/parity.list
apt update

# Install the `parity-keyring` package - This will ensure the GPG key
# used by APT remains up-to-date
apt install parity-keyring

# Install polkadot
apt install polkadot
```

Once installation completes, verify the binaries are correctly installed by following the steps in the [verify installation](#verify-installation) section.

### Install with Ansible

You can also manage Polkadot installations using Ansible. This approach can be beneficial for users managing multiple validator nodes or requiring automated deployment. The [Parity chain operations Ansible collection](https://github.com/paritytech/ansible-galaxy/){target=\_blank} provides a Substrate node role for this purpose.

### Install with Docker

If you prefer using Docker or an OCI-compatible container runtime, the official Polkadot Docker image can be pulled directly from Docker Hub.

To pull the latest stable image, run the following command:

```bash
docker pull parity/polkadot:stable2506-2
```

### Build from Sources

You may build the binaries from source by following the instructions on the [Polkadot SDK repository](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2506-2/polkadot#building){target=\_blank}.

## Verify Installation

Once the Polkadot binaries are installed, it's essential to verify that everything is set up correctly and that all the necessary components are in place. Follow these steps to ensure the binaries are installed and functioning as expected.

1. **Check the versions**: Run the following commands to verify the versions of the installed binaries.

    ```bash
    polkadot --version
    polkadot-execute-worker --version
    polkadot-prepare-worker --version
    ```

    The output should show the version numbers for each of the binaries. Ensure that the versions match and are consistent, similar to the following example (the specific version may vary):

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>polkadot --version polkadot-execute-worker --version polkadot-prepare-worker --version</span>
      <span data-ty>1.16.1-36264cb36db</span>
      <span data-ty>1.16.1-36264cb36db</span>
      <span data-ty>1.16.1-36264cb36db</span>
      <span data-ty="input"><span class="file-path"></span></span>
    </div>

    If the versions do not match or if there is an error, double-check that all the binaries were correctly installed and are accessible within your `$PATH`.

2. **Ensure all binaries are in the same directory**: All the binaries must be in the same directory for the Polkadot validator node to function properly. If the binaries are not in the same location, move them to a unified directory and ensure this directory is added to your system's `$PATH`.

    To verify the `$PATH`, run the following command:

    ```bash
    echo $PATH
    ```

    If necessary, you can move the binaries to a shared location, such as `/usr/local/bin/`, and add it to your `$PATH`.


---

Page Title: Set Up Secure WebSocket

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-node-setup-secure-wss.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-node/setup-secure-wss/
- Summary: Instructions on enabling SSL for your node and setting up a secure WebSocket proxy server using nginx for remote connections.

# Set Up Secure WebSocket

## Introduction

Ensuring secure WebSocket communication is crucial for maintaining the integrity and security of a Polkadot or Kusama node when interacting with remote clients. This guide walks you through setting up a secure WebSocket (WSS) connection for your node by leveraging SSL encryption with popular web server proxies like nginx or Apache.

By the end of this guide, you'll be able to secure your node's WebSocket port, enabling safe remote connections without exposing your node to unnecessary risks. The instructions in this guide are for UNIX-based systems.

## Secure a WebSocket Port

You can convert a non-secured WebSocket port to a secure WSS port by placing it behind an SSL-enabled proxy. This approach can be used to secure a bootnode or RPC server. The SSL-enabled apache2/nginx/other proxy server redirects requests to the internal WebSocket and converts it to a secure (WSS) connection. You can use a service like [LetsEncrypt](https://letsencrypt.org/){target=\_blank} to obtain an SSL certificate.

### Obtain an SSL Certificate

LetsEncrypt suggests using the [Certbot ACME client](https://letsencrypt.org/getting-started/#with-shell-access/){target=\_blank} for your respective web server implementation to get a free SSL certificate:

- [nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal){target=\_blank}
- [apache2](https://certbot.eff.org/instructions?ws=apache&os=ubuntufocal){target=\_blank}
 
LetsEncrypt will auto-generate an SSL certificate and include it in your configuration.

When connecting, you can generate a self-signed certificate and rely on your node's raw IP address. However, self-signed certificates aren't optimal because you must include the certificate in an allowlist to access it from a browser.

Use the following command to generate a self-signed certificate using OpenSSL:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```
## Install a Proxy Server

There are a lot of different implementations of a WebSocket proxy; some of the more widely used are [nginx](https://www.f5.com/go/product/welcome-to-nginx){target=\_blank} and [apache2](https://httpd.apache.org/){target=\_blank}, both of which are commonly used web server implementations. See the following section for configuration examples for both implementations.

### Use nginx

1. Install the `nginx` web server: 
    ```bash
    apt install nginx
    ```

2. In an SSL-enabled virtual host, add:
    ```conf
    server {
        (...)
        location / {
        proxy_buffers 16 4k;
        proxy_buffer_size 2k;
        proxy_pass http://localhost:9944;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        }
    }
    ```
3. Optionally, you can introduce some form of rate limiting:
    ```conf
    http {
        limit_req_zone  "$http_x_forwarded_for" zone=zone:10m rate=2r/s;
        (...)
    }
    location / {
        limit_req zone=zone burst=5;
        (...)
    }
    ```
### Use Apache2

Apache2 can run in various modes, including `prefork`, `worker`, and `event`. In this example, the [`event`](https://httpd.apache.org/docs/2.4/mod/event.html){target=\_blank} mode is recommended for handling higher traffic loads, as it is optimized for performance in such environments. However, depending on the specific requirements of your setup, other modes like `prefork` or `worker` may also be appropriate.

1. Install the `apache2` web server:
    ```bash
    apt install apache2
    a2dismod mpm_prefork
    a2enmod mpm_event proxy proxy_html proxy_http proxy_wstunnel rewrite ssl
    ```
2. The [`mod_proxy_wstunnel`](https://httpd.apache.org/docs/2.4/mod/mod_proxy_wstunnel.html){target=\_blank} provides support for the tunneling of WebSocket connections to a backend WebSocket server. The connection is automatically upgraded to a WebSocket connection. In an SSL-enabled virtual host add:

    ```apacheconf
    # (...)
    SSLProxyEngine on
    ProxyRequests off
    ProxyPass / ws://localhost:9944
    ProxyPassReverse / ws://localhost:9944
    ```
    !!!warning 
        Older versions of `mod_proxy_wstunnel` don't upgrade the connection automatically and will need the following config added:
        ```apacheconf
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteRule /(.*) ws://localhost:9944/$1 [P,L]
        RewriteRule /(.*) http://localhost:9944/$1 [P,L]
        ```

3. Optionally, some form of rate limiting can be introduced by first running the following command:

    ```bash
    apt install libapache2-mod-qos
    a2enmod qos
    ```

    Then edit `/etc/apache2/mods-available/qos.conf` as follows:

    ```conf
    # allows max 50 connections from a single IP address:
    QS_SrvMaxConnPerIP                                 50
    ```

## Connect to the Node

1. Open [Polkadot.js Apps interface](https://polkadot.js.org/apps){target=\_blank} and click the logo in the top left to switch the node.
2. Activate the **Development** toggle and input either your node's domain or IP address. Remember to prefix with `wss://` and, if you're using the 443 port, append `:443` as follows:

    ```bash
    wss://example.com:443
    ```

![A sync-in-progress chain connected to Polkadot.js UI](/images/infrastructure/running-a-validator/running-a-node/setup-secure-wss/setup-secure-wss-1.webp)


---

Page Title: Smart Contracts Basics Overview

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-overview.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/overview/
- Summary: Learn how developers can build smart contracts on Polkadot by leveraging either Wasm/ink! or EVM contracts across many parachains.

# An Overview of the Smart Contract Landscape on Polkadot

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Polkadot is designed to support an ecosystem of parachains, rather than hosting smart contracts directly. Developers aiming to build smart contract applications on Polkadot rely on parachains within the ecosystem that provide smart contract functionality.

This guide outlines the primary approaches to developing smart contracts in the Polkadot ecosystem:

- **PolkaVM-compatible contracts**: Support Solidity and any language that compiles down to RISC-V while maintaining compatibility with Ethereum based tools.
- **EVM-compatible contracts**: Support languages like [Solidity](https://soliditylang.org/){target=\_blank} and [Vyper](https://vyperlang.org/){target=\_blank}, offering compatibility with popular Ethereum tools and wallets.
- **Wasm-based smart contracts**: Using [ink!](https://use.ink/){target=\_blank}, a Rust-based embedded domain-specific language (eDSL), enabling developers to leverage Rust’s safety and tooling.

You'll explore the key differences between these development paths, along with considerations for parachain developers integrating smart contract functionality.

!!!note "Parachain Developer?"
    If you are a parachain developer looking to add smart contract functionality to your chain, please refer to the [Add Smart Contract Functionality](/develop/parachains/customize-parachain/add-smart-contract-functionality/){target=\_blank} page, which covers both Wasm and EVM-based contract implementations.

## Smart Contracts Versus Parachains

A smart contract is a program that executes specific logic isolated to the chain on which it is being executed. All the logic executed is bound to the same state transition rules determined by the underlying virtual machine (VM). Consequently, smart contracts are more streamlined to develop, and programs can easily interact with each other through similar interfaces.

``` mermaid
flowchart LR
  subgraph A[Chain State]
    direction LR
    B["Program Logic and Storage<br/>(Smart Contract)"]
    C["Tx Relevant Storage"]
  end
  A --> D[[Virtual Machine]]
  E[Transaction] --> D
  D --> F[(New State)]
  D --> G[Execution Logs]
  style A fill:#ffffff,stroke:#000000,stroke-width:1px
```

In addition, because smart contracts are programs that execute on top of existing chains, teams don't have to think about the underlying consensus they are built on.

These strengths do come with certain limitations. Some smart contracts environments, like EVM, tend to be immutable by default. Developers have developed different [proxy strategies](https://www.openzeppelin.com/news/proxy-patterns){target=\_blank} to be able to upgrade smart contracts over time. The typical pattern relies on a proxy contract which holds the program storage forwarding a call to an implementation contract where the execution logic resides. Smart contract upgrades require changing the implementation contract while retaining the same storage structure, necessitating careful planning.

Another downside is that smart contracts often follow a gas metering model, where program execution is associated with a given unit and a marketplace is set up to pay for such an execution unit. This fee system is often very rigid, and some complex flows, like account abstraction, have been developed to circumvent this problem.

In contrast, parachains can create their own custom logics (known as pallets or modules), and combine them as the state transition function (STF or runtime) thanks to the modularity provided by the [Polkadot-SDK](https://github.com/paritytech/polkadot-sdk/){target=\_blank}. The different pallets within the parachain runtime can give developers a lot of flexibility when building applications on top of it.

``` mermaid
flowchart LR
    A[(Chain State)] --> B[["STF<br/>[Pallet 1]<br/>[Pallet 2]<br/>...<br/>[Pallet N]"]]
    C[Transaction<br/>Targeting Pallet 2] --> B
    B --> E[(New State)]
    B --> F[Execution Logs]
```

Parachains inherently offer features such as logic upgradeability, flexible transaction fee mechanisms, and chain abstraction logic. More so, by using Polkadot, parachains can benefit from robust consensus guarantees with little engineering overhead.

To read more about the differences between smart contracts and parachain runtimes, see the [Runtime vs. Smart Contracts](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/runtime_vs_smart_contract/index.html){target=\_blank} section of the Polkadot SDK Rust docs. For a more in-depth discussion about choosing between runtime development and smart contract development, see the Stack Overflow post on [building a Polkadot SDK runtime versus a smart contract](https://stackoverflow.com/a/56041305){target=\_blank}.

## Building a Smart Contract

The Polkadot SDK supports multiple smart contract execution environments:

- **PolkaVM**: A cutting-edge virtual machine tailored to optimize smart contract execution on Polkadot. Unlike traditional EVMs, PolkaVM is built with a [RISC-V-based register architecture](https://en.wikipedia.org/wiki/RISC-V){target=\_blank} for increased performance and scalability.
- **EVM**: Through [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank}. It consists of a full Ethereum JSON RPC compatible client, an Ethereum emulation layer, and a [Rust-based EVM](https://github.com/rust-ethereum/evm){target=\_blank}. This is used by chains like [Acala](https://acala.network/){target=\_blank}, [Astar](https://astar.network/){target=\_blank}, [Moonbeam](https://moonbeam.network){target=\_blank} and more.
- **Wasm**: [ink!](https://use.ink/){target=\_blank} is a domain-specific language (DSL) for Rust smart contract development that uses the [Contracts pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/contracts/){target=\_blank} with [`cargo-contract`](https://github.com/use-ink/cargo-contract){target=\_blank} serving as the compiler to WebAssembly. Wasm contracts can be used by chains like [Astar](https://astar.network/){target=\_blank}.

### PolkaVM Contracts

A component of the Asset Hub parachain, PolkaVM helps enable the deployment of Solidity-based smart contracts directly on Asset Hub. Learn more about how this cutting edge virtual machine facilitates using familiar Ethereum-compatible contracts and tools with Asset Hub by visiting the [Native Smart Contracts](/develop/smart-contracts/overview#native-smart-contracts){target=\_blank} guide.

### EVM Contracts

The [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank} project provides a set of modules that enables a Polkadot SDK-based chain to run an Ethereum emulation layer that allows the execution of EVM smart contracts natively with the same API/RPC interface.

[Ethereum addresses (ECDSA)](https://ethereum.org/en/glossary/#address){target=\_blank} can also be mapped directly to and from the Polkadot SDK's SS58 scheme from existing accounts. Moreover, you can modify Polkadot SDK to use the ECDSA signature scheme directly to avoid any mapping.

At a high level, [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank} is composed of three main components:

- **[Ethereum Client](https://github.com/polkadot-evm/frontier/tree/master/client){target=\_blank}**: An Ethereum JSON RPC compliant client that allows any request coming from an Ethereum tool, such as [Remix](https://remix.ethereum.org/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank} or [Foundry](https://getfoundry.sh/){target=\_blank}, to be admitted by the network.
- **[Pallet Ethereum](https://docs.rs/pallet-ethereum/latest/pallet_ethereum/){target=\_blank}**: A block emulation and Ethereum transaction validation layer that works jointly with the Ethereum client to ensure compatibility with Ethereum tools.
- **[Pallet EVM](https://docs.rs/pallet-evm/latest/pallet_evm/){target=\_blank}**: Access layer to the [Rust-based EVM](https://github.com/rust-ethereum/evm){target=\_blank}, enabling the execution of EVM smart contract logic natively.

The following diagram illustrates a high-level overview of the path an EVM transaction follows when using this configuration:

``` mermaid
flowchart TD
    A[Users and Devs] -->|Send Tx| B[Frontier RPC Ext]
    subgraph C[Pallet Ethereum]
        D[Validate Tx]
        E[Send<br/>Valid Tx]    
    end
    B -->|Interact with| C
    D --> E
    subgraph F[Pallet EVM]
        G[Rust EVM]
    end
    I[(Current EVM<br/>Emulated State)]

    H[Smart Contract<br/>Solidity, Vyper...] <-->|Compiled to EVM<br/>Bytecode| I

    C --> F
    I --> F
    F --> J[(New Ethereum<br/>Emulated State)]
    F --> K[Execution Logs]

    style C fill:#ffffff,stroke:#000000,stroke-width:1px
    style F fill:#ffffff,stroke:#000000,stroke-width:1px
```

Although it seems complex, users and developers are abstracted of that complexity, and tools can easily interact with the parachain as they would with any other Ethereum-compatible environment.

The Rust EVM is capable of executing regular [EVM bytecode](https://www.ethervm.io/){target=\_blank}. Consequently, any language that compiles to EVM bytecode can be used to create programs that the parachain can execute.

### Wasm Contracts

The [`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank} provides the execution environment for Wasm-based smart contracts. Consequently, any smart contract language that compiles to Wasm can be executed in a parachain that enables this module.

At the time of writing there are two main languages that can be used for Wasm programs:

- **[ink!](https://use.ink/){target=\_blank}**: A Rust-based language that compiles to Wasm. It allows developers to inherit all its safety guarantees and use normal Rust tooling, being the dedicated domain-specific language.
- **Solidity**: Can be compiled to Wasm via the [Solang](https://github.com/hyperledger-solang/solang/){target=\_blank} compiler. Consequently, developers can write Solidity 0.8 smart contracts that can be executed as Wasm programs in parachains.

The following diagram illustrates a high-level overview of the path a transaction follows when using [`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank}:

``` mermaid
flowchart TD
    
    subgraph A[Wasm Bytecode API]
        C[Pallet Contracts]
    end

    B[Users and Devs] -- Interact with ---> A
    
    D[(Current State)]

    E[Smart Contract<br/>ink!, Solidity...] <-->|Compiled to Wasm<br/>Bytecode| D

    D --> A
    A --> F[(New State)]
    A --> G[Execution Logs]

    style A fill:#ffffff,stroke:#000000,stroke-width:1px
```


---

Page Title: Smart Contracts Overview

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-smart-contracts-overview.md
- Canonical (HTML): https://docs.polkadot.com/develop/smart-contracts/overview/
- Summary: Learn about smart contract development capabilities in the Polkadot ecosystem, either by leveraging Polkadot Hub or other alternatives.

# Smart Contracts on Polkadot

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Polkadot offers developers multiple approaches to building and deploying smart contracts within its ecosystem. As a multi-chain network designed for interoperability, Polkadot provides various environments optimized for different developer preferences and application requirements. From native smart contract support on Polkadot Hub to specialized parachain environments, developers can choose the platform that best suits their technical needs while benefiting from Polkadot's shared security model and cross-chain messaging capabilities.

Whether you're looking for Ethereum compatibility through EVM-based parachains like [Moonbeam](https://docs.moonbeam.network/){target=\_blank}, [Astar](https://docs.astar.network/){target=\_blank}, and [Acala](https://evmdocs.acala.network/){target=\_blank} or prefer PolkaVM-based development with [ink!](https://use.ink/docs/v6/){target=\_blank}, the Polkadot ecosystem accommodates a range of diverse developers.

These guides explore the diverse smart contract options available in the Polkadot ecosystem, helping developers understand the unique advantages of each approach and make informed decisions about where to deploy their decentralized applications.

## Native Smart Contracts

### Introduction

Polkadot Hub enables smart contract deployment and execution through PolkaVM, a cutting-edge virtual machine designed specifically for the Polkadot ecosystem. This native integration allows developers to deploy smart contracts directly on Polkadot's system chain while maintaining compatibility with Ethereum development tools and workflows.

### Smart Contract Development

The smart contract platform on Polkadot Hub combines _Polkadot's robust security and scalability_ with the extensive Ethereum development ecosystem. Developers can utilize familiar Ethereum libraries for contract interactions and leverage industry-standard development environments for writing and testing smart contracts.

Polkadot Hub provides _full Ethereum JSON-RPC API compatibility_, ensuring seamless integration with existing development tools and services. This compatibility enables developers to maintain their preferred workflows while building on Polkadot's native infrastructure.

### Technical Architecture

PolkaVM, the underlying virtual machine, utilizes a RISC-V-based register architecture _optimized for the Polkadot ecosystem_. This design choice offers several advantages:

- Enhanced performance for smart contract execution.
- Improved gas efficiency for complex operations.
- Native compatibility with Polkadot's runtime environment.
- Optimized storage and state management.

### Development Tools and Resources

Polkadot Hub supports a comprehensive suite of development tools familiar to Ethereum developers. The platform integrates with popular development frameworks, testing environments, and deployment tools. Key features include:

- Contract development in Solidity or Rust.
- Support for standard Ethereum development libraries.
- Integration with widely used development environments.
- Access to blockchain explorers and indexing solutions.
- Compatibility with contract monitoring and management tools.

### Cross-Chain Capabilities

Smart contracts deployed on Polkadot Hub can leverage Polkadot's [cross-consensus messaging (XCM) protocol](/develop/interoperability/intro-to-xcm/){target=\_blank} protocol to seamlessly _transfer tokens and call functions on other blockchain networks_ within the Polkadot ecosystem, all without complex bridging infrastructure or third-party solutions. For further references, check the [Interoperability](/develop/interoperability/){target=\_blank} section.

### Use Cases

Polkadot Hub's smart contract platform is suitable for a wide range of applications:

- DeFi protocols leveraging _cross-chain capabilities_.
- NFT platforms utilizing Polkadot's native token standards.
- Governance systems integrated with Polkadot's democracy mechanisms.
- Cross-chain bridges and asset management solutions.

## Other Smart Contract Environments

Beyond Polkadot Hub's native PolkaVM support, the ecosystem offers two main alternatives for smart contract development:

- **EVM-compatible parachains**: Provide access to Ethereum's extensive developer ecosystem, smart contract portability, and established tooling like Hardhat, Remix, Foundry, and OpenZeppelin. The main options include Moonbeam (the first full Ethereum-compatible parachain serving as an interoperability hub), Astar (featuring dual VM support for both EVM and WebAssembly contracts), and Acala (DeFi-focused with enhanced Acala EVM+ offering advanced DeFi primitives).

- **Rust (ink!)**: ink! is a Rust-based framework that can compile to PolkaVM. It uses [`#[ink(...)]`](https://use.ink/docs/v6/macros-attributes/){target=\_blank} attribute macros to create Polkadot SDK-compatible PolkaVM bytecode, offering strong memory safety from Rust, an advanced type system, high-performance PolkaVM execution, and platform independence with sandboxed security.


Each environment provides unique advantages based on developer preferences and application requirements.

## Where to Go Next

Developers can use their existing Ethereum development tools and connect to Polkadot Hub's RPC endpoints. The platform's Ethereum compatibility layer ensures a smooth transition for teams already building on Ethereum-compatible chains.

Subsequent sections of this guide provide detailed information about specific development tools, advanced features, and best practices for building on Polkadot Hub.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Libraries__

    ---

    Explore essential libraries to optimize smart contract development and interaction.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/libraries/)

-   <span class="badge guide">Guide</span> __Dev Environments__

    ---

    Set up your development environment for seamless contract deployment and testing.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/dev-environments/)

</div>


---

Page Title: Spawn a Basic Chain with Zombienet

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/tutorials-polkadot-sdk-testing-spawn-basic-chain.md
- Canonical (HTML): https://docs.polkadot.com/tutorials/polkadot-sdk/testing/spawn-basic-chain/
- Summary: Learn to spawn, connect to and monitor a basic blockchain network with Zombienet, using customizable configurations for streamlined development and debugging.

# Spawn a Basic Chain with Zombienet

## Introduction

Zombienet simplifies blockchain development by enabling developers to create temporary, customizable networks for testing and validation. These ephemeral chains are ideal for experimenting with configurations, debugging applications, and validating functionality in a controlled environment.

In this guide, you'll learn how to define a basic network configuration file, spawn a blockchain network using Zombienet's CLI, and interact with nodes and monitor network activity using tools like Polkadot.js Apps and Prometheus

By the end of this tutorial, you'll be equipped to deploy and test your own blockchain networks, paving the way for more advanced setups and use cases.

## Prerequisites

To successfully complete this tutorial, you must ensure you've first:

- [Installed Zombienet](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#install-zombienet){target=\_blank}. This tutorial requires Zombienet version `v1.3.133`. Verify that you're using the specified version to ensure compatibility with the instructions.
- Reviewed the information in [Configure Zombienet](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#configure-zombienet){target=\_blank} and understand how to customize a spawned network.

## Set Up Local Provider

In this tutorial, you will use the Zombienet [local provider](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#local-provider){target=\_blank} (also called native provider) that enables you to run nodes as local processes in your development environment.

You must have the necessary binaries installed (such as `polkadot` and `polkadot-parachain`) to spin up your network successfully.

To install the required binaries, use the following Zombienet CLI command:

```bash
zombienet setup polkadot polkadot-parachain
```

This command downloads the following binaries:

- `polkadot`
- `polkadot-execute-worker`
- `polkadot-parachain`
- `polkadot-prepare-worker`

Finally, add these binaries to your PATH environment variable to ensure Zombienet can locate them when spawning the network.

For example, you can move the binaries to a directory in your PATH, such as `/usr/local/bin`:

```bash
sudo mv ./polkadot ./polkadot-execute-worker ./polkadot-parachain ./polkadot-prepare-worker /usr/local/bin
```

## Define the Network

Zombienet uses a [configuration file](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#configuration-files){target=\_blank} to define the ephemeral network that will be spawned. Follow these steps to create and define the configuration file:

1. Create a file named `spawn-a-basic-network.toml`:

    ```bash
    touch spawn-a-basic-network.toml
    ```

2. Add the following code to the file you just created:

    ```toml title="spawn-a-basic-network.toml"
    [settings]
    timeout = 120

    [relaychain]

    [[relaychain.nodes]]
    name = "alice"
    validator = true

    [[relaychain.nodes]]
    name = "bob"
    validator = true

    [[parachains]]
    id = 100

    [parachains.collator]
    name = "collator01"

    ```

This configuration file defines a network with the following chains:

- **relaychain**: With two nodes named `alice` and `bob`.
- **parachain**: With a collator named `collator01`.

Settings also defines a timeout of 120 seconds for the network to be ready.

## Spawn the Network

To spawn the network, run the following command:

```bash
zombienet -p native spawn spawn-a-basic-network.toml
```

This command will spawn the network defined in the `spawn-a-basic-network.toml` configuration file. The `-p native` flag specifies that the network will be spawned using the native provider.

If successful, you will see the following output:

<div id="termynal" class="table-termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>zombienet -p native spawn spawn-a-basic-network.toml</span>
  <table>
    <thead>
      <tr>
        <th colspan="2" class="center-header">Network launched 🚀🚀</th>
      </tr>
    </thead>
    <tr>
      <th class="left-header">Namespace</th>
      <td>zombie-75a01b93c92d571f6198a67bcb380fcd</td>
    </tr>
    <tr>
      <th class="left-header">Provider</th>
      <td>native</td>
    </tr>
    <tr>
      <th colspan="3" class="center-header">Node Information</th>
    </tr>
    <tr>
      <th class="left-header">Name</th>
      <td>alice</td>
    </tr>
    <tr>
      <th class="left-header">Direct Link</th>
      <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer</a></td>
    </tr>
    <tr>
      <th class="left-header">Prometheus Link</th>
      <td>http://127.0.0.1:55310/metrics</td>
    </tr>
    <tr>
      <th class="left-header">Log Cmd</th>
      <td>tail -f /tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/alice.log</td>
    </tr>
    <tr>
      <th colspan="3" class="center-header">Node Information</th>
    </tr>
    <tr>
      <th class="left-header">Name</th>
      <td>bob</td>
    </tr>
    <tr>
      <th class="left-header">Direct Link</th>
      <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:50312#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55312#explorer</a></td>
    </tr>
    <tr>
      <th class="left-header">Prometheus Link</th>
      <td>http://127.0.0.1:50634/metrics</td>
    </tr>
    <tr>
      <th class="left-header">Log Cmd</th>
      <td>tail -f /tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/bob.log</td>
    </tr>
    <tr>
      <th colspan="3" class="center-header">Node Information</th>
    </tr>
    <tr>
      <th class="left-header">Name</th>
      <td>collator01</td>
    </tr>
    <tr>
      <th class="left-header">Direct Link</th>
      <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55316#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55316#explorer</a></td>
    </tr>
    <tr>
      <th class="left-header">Prometheus Link</th>
      <td>http://127.0.0.1:55318/metrics</td>
    </tr>
    <tr>
      <th class="left-header">Log Cmd</th>
      <td>tail -f /tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/collator01.log</td>
    </tr>
    <tr>
      <th class="left-header">Parachain ID</th>
      <td>100</td>
    </tr>
    <tr>
      <th class="left-header">ChainSpec Path</th>
      <td>/tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/100-rococo-local.json</td>
    </tr>
  </table>
</div>

!!! note 
    If the IPs and ports aren't explicitly defined in the configuration file, they may change each time the network is started, causing the links provided in the output to differ from the example.

## Interact with the Spawned Network

After the network is launched, you can interact with it using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}. To do so, open your browser and use the provided links listed by the output as `Direct Link`.

### Connect to the Nodes

Use the [55308 port address](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer){target=\_blank} to interact with the same `alice` node used for this tutorial. Ports can change from spawn to spawn so be sure to locate the link in the output when spawning your own node to ensure you are accessing the correct port.

If you want to interact with the nodes more programmatically, you can also use the [Polkadot.js API](https://polkadot.js.org/docs/api/){target=\_blank}. For example, the following code snippet shows how to connect to the `alice` node using the Polkadot.js API and log some information about the chain and node:

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  const wsProvider = new WsProvider('ws://127.0.0.1:55308');
  const api = await ApiPromise.create({ provider: wsProvider });

  // Retrieve the chain & node information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  console.log(
    `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
  );
}

main()
  .catch(console.error)
  .finally(() => process.exit());

```

Both methods allow you to interact easily with the network and its nodes.

### Check Metrics

You can also check the metrics of the nodes by accessing the links provided in the output as `Prometheus Link`. [Prometheus](https://prometheus.io/){target=\_blank} is a monitoring and alerting toolkit that collects metrics from the nodes. By accessing the provided links, you can see the metrics of the nodes in a web interface. So, for example, the following image shows the Prometheus metrics for Bob's node from the Zombienet test:

![](/images/tutorials/polkadot-sdk/testing/spawn-basic-chain/spawn-basic-network-01.webp)

### Check Logs

To view individual node logs, locate the `Log Cmd` command in Zombienet's startup output. For example, to see what the alice node is doing, find the log command that references `alice.log` in its file path. Note that Zombienet will show you the correct path for your instance when it starts up, so use that path rather than copying from the below example:

```bash
tail -f  /tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/alice.log
```

After running this command, you will see the logs of the `alice` node in real-time, which can be useful for debugging purposes. The logs of the `bob` and `collator01` nodes can be checked similarly.


---

Page Title: Start Validating

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-onboarding-and-offboarding-start-validating.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/
- Summary: Learn how to start validating on Polkadot by choosing a network, syncing your node, bonding DOT tokens, and activating your validator.

# Start Validating

## Introduction

After configuring your node keys as shown in the [Key Management](/infrastructure/running-a-validator/onboarding-and-offboarding/key-management){target=\_blank} section and ensuring your system is set up, you're ready to begin the validator setup process. This guide will walk you through choosing a network, synchronizing your node with the blockchain, bonding your DOT tokens, and starting your validator.

## Choose a Network

Running your validator on a test network like Westend or Kusama is a smart way to familiarize yourself with the process and identify any setup issues in a lower-stakes environment before joining the Polkadot MainNet.

- **Westend**: Polkadot's primary TestNet is open to anyone for testing purposes. Validator slots are intentionally limited to keep the network stable for the Polkadot release process, so it may not support as many validators at any given time.
- **Kusama**: Often called Polkadot's "canary network," Kusama has real economic value but operates with a faster and more experimental approach. Running a validator here provides an experience closer to MainNet with the benefit of more frequent validation opportunities with an era time of 6 hours vs 24 hours for Polkadot.
- **Polkadot**: The main network, where validators secure the Polkadot relay chain. It has a slower era time of 24 hours and requires a higher minimum bond amount to participate.

## Synchronize Chain Data

The next step is to sync your node with the chosen blockchain network. Synchronization is necessary to download and validate the blockchain data, ensuring your node is ready to participate as a validator. Follow these steps to sync your node:

1. **Start syncing**: You can run a full or warp sync.

    === "Full sync"

        Polkadot defaults to using a full sync, which downloads and validates the entire blockchain history from the genesis block. Start the syncing process by running the following command:

        ```sh
        polkadot
        ```

        This command starts your Polkadot node in non-validator mode, allowing you to synchronize the chain data.

    === "Warp sync"

        You can opt to use warp sync which initially downloads only GRANDPA finality proofs and the latest finalized block's state. Use the following command to start a warp sync:

        ``` bash
        polkadot --sync warp
        ```

        Warp sync ensures that your node quickly updates to the latest finalized state. The historical blocks are downloaded in the background as the node continues to operate.

    If you're planning to run a validator on a TestNet, you can specify the chain using the `--chain` flag. For example, the following will run a validator on Kusama:

    ```sh
    polkadot --chain=kusama
    ```

2. **Monitor sync progress**: Once the sync starts, you will see a stream of logs providing information about the node's status and progress. Here's an example of what the output might look like:

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>polkadot</span>
      <span data-ty>2021-06-17 03:07:07 Parity Polkadot</span>
      <span data-ty>2021-06-17 03:07:07 ✌️ version 0.9.5-95f6aa201-x86_64-linux-gnu</span>
      <span data-ty>2021-06-17 03:07:07 ❤️ by Parity Technologies &lt;admin@parity.io&gt;, 2017-2021</span>
      <span data-ty>2021-06-17 03:07:07 📋 Chain specification: Polkadot</span>
      <span data-ty>2021-06-17 03:07:07 🏷 Node name: boiling-pet-7554</span>
      <span data-ty>2021-06-17 03:07:07 👤 Role: FULL</span>
      <span data-ty>2021-06-17 03:07:07 💾 Database: RocksDb at /root/.local/share/polkadot/chains/polkadot/db</span>
      <span data-ty>2021-06-17 03:07:07 ⛓ Native runtime: polkadot-9050 (parity-polkadot-0.tx7.au0)</span>
      <span data-ty>2021-06-17 03:07:10 🏷 Local node identity is: 12D3KooWLtXFWf1oGrnxMGmPKPW54xWCHAXHbFh4Eap6KXmxoi9u</span>
      <span data-ty>2021-06-17 03:07:10 📦 Highest known block at #17914</span>
      <span data-ty>2021-06-17 03:07:10 〽️ Prometheus server started at 127.0.0.1:9615</span>
      <span data-ty>2021-06-17 03:07:10 Listening for new connections on 127.0.0.1:9944</span>
      <span data-ty>...</span>
    </div>

    The output logs provide information such as the current block number, node name, and network connections. Monitor the sync progress and any errors that might occur during the process. Look for information about the latest processed block and compare it with the current highest block using tools like [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} or [Polkadot.js Apps Explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Database Snapshot Services

If you'd like to speed up the process further, you can use a database snapshot. Snapshots are compressed backups of the blockchain's database directory and can significantly reduce the time required to sync a new node. Here are a few public snapshot providers:

- [Stakeworld](https://stakeworld.io/snapshot){target=\_blank}
- [Polkachu](https://polkachu.com/substrate_snapshots){target=\_blank}
- [Polkashots](https://polkashots.io/){target=\_blank}
- [ITRocket](https://itrocket.net/services/mainnet/polkadot/#snapshot){target=\_blank}

!!!warning
    Although snapshots are convenient, syncing from scratch is recommended for security purposes. If snapshots become corrupted and most nodes rely on them, the network could inadvertently run on a non-canonical chain.

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>polkadot</span>
  <span data-ty>2021-06-17 03:07:07 Idle (0 peers), best: #0 (0x3fd7...5baf), finalized #0 (0x3fd7...5baf), ⬇ 2.9kiB/s ⬆ 3.7kiB/s</span>
  <span data-ty>2021-06-17 03:07:12 Idle (0 peers), best: #0 (0x3fd7...5baf), finalized #0 (0x3fd7...5baf), ⬇ 1.7kiB/s ⬆ 2.0kiB/s</span>
  <span data-ty>2021-06-17 03:07:17 Idle (0 peers), best: #0 (0x3fd7...5baf), finalized #0 (0x3fd7...5baf), ⬇ 0.9kiB/s ⬆ 1.2kiB/s</span>
  <span data-ty>2021-06-17 03:07:19 Libp2p => Random Kademlia query has yielded empty results</span>
  <span data-ty>2021-06-17 03:08:00 Idle (0 peers), best: #0 (0x3fd7...5baf), finalized #0 (0x3fd7...5baf), ⬇ 1.6kiB/s ⬆ 1.9kiB/s</span>
  <span data-ty>2021-06-17 03:08:05 Idle (0 peers), best: #0 (0x3fd7...5baf), finalized #0 (0x3fd7...5baf), ⬇ 0.6kiB/s ⬆ 0.9kiB/s</span>
  <span data-ty>...</span>
</div>

If you see terminal output similar to the preceding, and you are unable to synchronize the chain due to having zero peers, make sure you have libp2p port `30333` activated. It will take some time to discover other peers over the network.

## Bond DOT

Once your validator node is synced, the next step is bonding DOT. A bonded account, or stash, holds your staked tokens (DOT) that back your validator node. Bonding your DOT means locking it for a period, during which it cannot be transferred or spent but is used to secure your validator's role in the network. Visit the [Minimum Bond Requirement](/infrastructure/running-a-validator/requirements/#minimum-bond-requirement) section for details on how much DOT is required.

The following sections will guide you through bonding DOT for your validator.

### Bonding DOT on Polkadot.js Apps

Once you're ready to bond your DOT, head over to the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} staking page by clicking the **Network** dropdown at the top of the page and selecting [**Staking**](https://polkadot.js.org/apps/#/staking/actions){target=\_blank}.

To get started with the bond submission, click on the **Accounts** tab, then the **+ Stash** button, and then enter the following information:

1. **Stash account**: Select your stash account (which is the account with the DOT/KSM balance).
2. **Value bonded**: Enter how much DOT from the stash account you want to bond/stake. You are not required to bond all of the DOT in that account and you may bond more DOT at a later time. Be aware, withdrawing any bonded amount requires waiting for the unbonding period. The unbonding period is seven days for Kusama and 28 days for Polkadot.
3. **Payment destination**: Add the recipient account for validator rewards. If you'd like to redirect payments to an account that is not the stash account, you can do it by entering the address here. Note that it is extremely unsafe to set an exchange address as the recipient of the staking rewards.

Once everything is filled in properly, select **Bond** and sign the transaction with your stash account. If successful, you should see an `ExtrinsicSuccess` message.

Your bonded account will be available under **Stashes**. After refreshing the screen, you should now see a card with all your accounts. The bonded amount on the right corresponds to the funds bonded by the stash account.

## Validate

Once your validator node is fully synced and ready, the next step is to ensure it's visible on the network and performing as expected. Below are steps for monitoring and managing your node on the Polkadot network.

### Verify Sync via Telemetry

To confirm that your validator is live and synchronized with the Polkadot network, visit the [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} page. Telemetry provides real-time information on node performance and can help you check if your validator is connected properly. Search for your node by name. You can search all nodes currently active on the network, which is why you should use a unique name for easy recognition. Now, confirm that your node is fully synced by comparing the block height of your node with the network's latest block. Nodes that are fully synced will appear white in the list, while nodes that are not yet fully synced will appear gray.

In the following example, a node named `techedtest` is successfully located and synchronized, ensuring it's prepared to participate in the network:

![Polkadot telemetry dashboard](/images/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/start-validating-01.webp)

### Activate using Polkadot.js Apps

Follow these steps to use Polkadot.js Apps to activate your validator:

1. Go to the **Validator** tab in the Polkadot.js Apps UI and locate the section where you input the keys generated from `rotateKeys`. Paste the output from `author_rotateKeys`, which is a hex-encoded key that links your validator with its session keys:

    ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/start-validating-02.webp)

2. Set a reward commission percentage if desired. You can set a percentage of the rewards to pay to your validator and the remainder pays to your nominators. A 100% commission rate indicates the validator intends to keep all rewards and is seen as a signal the validator is not seeking nominators.

3. Toggle the **allows new nominations** option if your validator is open to more nominations from DOT holders.

4. Once everything is configured, select **Bond & Validate** to activate your validator status.

    ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/start-validating-03.webp)

5. Edit the **commission** and the **blocked** option via `staking.validate` extrinsic. By default, the blocked option is set to FALSE (i.e., the validator accepts nominations).

    ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/start-validating-04.webp)

### Monitor Validation Status and Slots

On the [**Staking**](https://polkadot.js.org/apps/#/staking){target=\_blank} tab in Polkadot.js Apps, you can see your validator's status, the number of available validator slots, and the nodes that have signaled their intent to validate. Your node may initially appear in the waiting queue, especially if the validator slots are full. The following is an example view of the **Staking** tab:

![staking queue](/images/infrastructure/running-a-validator/onboarding-and-offboarding/start-validating/start-validating-05.webp)

The validator set refreshes each era. If there's an available slot in the next era, your node may be selected to move from the waiting queue to the active validator set, allowing it to start validating blocks. If your validator is not selected, it remains in the waiting queue. Increasing your stake or gaining more nominators may improve your chance of being selected in future eras.

## Run a Validator Using Systemd

Running your Polkadot validator as a [systemd](https://en.wikipedia.org/wiki/Systemd){target=\_blank} service is an effective way to ensure its high uptime and reliability. Using systemd allows your validator to automatically restart after server reboots or unexpected crashes, significantly reducing the risk of slashing due to downtime.

This following sections will walk you through creating and managing a systemd service for your validator, allowing you to seamlessly monitor and control it as part of your Linux system. 

Ensure the following requirements are met before proceeding with the systemd setup:

- Confirm your system meets the [requirements](/infrastructure/running-a-validator/requirements/){target=\_blank} for running a validator.
- Ensure you meet the [minimum bond requirements](https://wiki.polkadot.com/general/chain-state-values/#minimum-validator-bond){target=\_blank} for validating.
- Verify the Polkadot binary is [installed](#install-the-polkadot-binaries).

### Create the Systemd Service File

First create a new unit file called `polkadot-validator.service` in `/etc/systemd/system/`:

```bash
touch /etc/systemd/system/polkadot-validator.service
```

In this unit file, you will write the commands that you want to run on server boot/restart:

```systemd title="/etc/systemd/system/polkadot-validator.service"
[Unit]
Description=Polkadot Node
After=network.target
Documentation=https://github.com/paritytech/polkadot-sdk

[Service]
EnvironmentFile=-/etc/default/polkadot
ExecStart=/usr/bin/polkadot $POLKADOT_CLI_ARGS
User=polkadot
Group=polkadot
Restart=always
RestartSec=120
CapabilityBoundingSet=
LockPersonality=true
NoNewPrivileges=true
PrivateDevices=true
PrivateMounts=true
PrivateTmp=true
PrivateUsers=true
ProtectClock=true
ProtectControlGroups=true
ProtectHostname=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectSystem=strict
RemoveIPC=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_NETLINK AF_UNIX
RestrictNamespaces=false
RestrictSUIDSGID=true
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallFilter=landlock_add_rule landlock_create_ruleset landlock_restrict_self seccomp mount umount2
SystemCallFilter=~@clock @module @reboot @swap @privileged
SystemCallFilter=pivot_root
UMask=0027

[Install]
WantedBy=multi-user.target
```

!!! warning "Restart delay and equivocation risk"
    It is recommended that a node's restart be delayed with `RestartSec` in the case of a crash. It's possible that when a node crashes, consensus votes in GRANDPA aren't persisted to disk. In this case, there is potential to equivocate when immediately restarting. Delaying the restart will allow the network to progress past potentially conflicting votes.

### Run the Service

Activate the systemd service to start on system boot by running:

```bash
systemctl enable polkadot-validator.service
```

To start the service manually, use:

```bash
systemctl start polkadot-validator.service
```

Check the service's status to confirm it is running:

```bash
systemctl status polkadot-validator.service
```

To view the logs in real-time, use [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html){target=\_blank} like so:

```bash
journalctl -f -u polkadot-validator
```

With these steps, you can effectively manage and monitor your validator as a systemd service.

Once your validator is active, it's officially part of Polkadot's security infrastructure. For questions or further support, you can reach out to the [Polkadot Validator chat](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io?via=matrix.parity.io&via=matrix.org&via=web3.foundation){target=\_blank} for tips and troubleshooting.


---

Page Title: Stop Validating

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-onboarding-and-offboarding-stop-validating.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/onboarding-and-offboarding/stop-validating/
- Summary: Learn to safely stop validating on Polkadot, including chilling, unbonding tokens, and purging validator keys.

# Stop Validating

## Introduction

If you're ready to stop validating on Polkadot, there are essential steps to ensure a smooth transition while protecting your funds and account integrity. Whether you're taking a break for maintenance or unbonding entirely, you'll need to chill your validator, purge session keys, and unbond your tokens. This guide explains how to use Polkadot's tools and extrinsics to safely withdraw from validation activities, safeguarding your account's future usability.

## Pause Versus Stop

If you wish to remain a validator or nominator (for example, stopping for planned downtime or server maintenance), submitting the `chill` extrinsic in the `staking` pallet should suffice. Additional steps are only needed to unbond funds or reap an account.

The following are steps to ensure a smooth stop to validation:

- Chill the validator.
- Purge validator session keys.
- Unbond your tokens.

## Chill Validator

When stepping back from validating, the first step is to chill your validator status. This action stops your validator from being considered for the next era without fully unbonding your tokens, which can be useful for temporary pauses like maintenance or planned downtime.

Use the `staking.chill` extrinsic to initiate this. For more guidance on chilling your node, refer to the [Pause Validating](/infrastructure/running-a-validator/operational-tasks/pause-validating/){target=\_blank} guide. You may also claim any pending staking rewards at this point.

## Purge Validator Session Keys

Purging validator session keys is a critical step in removing the association between your validator account and its session keys, which ensures that your account is fully disassociated from validator activities. The `session.purgeKeys` extrinsic removes the reference to your session keys from the stash or staking proxy account that originally set them.

Here are a couple of important things to know about purging keys:

- **Account used to purge keys**: Always use the same account to purge keys you originally used to set them, usually your stash or staking proxy account. Using a different account may leave an unremovable reference to the session keys on the original account, preventing its reaping.
- **Account reaping issue**: Failing to purge keys will prevent you from reaping (fully deleting) your stash account. If you attempt to transfer tokens without purging, you'll need to rebond, purge the session keys, unbond again, and wait through the unbonding period before any transfer.

## Unbond Your Tokens

After chilling your node and purging session keys, the final step is to unbond your staked tokens. This action removes them from staking and begins the unbonding period (usually 28 days for Polkadot and seven days for Kusama), after which the tokens will be transferable.

To unbond tokens, go to **Network > Staking > Account Actions** on Polkadot.js Apps. Select your stash account, click on the dropdown menu, and choose **Unbond Funds**. Alternatively, you can use the `staking.unbond` extrinsic if you handle this via a staking proxy account.

Once the unbonding period is complete, your tokens will be available for use in transactions or transfers outside of staking.


---

Page Title: Testing and Debugging

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-test-and-debug.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/test-and-debug/
- Summary: Learn how to test and debug cross-chain communication via the XCM Emulator to ensure interoperability and reliable execution.

# Testing and Debugging

## Introduction

Cross-Consensus Messaging (XCM) is a core feature of the Polkadot ecosystem, enabling communication between parachains, relay chains, and system chains. To ensure the reliability of XCM-powered blockchains, thorough testing and debugging are essential before production deployment.

This guide covers the XCM Emulator, a tool designed to facilitate onboarding and testing for developers. Use the emulator if:

- A live runtime is not yet available.
- Extensive configuration adjustments are needed, as emulated chains differ from live networks.
- Rust-based tests are preferred for automation and integration.

For scenarios where real blockchain state is required, [Chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} allows testing with any client compatible with Polkadot SDK-based chains.

## XCM Emulator

Setting up a live network with multiple interconnected parachains for XCM testing can be complex and resource-intensive. 

The [`xcm-emulator`](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2506-2/cumulus/xcm/xcm-emulator){target=\_blank} is a tool designed to simulate the execution of XCM programs using predefined runtime configurations. These configurations include those utilized by live networks like Kusama, Polkadot, and Asset Hub.

This tool enables testing of cross-chain message passing, providing a way to verify outcomes, weights, and side effects efficiently. It achieves this by utilizing mocked runtimes for both the relay chain and connected parachains, enabling developers to focus on message logic and configuration without needing a live network.

The `xcm-emulator` relies on transport layer pallets. However, the messages do not leverage the same messaging infrastructure as live networks since the transport mechanism is mocked. Additionally, consensus-related events are not covered, such as disputes and staking events. Parachains should use end-to-end (E2E) tests to validate these events.

### Advantages and Limitations

The XCM Emulator provides both advantages and limitations when testing cross-chain communication in simulated environments.

- **Advantages**:
    - **Interactive debugging**: Offers tracing capabilities similar to EVM, enabling detailed analysis of issues.
    - **Runtime composability**: Facilitates testing and integration of multiple runtime components.
    - **Immediate feedback**: Supports Test-Driven Development (TDD) by providing rapid test results.
    - **Seamless integration testing**: Simplifies the process of testing new runtime versions in an isolated environment.

- **Limitations**:
    - **Simplified emulation**: Always assumes message delivery, which may not mimic real-world network behavior.
    - **Dependency challenges**: Requires careful management of dependency versions and patching. Refer to the [Cargo dependency documentation](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html){target=\_blank}.
    - **Compilation overhead**: Testing environments can be resource-intensive, requiring frequent compilation updates.

### How Does It Work?

The `xcm-emulator` provides macros for defining a mocked testing environment. Check all the existing macros and functionality in the [XCM Emulator source code](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2506-2/cumulus/xcm/xcm-emulator/src/lib.rs){target=\_blank}. The most important macros are:

- **[`decl_test_relay_chains`](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2506-2/cumulus/xcm/xcm-emulator/src/lib.rs#L361){target=\_blank}**: Defines runtime and configuration for the relay chains. Example:

    ```rust
    decl_test_relay_chains! {
    	#[api_version(13)]
    	pub struct Westend {
    		genesis = genesis::genesis(),
    		on_init = (),
    		runtime = westend_runtime,
    		core = {
    			SovereignAccountOf: westend_runtime::xcm_config::LocationConverter,
    		},
    		pallets = {
    			XcmPallet: westend_runtime::XcmPallet,
    			Sudo: westend_runtime::Sudo,
    			Balances: westend_runtime::Balances,
    			Treasury: westend_runtime::Treasury,
    			AssetRate: westend_runtime::AssetRate,
    			Hrmp: westend_runtime::Hrmp,
    			Identity: westend_runtime::Identity,
    			IdentityMigrator: westend_runtime::IdentityMigrator,
    		}
    	},
    }
    ```

- **[`decl_test_parachains`](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2506-2/cumulus/xcm/xcm-emulator/src/lib.rs#L596){target=\_blank}**: Defines runtime and configuration for parachains. Example:

    ```rust
    decl_test_parachains! {
    	pub struct AssetHubWestend {
    		genesis = genesis::genesis(),
    		on_init = {
    			asset_hub_westend_runtime::AuraExt::on_initialize(1);
    		},
    		runtime = asset_hub_westend_runtime,
    		core = {
    			XcmpMessageHandler: asset_hub_westend_runtime::XcmpQueue,
    			LocationToAccountId: asset_hub_westend_runtime::xcm_config::LocationToAccountId,
    			ParachainInfo: asset_hub_westend_runtime::ParachainInfo,
    			MessageOrigin: cumulus_primitives_core::AggregateMessageOrigin,
    			DigestProvider: (),
    		},
    		pallets = {
    			PolkadotXcm: asset_hub_westend_runtime::PolkadotXcm,
    			Balances: asset_hub_westend_runtime::Balances,
    			Assets: asset_hub_westend_runtime::Assets,
    			ForeignAssets: asset_hub_westend_runtime::ForeignAssets,
    			PoolAssets: asset_hub_westend_runtime::PoolAssets,
    			AssetConversion: asset_hub_westend_runtime::AssetConversion,
    			SnowbridgeSystemFrontend: asset_hub_westend_runtime::SnowbridgeSystemFrontend,
    			Revive: asset_hub_westend_runtime::Revive,
    		}
    	},
    }
    ```

- **[`decl_test_bridges`](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2506-2/cumulus/xcm/xcm-emulator/src/lib.rs#L1221){target=\_blank}**: Creates bridges between chains, specifying the source, target, and message handler. Example:

    ```rust
    decl_test_bridges! {
    	pub struct RococoWestendMockBridge {
    		source = BridgeHubRococoPara,
    		target = BridgeHubWestendPara,
    		handler = RococoWestendMessageHandler
    	},
    	pub struct WestendRococoMockBridge {
    		source = BridgeHubWestendPara,
    		target = BridgeHubRococoPara,
    		handler = WestendRococoMessageHandler
    	}
    }
    ```

- **[`decl_test_networks`](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2506-2/cumulus/xcm/xcm-emulator/src/lib.rs#L958){target=\_blank}**: Defines a testing network with relay chains, parachains, and bridges, implementing message transport and processing logic. Example:

    ```rust
    decl_test_networks! {
    	pub struct WestendMockNet {
    		relay_chain = Westend,
    		parachains = vec![
    			AssetHubWestend,
    			BridgeHubWestend,
    			CollectivesWestend,
    			CoretimeWestend,
    			PeopleWestend,
    			PenpalA,
    			PenpalB,
    		],
    		bridge = ()
    	},
    }
    ```

By leveraging these macros, developers can customize their testing networks by defining relay chains and parachains tailored to their needs. For guidance on implementing a mock runtime for a Polkadot SDK-based chain, refer to the [Pallet Testing](/develop/parachains/testing/pallet-testing/){target=\_blank} article. 

This framework enables thorough testing of runtime and cross-chain interactions, enabling developers to effectively design, test, and optimize cross-chain functionality.

To see a complete example of implementing and executing tests, refer to the [integration tests](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2506-2/cumulus/parachains/integration-tests/emulated){target=\_blank} in the Polkadot SDK repository.


---

Page Title: Transactions and Fees on Asset Hub

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/polkadot-protocol-smart-contract-basics-blocks-transactions-fees.md
- Canonical (HTML): https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/blocks-transactions-fees/
- Summary: Explore how Asset Hub smart contracts handle blocks, transactions, and fees with EVM compatibility, supporting various Ethereum transaction types.

# Blocks, Transactions, and Fees

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Asset Hub smart contracts operate within the Polkadot ecosystem using the [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/){target=\_blank} implementation, which provides EVM compatibility. While many aspects of blocks and transactions are inherited from the underlying parachain architecture, there are specific considerations and mechanisms unique to smart contract operations on Asset Hub.

## Smart Contract Blocks

Smart contract blocks in Asset Hub follow the same fundamental structure as parachain blocks, inheriting all standard parachain block components. The `pallet_revive` implementation maintains this consistency while adding necessary [EVM-specific features](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm){target=\_blank}. For detailed implementation specifics, the [`Block`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Block.html){target=\_blank} struct in `pallet_revive` demonstrates how parachain and smart contract block implementations align.

## Smart Contract Transactions

Asset Hub implements a sophisticated transaction system that supports various transaction types and formats, encompassing both traditional parachain operations and EVM-specific interactions.

### EVM Transaction Types

The system provides a fundamental [`eth_transact`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/dispatchables/fn.eth_transact.html){target=\_blank} interface for processing raw EVM transactions dispatched through [Ethereum JSON-RPC APIs](/develop/smart-contracts/json-rpc-apis/){target=\_blank}. This interface acts as a wrapper for Ethereum transactions, requiring an encoded signed transaction payload, though it cannot be dispatched directly. Building upon this foundation, the system supports multiple transaction formats to accommodate different use cases and optimization needs:

- **[Legacy transactions](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.TransactionLegacyUnsigned.html){target=\_blank}**: The original Ethereum transaction format, providing basic transfer and contract interaction capabilities. These transactions use a simple pricing mechanism and are supported for backward compatibility.

- **[EIP-1559 transactions](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction1559Unsigned.html){target=\_blank}**: An improved transaction format that introduces a more predictable fee mechanism with base fee and priority fee components. This format helps optimize gas fee estimation and network congestion management.

- **[EIP-2930 transactions](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction2930Unsigned.html){target=\_blank}**: Introduces access lists to optimize gas costs for contract interactions by pre-declaring accessed addresses and storage slots.

- **[EIP-4844 transactions](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction4844Unsigned.html){target=\_blank}**: Implements blob-carrying transactions, designed to optimize Layer 2 scaling solutions by providing dedicated space for roll-up data.

Each transaction type can exist in both signed and unsigned states, with appropriate validation and processing mechanisms for each.

## Fees and Gas

Asset Hub implements a sophisticated resource management system that combines parachain transaction fees with EVM gas mechanics, providing both Ethereum compatibility and enhanced features.

### Gas Model Overview

Gas serves as the fundamental unit for measuring computational costs, with each network operation consuming a specified amount. This implementation maintains compatibility with Ethereum's approach while adding parachain-specific optimizations.

- **Dynamic gas scaling**: Asset Hub implements a dynamic pricing mechanism that reflects actual execution performance. This results in:

    - More efficient pricing for computational instructions relative to I/O operations.
    - Better correlation between gas costs and actual resource consumption.
    - Need for developers to implement flexible gas calculation rather than hardcoding values.

- **Multi-dimensional resource metering**: Asset Hub extends beyond the traditional single-metric gas model to track three distinct resources.

    - `ref_time` (computation time):

        - Functions as traditional gas equivalent.
        - Measures actual computational resource usage.
        - Primary metric for basic operation costs.


    - `proof_size` (verification overhead):

        - Tracks state proof size required for validator verification.
        - Helps manage consensus-related resource consumption.
        - Important for cross-chain operations.


    - `storage_deposit` (state management):

        - Manages blockchain state growth.
        - Implements a deposit-based system for long-term storage.
        - Refundable when storage is freed.

These resources can be limited at both transaction and contract levels, similar to Ethereum's gas limits. For more information, check the [Gas Model](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm#gas-model){target=\_blank} section in the [EVM vs PolkaVM](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/){target=\_blank} article.

### Fee Components

- Base fees:

    - Storage deposit for contract deployment.
    - Minimum transaction fee for network access.
    - Network maintenance costs.

- Execution fees:

    - Computed based on gas consumption.
    - Converted to native currency using network-defined rates.
    - Reflects actual computational resource usage.

- Storage fees:

    - Deposit for long-term storage usage.
    - Refundable when storage is freed.
    - Helps prevent state bloat.

### Gas Calculation and Conversion

The system maintains precise conversion mechanisms between:

- Substrate weights and EVM gas units.
- Native currency and gas costs.
- Different resource metrics within the multi-dimensional model.

This ensures accurate fee calculation while maintaining compatibility with existing Ethereum tools and workflows.


---

Page Title: Upgrade a Validator Node

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-operational-tasks-upgrade-your-node.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/operational-tasks/upgrade-your-node/
- Summary: Guide to seamlessly upgrading your Polkadot validator node, managing session keys, and executing server maintenance while avoiding downtime and slashing risks.

# Upgrade a Validator Node

## Introduction

Upgrading a Polkadot validator node is essential for staying current with network updates and maintaining optimal performance. This guide covers routine and extended maintenance scenarios, including software upgrades and major server changes. Following these steps, you can manage session keys and transition smoothly between servers without risking downtime, slashing, or network disruptions. The process requires strategic planning, especially if you need to perform long-lead maintenance, ensuring your validator remains active and compliant.

This guide will allow validators to seamlessly substitute an active validator server to allow for maintenance operations. The process can take several hours, so ensure you understand the instructions first and plan accordingly.

## Prerequisites

Before beginning the upgrade process for your validator node, ensure the following:

- You have a fully functional validator setup with all required binaries installed. See [Set Up a Validator](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/){target=\_blank} and [Validator Requirements](/infrastructure/running-a-validator/requirements/){target=\_blank} for additional guidance.
- Your VPS infrastructure has enough capacity to run a secondary validator instance temporarily for the upgrade process.

## Session Keys

Session keys are used to sign validator operations and establish a connection between your validator node and your staking proxy account. These keys are stored in the client, and any change to them requires a waiting period. Specifically, if you modify your session keys, the change will take effect only after the current session is completed and two additional sessions have passed.

Remembering this delayed effect when planning upgrades is crucial to ensure that your validator continues to function correctly and avoids interruptions. To learn more about session keys and their importance, visit the [Keys section](https://wiki.polkadot.com/learn/learn-cryptography/#keys){target=\_blank}.

## Keystore

Your validator server's `keystore` folder holds the private keys needed for signing network-level transactions. It is important not to duplicate or transfer this folder between validator instances. Doing so could result in multiple validators signing with the duplicate keys, leading to severe consequences such as [equivocation slashing](/infrastructure/staking-mechanics/offenses-and-slashes/#equivocation-slash){target=\_blank}. Instead, always generate new session keys for each validator instance.

The default path to the `keystore` is as follows:

```bash
/home/polkadot/.local/share/polkadot/chains/<chain>/keystore
```

Taking care to manage your keys securely ensures that your validator operates safely and without the risk of slashing penalties.

## Upgrade Using Backup Validator

The following instructions outline how to temporarily switch between two validator nodes. The original active validator is referred to as Validator A and the backup node used for maintenance purposes as Validator B.

### Session `N`

1. **Start Validator B**: Launch a secondary node and wait until it is fully synced with the network. Once synced, start it with the `--validator` flag. This node will now act as Validator B.
2. **Generate session keys**: Create new session keys specifically for Validator B.
3. **Submit the `set_key` extrinsic**: Use your staking proxy account to submit a `set_key` extrinsic, linking the session keys for Validator B to your staking setup.
4. **Record the session**: Make a note of the session in which you executed this extrinsic.
5. **Wait for session changes**: Allow the current session to end and then wait for two additional full sessions for the new keys to take effect.

!!! warning "Keep Validator A running"

      It is crucial to keep Validator A operational during this entire waiting period. Since `set_key` does not take effect immediately, turning off Validator A too early may result in chilling or even slashing.

### Session `N+3`

At this stage, Validator B becomes your active validator. You can now safely perform any maintenance tasks on Validator A.

Complete the following steps when you are ready to bring Validator A back online:

1. **Start Validator A**: Launch Validator A, sync the blockchain database, and ensure it is running with the `--validator` flag.
2. **Generate new session keys for Validator A**: Create fresh session keys for Validator A.
3. **Submit the `set_key` extrinsic**: Using your staking proxy account, submit a `set_key` extrinsic with the new Validator A session keys.
4. **Record the session**: Again, make a note of the session in which you executed this extrinsic.

Keep Validator B active until the session during which you executed the `set-key` extrinsic completes plus two additional full sessions have passed. Once Validator A has successfully taken over, you can safely stop Validator B. This process helps ensure a smooth handoff between nodes and minimizes the risk of downtime or penalties. Verify the transition by checking for finalized blocks in the new session. The logs should indicate the successful change, similar to the example below:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>INSERT_COMMAND</span>
  <span data-ty>2019-10-28 21:44:13 Applying authority set change scheduled at block #450092</span>
  <span data-ty>2019-10-28 21:44:13 Applying GRANDPA set change to new set with 20 authorities</span>
  <span data-ty="input"><span class="file-path"></span></span>
</div>


---

Page Title: Validator Key Management

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-onboarding-and-offboarding-key-management.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/
- Summary: Learn how to generate and manage validator keys, including session keys for consensus participation and node keys for maintaining a stable network identity.

# Key Management

## Introduction

After setting up your node environment as shown in the [Setup](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator){target=\_blank} section, you'll need to configure multiple keys for your validator to operate properly. This includes setting up session keys, which are essential for participating in the consensus process, and configuring a node key that maintains a stable network identity. This guide walks you through the key management process, showing you how to generate, store, and register these keys.

## Set Session Keys

Setting up your validator's session keys is essential to associate your node with your stash account on the Polkadot network. Validators use session keys to participate in the consensus process. Your validator can only perform its role in the network by properly setting session keys which consist of several key pairs for different parts of the protocol (e.g., GRANDPA, BABE). These keys must be registered on-chain and associated with your validator node to ensure it can participate in validating blocks.

### Generate Session Keys

There are multiple ways to create the session keys. It can be done by interacting with the [Polkadot.js Apps UI](https://polkadot.js.org/apps/#/explorer){target=\_blank}, using the curl command or by using [Subkey](https://paritytech.github.io/polkadot-sdk/master/subkey/index.html){target=\_blank}.

=== "Polkadot.js Apps UI"

    1. In Polkadot.js Apps, connect to your local node, navigate to the **Developer** dropdown, and select the **RPC Calls** option.

    2. Construct an `author_rotateKeys` RPC call and execute it:

        1. Select the **author** endpoint.
        2. Choose the **rotateKeys()** call.
        3. Click the **Submit RPC Call** button.
        4. Copy the hex-encoded public key from the response.

        ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/key-management-1.webp)

=== "Curl"

    Generate session keys by running the following command on your validator node:

    ``` bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
    http://localhost:9944
    ```

    This command will return a JSON object. The `result` key is the hex-encoded public part of the newly created session key. Save this for later use.
    
    ```json
    {"jsonrpc":"2.0","result":"0xda3861a45e0197f3ca145c2c209f9126e5053fas503e459af4255cf8011d51010","id":1}
    ```

=== "Subkey"

    To create a keypair for your node's session keys, use the `subkey generate` command. This generates a set of cryptographic keys that must be stored in your node's keystore directory.

    When you run the command, it produces output similar to this example:

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>subkey generate</span>
      <pre>
    Secret phrase:       twist buffalo mixture excess device drastic vague mammal fitness punch match hammer
      Network ID:        substrate
      Secret seed:       0x5faa9e5defe42b201388d5c2b8202d6625a344abc9aa52943a71f12cb90b88a9
      Public key (hex):  0x28cc2fdb6e28835e2bbac9a16feb65c23d448c9314ef12fe083b61bab8fc2755
      Account ID:        0x28cc2fdb6e28835e2bbac9a16feb65c23d448c9314ef12fe083b61bab8fc2755
      Public key (SS58): 5CzCRpXzHYhuo6G3gYFR3cgV6X3qCNwVt51m8q14ZcChsSXQ
      SS58 Address:      5CzCRpXzHYhuo6G3gYFR3cgV6X3qCNwVt51m8q14ZcChsSXQ
      </pre>
    </div>

    To properly store these keys, create a file in your keystore directory with a specific naming convention. The filename must consist of the hex string `61757261` (which represents "aura" in hex) followed by the public key without its `0x` prefix.

    Using the example above, you would create a file named:

    ```
    ./keystores/6175726128cc2fdb6e28835e2bbac9a16feb65c23d448c9314ef12fe083b61bab8fc2755
    ```

    And store only the secret phrase in the file:

    ```
    "twist buffalo mixture excess device drastic vague mammal fitness punch match hammer"
    ```

### Submit Transaction to Set Keys

Now that you have generated your session keys, you must submit them to the chain. Follow these steps:

1. Go to the **Network > Staking > Accounts** section on Polkadot.js Apps.
2. Select **Set Session Key** on the bonding account you generated earlier.
3. Paste the hex-encoded session key string you generated (from either the UI or CLI) into the input field and submit the transaction.

![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/key-management/key-management-2.webp)

Once the transaction is signed and submitted, your session keys will be registered on-chain.

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`**: Checks if the node has a specific key by public key and key type.
- **`hasSessionKeys`**: Verifies if your node has the full session key string associated with the validator.

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

## Set the Node Key

Validators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. This key ensures that your validator can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>polkadot --validator --name "INSERT_NAME_FROM_TELEMETRY"</span>
  <span data-ty>Error:</span>
  <span data-ty>0: Starting an authority without network key</span>
  <span data-ty>This is not a safe operation because other authorities in the network may depend on your node having a stable identity.</span>
  <span data-ty>Otherwise these other authorities may not being able to reach you.</span>
  <span data-ty>If it is the first time running your node you could use one of the following methods:</span>
  <span data-ty>1. [Preferred] Separately generate the key with: INSERT_NODE_BINARY key generate-node-key --base-path INSERT_YOUR_BASE_PATH</span>
  <span data-ty>2. [Preferred] Separately generate the key with: INSERT_NODE_BINARY key generate-node-key --file INSERT_YOUR_PATH_TO_NODE_KEY</span>
  <span data-ty>3. [Preferred] Separately generate the key with: INSERT_NODE_BINARY key generate-node-key --default-base-path</span>
  <span data-ty>4. [Unsafe] Pass --unsafe-force-node-key-generation and make sure you remove it for subsequent node restarts</span>
  <span data-ty="input"><span class="file-path"></span></span>
</div>

### Generate the Node Key

Use one of the following methods to generate your node key:

=== "Save to file"

    The recommended solution is to generate a node key and save it to a file using the following command:

    ``` bash
    polkadot key generate-node-key --file INSERT_PATH_TO_NODE_KEY
    ```
    
=== "Use default path"

    You can also generate the node key with the following command, which will automatically save the key to the base path of your node:

    ``` bash
    polkadot key generate-node-key --default-base-path
    ```

Save the file path for reference. You will need it in the next step to configure your node with a static identity.

### Set Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node's startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without the risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.


---

Page Title: Validator Requirements

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/infrastructure-running-a-validator-requirements.md
- Canonical (HTML): https://docs.polkadot.com/infrastructure/running-a-validator/requirements/
- Summary: Explore the technical and system requirements for running a Polkadot validator, including setup, hardware, staking prerequisites, and security best practices.

# Validator Requirements

## Introduction

Running a validator in the Polkadot ecosystem is essential for maintaining network security and decentralization. Validators are responsible for validating transactions and adding new blocks to the chain, ensuring the system operates smoothly. In return for their services, validators earn rewards. However, the role comes with inherent risks, such as slashing penalties for misbehavior or technical failures. If you’re new to validation, starting on Kusama provides a lower-stakes environment to gain valuable experience before progressing to the Polkadot network.

This guide covers everything you need to know about becoming a validator, including system requirements, staking prerequisites, and infrastructure setup. Whether you’re deploying on a VPS or running your node on custom hardware, you’ll learn how to optimize your validator for performance and security, ensuring compliance with network standards while minimizing risks.

## Prerequisites

Running a validator requires solid system administration skills and a secure, well-maintained infrastructure. Below are the primary requirements you need to be aware of before getting started:

- **System administration expertise**: Handling technical anomalies and maintaining node infrastructure is critical. Validators must be able to troubleshoot and optimize their setup.
- **Security**: Ensure your setup follows best practices for securing your node. Refer to the [Secure Your Validator](/infrastructure/running-a-validator/operational-tasks/general-management/#secure-your-validator){target=\_blank} section to learn about important security measures.
- **Network choice**: Start with [Kusama](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/#run-a-kusama-validator){target=\_blank} to gain experience. Look for "Adjustments for Kusama" throughout these guides for tips on adapting the provided instructions for the Kusama network.
- **Staking requirements**: A minimum amount of native token (KSM or DOT) is required to be elected into the validator set. The required stake can come from your own holdings or from nominators.
- **Risk of slashing**: Any DOT you stake is at risk if your setup fails or your validator misbehaves. If you’re unsure of your ability to maintain a reliable validator, consider nominating your DOT to a trusted validator.

## Minimum Hardware Requirements

Polkadot validators rely on high-performance hardware to process blocks efficiently. The recommended minimum hardware requirements to ensure a fully functional and performant validator are as follows:

- CPU:

    - x86-64 compatible.
    - Eight physical cores @ 3.4 GHz.
    - Processor:
        - **Intel**: Ice Lake or newer (Xeon or Core series)
        - **AMD**: Zen3 or newer (EPYC or Ryzen)
    - Simultaneous multithreading disabled:
        - **Intel**: Hyper-Threading
        - **AMD**: SMT
    - [Single-threaded performance](https://www.cpubenchmark.net/singleThread.html){target=\_blank} is prioritized over higher cores count.

- Storage:

    - **NVMe SSD**: At least 2 TB for blockchain data recommended (prioritize latency rather than throughput).
    - Storage requirements will increase as the chain grows. For current estimates, see the [current chain snapshot](https://stakeworld.io/docs/dbsize){target=\_blank}.

- Memory:

    - 32 GB DDR4 ECC

- Network:

    - Symmetric networking speed of 500 Mbit/s is required to handle large numbers of parachains and ensure congestion control during peak times.

## VPS Provider List

When selecting a VPS provider for your validator node, prioritize reliability, consistent performance, and adherence to the specific hardware requirements set for Polkadot validators. The following server types have been tested and showed acceptable performance in benchmark tests. However, this is not an endorsement and actual performance may vary depending on your workload and VPS provider.

Be aware that some providers may overprovision the underlying host and use shared storage such as NVMe over TCP, which appears as local storage. These setups might result in poor or inconsistent performance. Benchmark your infrastructure before deploying.

- **[Google Cloud Platform (GCP)](https://cloud.google.com/){target=\_blank}**: `c2` and `c2d` machine families offer high-performance configurations suitable for validators.
- **[Amazon Web Services (AWS)](https://aws.amazon.com/){target=\_blank}**: `c6id` machine family provides strong performance, particularly for I/O-intensive workloads.
- **[OVH](https://www.ovhcloud.com/en-au/){target=\_blank}**: Can be a budget-friendly solution if it meets your minimum hardware specifications.
- **[Digital Ocean](https://www.digitalocean.com/){target=\_blank}**: Popular among developers, Digital Ocean's premium droplets offer configurations suitable for medium to high-intensity workloads.
- **[Vultr](https://www.vultr.com/){target=\_blank}**: Offers flexibility with plans that may meet validator requirements, especially for high-bandwidth needs.
- **[Linode](https://www.linode.com/){target=\_blank}**: Provides detailed documentation, which can be helpful for setup.
- **[Scaleway](https://www.scaleway.com/en/){target=\_blank}**: Offers high-performance cloud instances that can be suitable for validator nodes.
- **[OnFinality](https://onfinality.io/en){target=\_blank}**: Specialized in blockchain infrastructure, OnFinality provides validator-specific support and configurations.

!!! warning "Acceptable use policies"
    Different VPS providers have varying acceptable use policies, and not all allow cryptocurrency-related activities. 

    For example, Digital Ocean, requires explicit permission to use servers for cryptocurrency mining and defines unauthorized mining as [network abuse](https://www.digitalocean.com/legal/acceptable-use-policy#network-abuse){target=\_blank} in their acceptable use policy. 
    
    Review the terms for your VPS provider to avoid account suspension or server shutdown due to policy violations.

## Minimum Bond Requirement

Before bonding DOT, ensure you meet the minimum bond requirement to start a validator instance. The minimum bond is the least DOT you need to stake to enter the validator set. To become eligible for rewards, your validator node must be nominated by enough staked tokens.

For example, on November 19, 2024, the minimum stake backing a validator in Polkadot's era 1632 was 1,159,434.248 DOT. You can check the current minimum stake required using these tools:

- [**Chain State Values**](https://wiki.polkadot.com/general/chain-state-values/){target=\_blank}
- [**Subscan**](https://polkadot.subscan.io/validator_list?status=validator){target=\_blank}
- [**Staking Dashboard**](https://staking.polkadot.cloud/#/overview){target=\_blank}


---

Page Title: XCM Channels

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-xcm-channels.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/xcm-channels/
- Summary: Learn how Polkadot's cross-consensus messaging (XCM) channels connect parachains, facilitating communication and blockchain interaction.

# XCM Channels

## Introduction

Polkadot is designed to enable interoperability between its connected parachains. At the core of this interoperability is the [Cross-Consensus Message Format (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank}, a standard language that allows parachains to communicate and interact with each other.

The network-layer protocol responsible for delivering XCM-formatted messages between parachains is the [Cross-Chain Message Passing (XCMP)](https://wiki.polkadot.com/learn/learn-xcm-transport/#xcmp-cross-chain-message-passing){target=\_blank} protocol. XCMP maintains messaging queues on the relay chain, serving as a bridge to facilitate cross-chain interactions.

As XCMP is still under development, Polkadot has implemented a temporary alternative called [Horizontal Relay-routed Message Passing (HRMP)](https://wiki.polkadot.com/learn/learn-xcm-transport/#hrmp-xcmp-lite){target=\_blank}. HRMP offers the same interface and functionality as the planned XCMP but it has a crucial difference, it stores all messages directly in the relay chain's storage, which is more resource-intensive.

Once XCMP is fully implemented, HRMP will be deprecated in favor of the native XCMP protocol. XCMP will offer a more efficient and scalable solution for cross-chain message passing, as it will not require the relay chain to store all the messages.

## Establishing HRMP Channels

To enable communication between parachains using the HRMP protocol, the parachains must explicitly establish communication channels by registering them on the relay chain.

Downward and upward channels from and to the relay chain are implicitly available, meaning they do not need to be explicitly opened.

Opening an HRMP channel requires the parachains involved to make a deposit on the relay chain. This deposit serves a specific purpose, it covers the costs associated with using the relay chain's storage for the message queues linked to the channel. The amount of this deposit varies based on parameters defined by the specific relay chain being used.

### Relay Chain Parameters

Each Polkadot relay chain has a set of configurable parameters that control the behavior of the message channels between parachains. These parameters include [`hrmpSenderDeposit`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/configuration/struct.HostConfiguration.html#structfield.hrmp_sender_deposit){target=\_blank}, [`hrmpRecipientDeposit`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/configuration/struct.HostConfiguration.html#structfield.hrmp_recipient_deposit){target=\_blank}, [`hrmpChannelMaxMessageSize`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/configuration/struct.HostConfiguration.html#structfield.hrmp_channel_max_message_size){target=\_blank}, [`hrmpChannelMaxCapacity`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/configuration/struct.HostConfiguration.html#structfield.hrmp_channel_max_capacity){target=\_blank}, and more.

When a parachain wants to open a new channel, it must consider these parameter values to ensure the channel is configured correctly.

To view the current values of these parameters in the Polkadot network:

1. Visit [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot.api.onfinality.io%2Fpublic-ws#/explorer), navigate to the **Developer** dropdown and select the **Chain state** option.

    ![](/images/develop/interoperability/xcm-channels/xcm-channels-1.webp)

2. Query the chain configuration parameters. The result will display the current settings for all the Polkadot network parameters, including the HRMP channel settings.

    1. Select **`configuration`**.
    2. Choose the **`activeConfig()`** call.
    3. Click the **+** button to execute the query.
    4. Check the chain configuration.

        ![](/images/develop/interoperability/xcm-channels/xcm-channels-2.webp)

### Dispatching Extrinsics

Establishing new HRMP channels between parachains requires dispatching specific extrinsic calls on the Polkadot Relay Chain from the parachain's origin.

The most straightforward approach is to implement the channel opening logic off-chain, then use the XCM pallet's [`send`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.send.html){target=\_blank} extrinsic to submit the necessary instructions to the relay chain. However, the ability to send arbitrary programs through the [`Transact`](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#transact){target=\_blank} instruction in XCM is typically restricted to privileged origins, such as the [`sudo`](https://paritytech.github.io/polkadot-sdk/master/pallet_sudo/pallet/dispatchables/fn.sudo.html){target=\_blank} pallet or governance mechanisms.

Parachain developers have a few options for triggering the required extrinsic calls from their parachain's origin, depending on the configuration and access controls defined:

- **Sudo**: If the parachain has a `sudo` pallet configured, the sudo key holder can use the sudo extrinsic to dispatch the necessary channel opening calls.
- **Governance**: The parachain's governance system, such as a council or OpenGov, can be used to authorize the channel opening calls.
- **Privileged accounts**: The parachain may have other designated privileged accounts that are allowed to dispatch the HRMP channel opening extrinsics.

## Where to Go Next

Explore the following tutorials for detailed, step-by-step guidance on setting up cross-chain communication channels in Polkadot:

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Opening HRMP Channels Between Parachains__

    ---

    Learn how to open HRMP channels between parachains on Polkadot. Discover the step-by-step process for establishing uni- and bidirectional communication.

    [:octicons-arrow-right-24: Reference](/tutorials/interoperability/xcm-channels/para-to-para/)

-   <span class="badge tutorial">Tutorial</span> __Opening HRMP Channels with System Parachains__

    ---

    Learn how to open HRMP channels with Polkadot system parachains. Discover the process for establishing bi-directional communication using a single XCM message.

    [:octicons-arrow-right-24: Reference](/tutorials/interoperability/xcm-channels/para-to-system/)

</div>


---

Page Title: XCM Config

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-xcm-config.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/xcm-config/
- Summary: Learn how the XCM Executor configuration works for your custom Polkadot SDK-based runtime with detailed guidance and references.

# XCM Config

## Introduction

The [XCM executor](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/index.html){target=\_blank} is a crucial component responsible for interpreting and executing XCM messages (XCMs) with Polkadot SDK-based chains. It processes and manages XCM instructions, ensuring they are executed correctly and in sequentially. Adhering to the [Cross-Consensus Virtual Machine (XCVM) specification](https://paritytech.github.io/xcm-docs/overview/xcvm.html#the-xcvm){target=\_blank}, the XCM executor can be customized or replaced with an alternative that also complies with the [XCVM standards](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#12-the-xcvm){target=\_blank}.

The `XcmExecutor` is not a pallet but a struct parameterized by a `Config` trait. The `Config` trait is the inner configuration, parameterizing the outer `XcmExecutor<Config>` struct. Both configurations are set up within the runtime.

The executor is highly configurable, with the [XCM builder](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/index.html){target=\_blank} offering building blocks to tailor the configuration to specific needs. While they serve as a foundation, users can easily create custom blocks to suit unique configurations. Users can also create their building blocks to address unique needs. This article examines the XCM configuration process, explains each configurable item, and provides examples of the tools and types available to help customize these settings.

## XCM Executor Configuration

The `Config` trait defines the XCM executor’s configuration, which requires several associated types. Each type has specific trait bounds that the concrete implementation must fulfill. Some types, such as `RuntimeCall`, come with a default implementation in most cases, while others use the unit type `()` as the default. For many of these types, selecting the appropriate implementation carefully is crucial. Predefined solutions and building blocks can be adapted to your specific needs. These solutions can be found in the [`xcm-builder`](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2506-2/polkadot/xcm/xcm-builder){target=\_blank} folder.

Each type is explained below, along with an overview of some of its implementations:

```rust
pub trait Config {
    type RuntimeCall: Parameter + Dispatchable<PostInfo = PostDispatchInfo> + GetDispatchInfo;
    type XcmSender: SendXcm;
    type AssetTransactor: TransactAsset;
    type OriginConverter: ConvertOrigin<<Self::RuntimeCall as Dispatchable>::RuntimeOrigin>;
    type IsReserve: ContainsPair<MultiAsset, MultiLocation>;
    type IsTeleporter: ContainsPair<MultiAsset, MultiLocation>;
    type Aliasers: ContainsPair<Location, Location>;
    type UniversalLocation: Get<InteriorMultiLocation>;
    type Barrier: ShouldExecute;
    type Weigher: WeightBounds<Self::RuntimeCall>;
    type Trader: WeightTrader;
    type ResponseHandler: OnResponse;
    type AssetTrap: DropAssets;
    type AssetClaims: ClaimAssets;
    type AssetLocker: AssetLock;
    type AssetExchanger: AssetExchange;
    type SubscriptionService: VersionChangeNotifier;
    type PalletInstancesInfo: PalletsInfoAccess;
    type MaxAssetsIntoHolding: Get<u32>;
    type FeeManager: FeeManager;
    type MessageExporter: ExportXcm;
    type UniversalAliases: Contains<(MultiLocation, Junction)>;
    type CallDispatcher: CallDispatcher<Self::RuntimeCall>;
    type SafeCallFilter: Contains<Self::RuntimeCall>;
    type TransactionalProcessor: ProcessTransaction;
    type HrmpNewChannelOpenRequestHandler: HandleHrmpNewChannelOpenRequest;
    type HrmpChannelAcceptedHandler: HandleHrmpChannelAccepted;
    type HrmpChannelClosingHandler: HandleHrmpChannelClosing;
    type XcmRecorder: RecordXcm;
}
```

## Config Items

Each configuration item is explained below, detailing the associated type’s purpose and role in the XCM executor. Many of these types have predefined solutions available in the `xcm-builder`. Therefore, the available configuration items are:

- **[`RuntimeCall`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.RuntimeCall){target=\_blank}**: Defines the runtime's callable functions, created via the [`frame::runtime`](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank} macro. It represents an enum listing the callable functions of all implemented pallets.

    ```rust
    type RuntimeCall: Parameter + Dispatchable<PostInfo = PostDispatchInfo> + GetDispatchInfo
    ```
   The associated traits signify:

    - **`Parameter`**: Ensures the type is encodable, decodable, and usable as a parameter.
    - **`Dispatchable`**: Indicates it can be executed in the runtime.
    - **`GetDispatchInfo`**: Provides weight details, determining how long execution takes.

- **[`XcmSender`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.XcmSender){target=\_blank}**: Implements the [`SendXcm`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v4/trait.SendXcm.html){target=\_blank} trait, specifying how the executor sends XCMs using transport layers (e.g., UMP for relay chains or XCMP for sibling chains). If a runtime lacks certain transport layers, such as [HRMP](https://wiki.polkadot.com/learn/learn-xcm-transport/#hrmp-xcmp-lite){target=\_blank} (or [XCMP](https://wiki.polkadot.com/learn/learn-xcm-transport/#xcmp-cross-consensus-message-passing-design-summary){target=\_blank}).

    ```rust
    type XcmSender: SendXcm;
    ```

- **[`AssetTransactor`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.AssetTransactor){target=\_blank}**: Implements the [`TransactAsset`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.TransactAsset.html){target=\_blank} trait, handling the conversion and transfer of MultiAssets between accounts or registers. It can be configured to support native tokens, fungibles, and non-fungibles or multiple tokens using pre-defined adapters like [`FungibleAdapter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.FungibleAdapter.html){target=\_blank} or custom solutions.

    ```rust
    type AssetTransactor: TransactAsset;
    ```

- **[`OriginConverter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.OriginConverter){target=\_blank}**: Implements the [`ConvertOrigin`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.ConvertOrigin.html){target=\_blank} trait to map `MultiLocation` origins to `RuntimeOrigin`. Multiple implementations can be combined, and [`OriginKind`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/test_utils/enum.OriginKind.html){target=\_blank} is used to resolve conflicts. Pre-defined converters like [`SovereignSignedViaLocation`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.SovereignSignedViaLocation.html){target=\_blank} and [`SignedAccountId32AsNative`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.SignedAccountId32AsNative.html){target=\_blank} handle sovereign and local accounts respectively.

    ```rust
    type OriginConverter: ConvertOrigin<<Self::RuntimeCall as Dispatchable>::RuntimeOrigin>;
    ```

- **[`IsReserve`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.IsReserve){target=\_blank}**: Specifies trusted `<MultiAsset, MultiLocation>` pairs for depositing reserve assets. Using the unit type `()` blocks reserve deposits. The [`NativeAsset`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.NativeAsset.html){target=\_blank} struct is an example of a reserve implementation.

    ```rust
    type IsReserve: ContainsPair<MultiAsset, MultiLocation>;
    ```

- **[`IsTeleporter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.IsTeleporter){target=\_blank}**: Defines trusted `<MultiAsset, MultiLocation>` pairs for teleporting assets to the chain. Using `()` blocks the [`ReceiveTeleportedAssets`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/test_utils/enum.Instruction.html#variant.ReceiveTeleportedAsset){target=\_blank} instruction. The [`NativeAsset`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.NativeAsset.html){target=\_blank} struct can act as an implementation.

    ```rust
    type IsTeleporter: ContainsPair<MultiAsset, MultiLocation>;
    ```

- **[`Aliasers`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.Aliasers){target=\_blank}**: A list of `(Origin, Target)` pairs enabling each `Origin` to be replaced with its corresponding `Target`.

    ```rust
    type Aliasers: ContainsPair<Location, Location>;
    ```

- **[`UniversalLocation`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.UniversalLocation){target=\_blank}**: Specifies the runtime's location in the consensus universe.

    ```rust
    type UniversalLocation: Get<InteriorMultiLocation>;
    ```

    - Some examples are:
        - `X1(GlobalConsensus(NetworkId::Polkadot))` for Polkadot
        - `X1(GlobalConsensus(NetworkId::Kusama))` for Kusama
        - `X2(GlobalConsensus(NetworkId::Polkadot), Parachain(1000))` for Statemint

- **[`Barrier`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.Barrier){target=\_blank}**: Implements the [`ShouldExecute`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.ShouldExecute.html){target=\_blank} trait, functioning as a firewall for XCM execution. Multiple barriers can be combined in a tuple, where execution halts if one succeeds.

    ```rust
    type Barrier: ShouldExecute;
    ```

- **[`Weigher`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.Weigher){target=\_blank}**: Calculates the weight of XCMs and instructions, enforcing limits and refunding unused weight. Common solutions include [`FixedWeightBounds`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.FixedWeightBounds.html){target=\_blank}, which uses a base weight and limits on instructions.

    ```rust
    type Weigher: WeightBounds<Self::RuntimeCall>;
    ```

- **[`Trader`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.Trader){target=\_blank}**: Manages asset-based weight purchases and refunds for `BuyExecution` instructions. The [`UsingComponents`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.UsingComponents.html){target=\_blank} trader is a common implementation.

    ```rust
    type Trader: WeightTrader;
    ```

- **[`ResponseHandler`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.ResponseHandler){target=\_blank}**: Handles `QueryResponse` instructions, implementing the [`OnResponse`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.OnResponse.html){target=\_blank} trait. FRAME systems typically use the pallet-xcm implementation.

    ```rust
    type ResponseHandler: OnResponse;
    ```

- **[`AssetTrap`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.AssetTrap){target=\_blank}**: Handles leftover assets in the holding register after XCM execution, allowing them to be claimed via `ClaimAsset`. If unsupported, assets are burned.

    ```rust
    type AssetTrap: DropAssets;
    ```

- **[`AssetClaims`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.AssetClaims){target=\_blank}**: Facilitates the claiming of trapped assets during the execution of the `ClaimAsset` instruction. Commonly implemented via pallet-xcm.

    ```rust
    type AssetClaims: ClaimAssets;
    ```

- **[`AssetLocker`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.AssetLocker){target=\_blank}**: Handles the locking and unlocking of assets. Can be omitted using `()` if asset locking is unnecessary.

    ```rust
    type AssetLocker: AssetLock;
    ```

- **[`AssetExchanger`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.AssetExchanger){target=\_blank}**: Implements the [`AssetExchange`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.AssetExchange.html){target=\_blank} trait to manage asset exchanges during the `ExchangeAsset` instruction. The unit type `()` disables this functionality.

    ```rust
    type AssetExchanger: AssetExchange;
    ```

- **[`SubscriptionService`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.SubscriptionService){target=\_blank}**: Manages `(Un)SubscribeVersion` instructions and returns the XCM version via `QueryResponse`. Typically implemented by pallet-xcm.

    ```rust
    type SubscriptionService: VersionChangeNotifier;
    ```

- **[`PalletInstancesInfo`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.PalletInstancesInfo){target=\_blank}**: Provides runtime pallet information for `QueryPallet` and `ExpectPallet` instructions. FRAME-specific systems often use this, or it can be disabled with `()`.

    ```rust
    type PalletInstancesInfo: PalletsInfoAccess;
    ```

 
- [**`MaxAssetsIntoHolding`**](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.MaxAssetsIntoHolding){target=\_blank}: Limits the number of assets in the [Holding register](https://wiki.polkadot.com/learn/learn-xcm/#holding-register){target=\_blank}. At most, twice this limit can be held under worst-case conditions.
    ```rust
    type MaxAssetsIntoHolding: Get<u32>;
    ```

- **[`FeeManager`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.FeeManager){target=\_blank}**: Manages fees for XCM instructions, determining whether fees should be paid, waived, or handled in specific ways. Fees can be waived entirely using `()`.

    ```rust
    type FeeManager: FeeManager;
    ```

- **[`MessageExporter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.MessageExporter){target=\_blank}**: Implements the [`ExportXcm`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.ExportXcm.html){target=\_blank} trait, enabling XCMs export to other consensus systems. It can spoof origins for use in bridges. Use `()` to disable exporting.

    ```rust
    type MessageExporter: ExportXcm;
    ```

- **[`UniversalAliases`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.UniversalAliases){target=\_blank}**: Lists origin locations and universal junctions allowed to elevate themselves in the `UniversalOrigin` instruction. Using `Nothing` prevents origin aliasing.

    ```rust
    type UniversalAliases: Contains<(MultiLocation, Junction)>;
    ```

- **[`CallDispatcher`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.CallDispatcher){target=\_blank}**: Dispatches calls from the `Transact` instruction, adapting the origin or modifying the call as needed. Can default to `RuntimeCall`.

    ```rust
    type CallDispatcher: CallDispatcher<Self::RuntimeCall>;
    ```

- **[`SafeCallFilter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.SafeCallFilter){target=\_blank}**: Whitelists calls permitted in the `Transact` instruction. Using `Everything` allows all calls, though this is temporary until proof size weights are accounted for.

    ```rust
    type SafeCallFilter: Contains<Self::RuntimeCall>;
    ```

- **[`TransactionalProcessor`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.TransactionalProcessor){target=\_blank}**: Implements the [`ProccessTransaction`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/traits/trait.ProcessTransaction.html){target=\_blank} trait. It ensures that XCM instructions are executed atomically, meaning they either fully succeed or fully fail without any partial effects. This type allows for non-transactional XCM instruction processing by setting the `()` type.

    ```rust
    type TransactionalProcessor: ProcessTransaction;
    ```

- **[`HrmpNewChannelOpenRequestHandler`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.HrmpNewChannelOpenRequestHandler){target=\_blank}**: Enables optional logic execution in response to the `HrmpNewChannelOpenRequest` XCM notification.

    ```rust
    type HrmpNewChannelOpenRequestHandler: HandleHrmpNewChannelOpenRequest;
    ```

- **[`HrmpChannelAcceptedHandler`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.HrmpChannelAcceptedHandler){target=\_blank}**: Enables optional logic execution in response to the `HrmpChannelAccepted` XCM notification.

    ```rust
    type HrmpChannelAcceptedHandler: HandleHrmpChannelAccepted;
    ```

- **[`HrmpChannelClosingHandler`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.HrmpChannelClosingHandler){target=\_blank}**: Enables optional logic execution in response to the `HrmpChannelClosing` XCM notification.

    ```rust
    type HrmpChannelClosingHandler: HandleHrmpChannelClosing;
    ```

- **[`XcmRecorder`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/trait.Config.html#associatedtype.XcmRecorder){target=\_blank}**: Allows tracking of the most recently executed XCM, primarily for use with dry-run runtime APIs.

    ```rust
    type XcmRecorder: RecordXcm;
    ```

### Inner Config

The `Config` trait underpins the `XcmExecutor`, defining its core behavior through associated types for asset handling, XCM processing, and permission management. These types are categorized as follows:

- **Handlers**: Manage XCMs sending, asset transactions, and special notifications.
- **Filters**: Define trusted combinations, origin substitutions, and execution barriers.
- **Converters**: Handle origin conversion for call execution.
- **Accessors**: Provide weight determination and pallet information.
- **Constants**: Specify universal locations and asset limits.
- **Common Configs**: Include shared settings like `RuntimeCall`.

The following diagram outlines this categorization:

```mermaid
flowchart LR
    A[Inner Config] --> B[Handlers]
    A --> C[Filters]
    A --> D[Converters]
    A --> E[Accessors]
    A --> F[Constants]
    A --> G[Common Configs]

    B --> H[XcmSender]
    B --> I[AssetTransactor]
    B --> J[Trader]
    B --> K[ResponseHandler]
    B --> L[AssetTrap]
    B --> M[AssetLocker]
    B --> N[AssetExchanger]
    B --> O[AssetClaims]
    B --> P[SubscriptionService]
    B --> Q[FeeManager]
    B --> R[MessageExporter]
    B --> S[CallDispatcher]
    B --> T[HrmpNewChannelOpenRequestHandler]
    B --> U[HrmpChannelAcceptedHandler]
    B --> V[HrmpChannelClosingHandler]

    C --> W[IsReserve]
    C --> X[IsTeleporter]
    C --> Y[Aliasers]
    C --> Z[Barrier]
    C --> AA[UniversalAliases]
    C --> AB[SafeCallFilter]

    D --> AC[OriginConverter]

    E --> AD[Weigher]
    E --> AE[PalletInstancesInfo]

    F --> AF[UniversalLocation]
    F --> AG[MaxAssetsIntoHolding]

    G --> AH[RuntimeCall]
```

### Outer Config

The `XcmExecutor<Config>` struct extends the functionality of the inner config by introducing fields for execution context, asset handling, error tracking, and operational management. For further details, see the documentation for [`XcmExecutor<Config>`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/struct.XcmExecutor.html#impl-XcmExecutor%3CConfig%3E){target=\_blank}.

## Multiple Implementations

Some associated types in the `Config` trait are highly configurable and may have multiple implementations (e.g., Barrier). These implementations are organized into a tuple `(impl_1, impl_2, ..., impl_n)`, and the execution follows a sequential order. Each item in the tuple is evaluated individually, each being checked to see if it fails. If an item passes (e.g., returns `Ok` or `true`), the execution stops, and the remaining items are not evaluated. The following example of the `Barrier` type demonstrates how this grouping operates (understanding each item in the tuple is unnecessary for this explanation).

In the following example, the system will first check the `TakeWeightCredit` type when evaluating the barrier. If it fails, it will check `AllowTopLevelPaidExecutionFrom`, and so on, until one of them returns a positive result. If all checks fail, a Barrier error will be triggered.

```rust
pub type Barrier = (
    TakeWeightCredit,
    AllowTopLevelPaidExecutionFrom<Everything>,
    AllowKnownQueryResponses<XcmPallet>,
    AllowSubscriptionsFrom<Everything>,
);

pub struct XcmConfig;
impl xcm_executor::Config for XcmConfig {
    ...
    type Barrier = Barrier;
    ...
}
```


---

Page Title: XCM Runtime APIs

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-interoperability-xcm-runtime-apis.md
- Canonical (HTML): https://docs.polkadot.com/develop/interoperability/xcm-runtime-apis/
- Summary: Learn about XCM Runtime APIs in Polkadot for cross-chain communication. Explore the APIs to simulate and test XCM messages before execution on the network.

# XCM Runtime APIs

## Introduction

Runtime APIs allow node-side code to extract information from the runtime state. While simple storage access retrieves stored values directly, runtime APIs enable arbitrary computation, making them a powerful tool for interacting with the chain's state.

Unlike direct storage access, runtime APIs can derive values from storage based on arguments or perform computations that don't require storage access. For example, a runtime API might expose a formula for fee calculation, using only the provided arguments as inputs rather than fetching data from storage.

In general, runtime APIs are used for:

- Accessing a storage item.
- Retrieving a bundle of related storage items.
- Deriving a value from storage based on arguments.
- Exposing formulas for complex computational calculations.

This section will teach you about specific runtime APIs that support XCM processing and manipulation.

## Dry Run API

The [Dry-run API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/trait.DryRunApi.html){target=\_blank}, given an extrinsic, or an XCM program, returns its effects:

- Execution result
- Local XCM (in the case of an extrinsic)
- Forwarded XCMs
- List of events

This API can be used independently for dry-running, double-checking, or testing. However, it mainly shines when used with the [Xcm Payment API](#xcm-payment-api), given that it only estimates fees if you know the specific XCM you want to execute or send.

### Dry Run Call

This API allows a dry-run of any extrinsic and obtaining the outcome if it fails or succeeds, as well as the local xcm and remote xcm messages sent to other chains.

```rust
fn dry_run_call(origin: OriginCaller, call: Call, result_xcms_version: XcmVersion) -> Result<CallDryRunEffects<Event>, Error>;
```

??? interface "Input parameters"

    `origin` ++"OriginCaller"++ <span class="required" markdown>++"required"++</span>
    
    The origin used for executing the transaction.

    ---

    `call` ++"Call"++ <span class="required" markdown>++"required"++</span>

    The extrinsic to be executed.

    ---

??? interface "Output parameters"

    ++"Result<CallDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `CallDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `local_xcm` ++"Option<VersionedXcm<()>>"++

        The local XCM that was attempted to be executed, if any.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.

??? interface "Example"

    This example demonstrates how to simulate a cross-chain asset transfer from the Paseo network to the Pop Network using a [reserve transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#reserve-asset-transfer){target=\_blank} mechanism. Instead of executing the actual transfer, the code shows how to test and verify the transaction's behavior through a dry run before performing it on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { paseo } from '@polkadot-api/descriptors';
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import {
      PolkadotRuntimeOriginCaller,
      XcmVersionedLocation,
      XcmVersionedAssets,
      XcmV3Junction,
      XcmV3Junctions,
      XcmV3WeightLimit,
      XcmV3MultiassetFungibility,
      XcmV3MultiassetAssetId,
    } from '@polkadot-api/descriptors';
    import { DispatchRawOrigin } from '@polkadot-api/descriptors';
    import { Binary } from 'polkadot-api';
    import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

    // Connect to the Paseo relay chain
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://paseo-rpc.dwellir.com')),
    );

    const paseoApi = client.getTypedApi(paseo);

    const popParaID = 4001;
    const userAddress = 'INSERT_USER_ADDRESS';
    const userPublicKey = ss58Decode(userAddress)[0];
    const idBeneficiary = Binary.fromBytes(userPublicKey);

    // Define the origin caller
    // This is a regular signed account owned by a user
    let origin = PolkadotRuntimeOriginCaller.system(
      DispatchRawOrigin.Signed(userAddress),
    );

    // Define a transaction to transfer assets from Polkadot to Pop Network using a Reserve Transfer
    const tx = paseoApi.tx.XcmPallet.limited_reserve_transfer_assets({
      dest: XcmVersionedLocation.V3({
        parents: 0,
        interior: XcmV3Junctions.X1(
          XcmV3Junction.Parachain(popParaID), // Destination is the Pop Network parachain
        ),
      }),
      beneficiary: XcmVersionedLocation.V3({
        parents: 0,
        interior: XcmV3Junctions.X1(
          XcmV3Junction.AccountId32({
            // Beneficiary address on Pop Network
            network: undefined,
            id: idBeneficiary,
          }),
        ),
      }),
      assets: XcmVersionedAssets.V3([
        {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 0,
            interior: XcmV3Junctions.Here(), // Native asset from the sender. In this case PAS
          }),
          fun: XcmV3MultiassetFungibility.Fungible(120000000000n), // Asset amount to transfer
        },
      ]),
      fee_asset_item: 0, // Asset used to pay transaction fees
      weight_limit: XcmV3WeightLimit.Unlimited(), // No weight limit on transaction
    });

    // Execute the dry run call to simulate the transaction
    const dryRunResult = await paseoApi.apis.DryRunApi.dry_run_call(
      origin,
      tx.decodedCall,
    );

    // Extract the data from the dry run result
    const {
      execution_result: executionResult,
      emitted_events: emmittedEvents,
      local_xcm: localXcm,
      forwarded_xcms: forwardedXcms,
    } = dryRunResult.value;

    // Extract the XCM generated by this call
    const xcmsToPop = forwardedXcms.find(
      ([location, _]) =>
        location.type === 'V4' &&
        location.value.parents === 0 &&
        location.value.interior.type === 'X1' &&
        location.value.interior.value.type === 'Parachain' &&
        location.value.interior.value.value === popParaID, // Pop network's ParaID
    );
    const destination = xcmsToPop[0];
    const remoteXcm = xcmsToPop[1][0];

    // Print the results
    const resultObject = {
      execution_result: executionResult,
      emitted_events: emmittedEvents,
      local_xcm: localXcm,
      destination: destination,
      remote_xcm: remoteXcm,
    };

    console.dir(resultObject, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <pre>
        {
          execution_result: {
            success: true,
            value: {
              actual_weight: undefined,
              pays_fee: { type: 'Yes', value: undefined }
            }
          },
          emitted_events: [
            {
              type: 'Balances',
              value: {
                type: 'Transfer',
                value: {
                  from: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  to: '13YMK2ePPKQeW7ynqLozB65WYjMnNgffQ9uR4AzyGmqnKeLq',
                  amount: 120000000000n
                }
              }
            },
            {
              type: 'Balances',
              value: { type: 'Issued', value: { amount: 0n } }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'Attempted',
                value: {
                  outcome: {
                    type: 'Complete',
                    value: { used: { ref_time: 251861000n, proof_size: 6196n } }
                  }
                }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Burned',
                value: {
                  who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  amount: 397000000n
                }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Minted',
                value: {
                  who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
                  amount: 397000000n
                }
              }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'FeesPaid',
                value: {
                  paying: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: { type: 'Polkadot', value: undefined },
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  },
                  fees: [
                    {
                      id: {
                        parents: 0,
                        interior: { type: 'Here', value: undefined }
                      },
                      fun: { type: 'Fungible', value: 397000000n }
                    }
                  ]
                }
              }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'Sent',
                value: {
                  origin: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: { type: 'Polkadot', value: undefined },
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  },
                  destination: {
                    parents: 0,
                    interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
                  },
                  message: [
                    {
                      type: 'ReserveAssetDeposited',
                      value: [
                        {
                          id: {
                            parents: 1,
                            interior: { type: 'Here', value: undefined }
                          },
                          fun: { type: 'Fungible', value: 120000000000n }
                        }
                      ]
                    },
                    { type: 'ClearOrigin', value: undefined },
                    {
                      type: 'BuyExecution',
                      value: {
                        fees: {
                          id: {
                            parents: 1,
                            interior: { type: 'Here', value: undefined }
                          },
                          fun: { type: 'Fungible', value: 120000000000n }
                        },
                        weight_limit: { type: 'Unlimited', value: undefined }
                      }
                    },
                    {
                      type: 'DepositAsset',
                      value: {
                        assets: {
                          type: 'Wild',
                          value: { type: 'AllCounted', value: 1 }
                        },
                        beneficiary: {
                          parents: 0,
                          interior: {
                            type: 'X1',
                            value: {
                              type: 'AccountId32',
                              value: {
                                network: undefined,
                                id: FixedSizeBinary {
                                  asText: [Function (anonymous)],
                                  asHex: [Function (anonymous)],
                                  asOpaqueHex: [Function (anonymous)],
                                  asBytes: [Function (anonymous)],
                                  asOpaqueBytes: [Function (anonymous)]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ],
                  message_id: FixedSizeBinary {
                    asText: [Function (anonymous)],
                    asHex: [Function (anonymous)],
                    asOpaqueHex: [Function (anonymous)],
                    asBytes: [Function (anonymous)],
                    asOpaqueBytes: [Function (anonymous)]
                  }
                }
              }
            }
          ],
          local_xcm: undefined,
          destination: {
            type: 'V4',
            value: {
              parents: 0,
              interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
            }
          },
          remote_xcm: {
            type: 'V3',
            value: [
              {
                type: 'ReserveAssetDeposited',
                value: [
                  {
                    id: {
                      type: 'Concrete',
                      value: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      }
                    },
                    fun: { type: 'Fungible', value: 120000000000n }
                  }
                ]
              },
              { type: 'ClearOrigin', value: undefined },
              {
                type: 'BuyExecution',
                value: {
                  fees: {
                    id: {
                      type: 'Concrete',
                      value: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      }
                    },
                    fun: { type: 'Fungible', value: 120000000000n }
                  },
                  weight_limit: { type: 'Unlimited', value: undefined }
                }
              },
              {
                type: 'DepositAsset',
                value: {
                  assets: { type: 'Wild', value: { type: 'AllCounted', value: 1 } },
                  beneficiary: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: undefined,
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                type: 'SetTopic',
                value: FixedSizeBinary {
                  asText: [Function (anonymous)],
                  asHex: [Function (anonymous)],
                  asOpaqueHex: [Function (anonymous)],
                  asBytes: [Function (anonymous)],
                  asOpaqueBytes: [Function (anonymous)]
                }
              }
            ]
          }
        }      
      </pre>
    </div>

                ...
    <div id="termynal" data-termynal>
      <pre>
        {
          execution_result: {
            success: true,
            value: {
              actual_weight: undefined,
              pays_fee: { type: 'Yes', value: undefined }
            }
          },
          emitted_events: [
            {
              type: 'Balances',
              value: {
                type: 'Transfer',
                value: {
                  from: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  to: '13YMK2ePPKQeW7ynqLozB65WYjMnNgffQ9uR4AzyGmqnKeLq',
                  amount: 120000000000n
                }
              }
            },
            {
              type: 'Balances',
              value: { type: 'Issued', value: { amount: 0n } }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'Attempted',
                value: {
                  outcome: {
                    type: 'Complete',
                    value: { used: { ref_time: 251861000n, proof_size: 6196n } }
                  }
                }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Burned',
                value: {
                  who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  amount: 397000000n
                }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Minted',
                value: {
                  who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
                  amount: 397000000n
                }
              }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'FeesPaid',
                value: {
                  paying: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: { type: 'Polkadot', value: undefined },
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  },
                  fees: [
                    {
                      id: {
                        parents: 0,
                        interior: { type: 'Here', value: undefined }
                      },
                      fun: { type: 'Fungible', value: 397000000n }
                    }
                  ]
                }
              }
            },
            {
              type: 'XcmPallet',
              value: {
                type: 'Sent',
                value: {
                  origin: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: { type: 'Polkadot', value: undefined },
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  },
                  destination: {
                    parents: 0,
                    interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
                  },
                  message: [
                    {
                      type: 'ReserveAssetDeposited',
                      value: [
                        {
                          id: {
                            parents: 1,
                            interior: { type: 'Here', value: undefined }
                          },
                          fun: { type: 'Fungible', value: 120000000000n }
                        }
                      ]
                    },
                    { type: 'ClearOrigin', value: undefined },
                    {
                      type: 'BuyExecution',
                      value: {
                        fees: {
                          id: {
                            parents: 1,
                            interior: { type: 'Here', value: undefined }
                          },
                          fun: { type: 'Fungible', value: 120000000000n }
                        },
                        weight_limit: { type: 'Unlimited', value: undefined }
                      }
                    },
                    {
                      type: 'DepositAsset',
                      value: {
                        assets: {
                          type: 'Wild',
                          value: { type: 'AllCounted', value: 1 }
                        },
                        beneficiary: {
                          parents: 0,
                          interior: {
                            type: 'X1',
                            value: {
                              type: 'AccountId32',
                              value: {
                                network: undefined,
                                id: FixedSizeBinary {
                                  asText: [Function (anonymous)],
                                  asHex: [Function (anonymous)],
                                  asOpaqueHex: [Function (anonymous)],
                                  asBytes: [Function (anonymous)],
                                  asOpaqueBytes: [Function (anonymous)]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ],
                  message_id: FixedSizeBinary {
                    asText: [Function (anonymous)],
                    asHex: [Function (anonymous)],
                    asOpaqueHex: [Function (anonymous)],
                    asBytes: [Function (anonymous)],
                    asOpaqueBytes: [Function (anonymous)]
                  }
                }
              }
            }
          ],
          local_xcm: undefined,
          destination: {
            type: 'V4',
            value: {
              parents: 0,
              interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
            }
          },
          remote_xcm: {
            type: 'V3',
            value: [
              {
                type: 'ReserveAssetDeposited',
                value: [
                  {
                    id: {
                      type: 'Concrete',
                      value: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      }
                    },
                    fun: { type: 'Fungible', value: 120000000000n }
                  }
                ]
              },
              { type: 'ClearOrigin', value: undefined },
              {
                type: 'BuyExecution',
                value: {
                  fees: {
                    id: {
                      type: 'Concrete',
                      value: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      }
                    },
                    fun: { type: 'Fungible', value: 120000000000n }
                  },
                  weight_limit: { type: 'Unlimited', value: undefined }
                }
              },
              {
                type: 'DepositAsset',
                value: {
                  assets: { type: 'Wild', value: { type: 'AllCounted', value: 1 } },
                  beneficiary: {
                    parents: 0,
                    interior: {
                      type: 'X1',
                      value: {
                        type: 'AccountId32',
                        value: {
                          network: undefined,
                          id: FixedSizeBinary {
                            asText: [Function (anonymous)],
                            asHex: [Function (anonymous)],
                            asOpaqueHex: [Function (anonymous)],
                            asBytes: [Function (anonymous)],
                            asOpaqueBytes: [Function (anonymous)]
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                type: 'SetTopic',
                value: FixedSizeBinary {
                  asText: [Function (anonymous)],
                  asHex: [Function (anonymous)],
                  asOpaqueHex: [Function (anonymous)],
                  asBytes: [Function (anonymous)],
                  asOpaqueBytes: [Function (anonymous)]
                }
              }
            ]
          }
        }      
      </pre>
    </div>

    ---

### Dry Run XCM

This API allows the direct dry-run of an xcm message instead of an extrinsic one, checks if it will execute successfully, and determines what other xcm messages will be forwarded to other chains.

```rust
fn dry_run_xcm(origin_location: VersionedLocation, xcm: VersionedXcm<Call>) -> Result<XcmDryRunEffects<Event>, Error>;
```

??? interface "Input parameters"

    `origin_location` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>

    The location of the origin that will execute the xcm message.

    ---

    `xcm` ++"VersionedXcm<Call>"++ <span class="required" markdown>++"required"++</span>

    A versioned XCM message.

    ---

??? interface "Output parameters"

    ++"Result<XcmDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `XcmDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.

    ---

??? interface "Example"

    This example demonstrates how to simulate a [teleport asset transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#asset-teleportation){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain. The code shows how to test and verify the received XCM message's behavior in the destination chain through a dry run on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

     ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import {
      XcmVersionedXcm,
      paseoAssetHub,
      XcmVersionedLocation,
      XcmV3Junction,
      XcmV3Junctions,
      XcmV3WeightLimit,
      XcmV3MultiassetFungibility,
      XcmV3MultiassetAssetId,
      XcmV3Instruction,
      XcmV3MultiassetMultiAssetFilter,
      XcmV3MultiassetWildMultiAsset,
    } from '@polkadot-api/descriptors';
    import { Binary } from 'polkadot-api';
    import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

    // Connect to Paseo Asset Hub
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
    );

    const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

    const userAddress = 'INSERT_USER_ADDRESS';
    const userPublicKey = ss58Decode(userAddress)[0];
    const idBeneficiary = Binary.fromBytes(userPublicKey);

    // Define the origin
    const origin = XcmVersionedLocation.V3({
      parents: 1,
      interior: XcmV3Junctions.Here(),
    });

    // Define a xcm message comming from the Paseo relay chain to Asset Hub to Teleport some tokens
    const xcm = XcmVersionedXcm.V3([
      XcmV3Instruction.ReceiveTeleportedAsset([
        {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
        },
      ]),
      XcmV3Instruction.ClearOrigin(),
      XcmV3Instruction.BuyExecution({
        fees: {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
        },
        weight_limit: XcmV3WeightLimit.Unlimited(),
      }),
      XcmV3Instruction.DepositAsset({
        assets: XcmV3MultiassetMultiAssetFilter.Wild(
          XcmV3MultiassetWildMultiAsset.All(),
        ),
        beneficiary: {
          parents: 0,
          interior: XcmV3Junctions.X1(
            XcmV3Junction.AccountId32({
              network: undefined,
              id: idBeneficiary,
            }),
          ),
        },
      }),
    ]);

    // Execute dry run xcm
    const dryRunResult = await paseoAssetHubApi.apis.DryRunApi.dry_run_xcm(
      origin,
      xcm,
    );

    // Print the results
    console.dir(dryRunResult.value, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <pre>
        {
          execution_result: {
            type: 'Complete',
            value: { used: { ref_time: 15574200000n, proof_size: 359300n } }
          },
          emitted_events: [
            {
              type: 'System',
              value: {
                type: 'NewAccount',
                value: { account: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET' }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Endowed',
                value: {
                  account: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  free_balance: 10203500000n
                }
              }
            },
            {
              type: 'Balances',
              value: {
                type: 'Minted',
                value: {
                  who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
                  amount: 10203500000n
                }
              }
            },
            {
              type: 'Balances',
              value: { type: 'Issued', value: { amount: 1796500000n } }
            },
            {
              type: 'Balances',
              value: {
                type: 'Deposit',
                value: {
                  who: '13UVJyLgBASGhE2ok3TvxUfaQBGUt88JCcdYjHvUhvQkFTTx',
                  amount: 1796500000n
                }
              }
            }
          ],
          forwarded_xcms: [
            [
              {
                type: 'V4',
                value: { parents: 1, interior: { type: 'Here', value: undefined } }
              },
              []
            ]
          ]
        }
      </pre>
    </div>

    ---

## XCM Payment API

The [XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} provides a standardized way to determine the costs and payment options for executing XCM messages. Specifically, it enables clients to:

- Retrieve the [weight](/polkadot-protocol/glossary/#weight) required to execute an XCM message.
- Obtain a list of acceptable `AssetIds` for paying execution fees.
- Calculate the cost of the weight in a specified `AssetId`.
- Estimate the fees for XCM message delivery.

This API eliminates the need for clients to guess execution fees or identify acceptable assets manually. Instead, clients can query the list of supported asset IDs formatted according to the XCM version they understand. With this information, they can weigh the XCM program they intend to execute and convert the computed weight into its cost using one of the acceptable assets.

To use the API effectively, the client must already know the XCM program to be executed and the chains involved in the program's execution.

### Query Acceptable Payment Assets

Retrieves the list of assets that are acceptable for paying fees when using a specific XCM version

```rust
fn query_acceptable_payment_assets(xcm_version: Version) -> Result<Vec<VersionedAssetId>, Error>;
```

??? interface "Input parameters"

    `xcm_version` ++"Version"++ <span class="required" markdown>++"required"++</span>

    Specifies the XCM version that will be used to send the XCM message.

    ---

??? interface "Output parameters"

    ++"Result<Vec<VersionedAssetId>, Error>"++

    A list of acceptable payment assets. Each asset is provided in a versioned format (`VersionedAssetId`) that matches the specified XCM version. If an error occurs, it is returned instead of the asset list.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to query the acceptable payment assets for executing XCM messages on the Paseo Asset Hub network using XCM version 3.

    ***Usage with PAPI***

    ```js
    import { paseoAssetHub } from '@polkadot-api/descriptors';
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

    // Connect to the polkadot relay chain
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
    );

    const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

    // Define the xcm version to use
    const xcmVersion = 3;

    // Execute the runtime call to query the assets
    const result =
      await paseoAssetHubApi.apis.XcmPaymentApi.query_acceptable_payment_assets(
        xcmVersion,
      );

    // Print the assets
    console.dir(result.value, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <pre>
        [
          {
            type: 'V3',
            value: {
              type: 'Concrete',
              value: { parents: 1, interior: { type: 'Here', value: undefined } }
            }
          }
        ]
      </pre>
    </div>

    ---

### Query XCM Weight

Calculates the weight required to execute a given XCM message. It is useful for estimating the execution cost of a cross-chain message in the destination chain before sending it.

```rust
fn query_xcm_weight(message: VersionedXcm<()>) -> Result<Weight, Error>;
```

??? interface "Input parameters"

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    A versioned XCM message whose execution weight is being queried.

    ---

??? interface "Output parameters"

    ++"Result<Weight, Error>"++
    
    The calculated weight required to execute the provided XCM message. If the calculation fails, an error is returned instead.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to calculate the weight needed to execute a [teleport transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#asset-teleportation){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain using the XCM Payment API. The result shows the required weight in terms of reference time and proof size needed in the destination chain.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import {
      XcmVersionedXcm,
      paseoAssetHub,
      XcmV3Junction,
      XcmV3Junctions,
      XcmV3WeightLimit,
      XcmV3MultiassetFungibility,
      XcmV3MultiassetAssetId,
      XcmV3Instruction,
      XcmV3MultiassetMultiAssetFilter,
      XcmV3MultiassetWildMultiAsset,
    } from '@polkadot-api/descriptors';
    import { Binary } from 'polkadot-api';
    import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

    // Connect to Paseo Asset Hub
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
    );

    const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

    const userAddress = 'INSERT_USER_ADDRESS';
    const userPublicKey = ss58Decode(userAddress)[0];
    const idBeneficiary = Binary.fromBytes(userPublicKey);

    // Define a xcm message comming from the Paseo relay chain to Asset Hub to Teleport some tokens
    const xcm = XcmVersionedXcm.V3([
      XcmV3Instruction.ReceiveTeleportedAsset([
        {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
        },
      ]),
      XcmV3Instruction.ClearOrigin(),
      XcmV3Instruction.BuyExecution({
        fees: {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
        },
        weight_limit: XcmV3WeightLimit.Unlimited(),
      }),
      XcmV3Instruction.DepositAsset({
        assets: XcmV3MultiassetMultiAssetFilter.Wild(
          XcmV3MultiassetWildMultiAsset.All(),
        ),
        beneficiary: {
          parents: 0,
          interior: XcmV3Junctions.X1(
            XcmV3Junction.AccountId32({
              network: undefined,
              id: idBeneficiary,
            }),
          ),
        },
      }),
    ]);

    // Execute the query weight runtime call
    const result = await paseoAssetHubApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

    // Print the results
    console.dir(result.value, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <span data-ty>{ ref_time: 15574200000n, proof_size: 359300n }</span>
    </div>

    ---

### Query Weight to Asset Fee

Converts a given weight into the corresponding fee for a specified `AssetId`. It allows clients to determine the cost of execution in terms of the desired asset.

```rust
fn query_weight_to_asset_fee(weight: Weight, asset: VersionedAssetId) -> Result<u128, Error>;
```

??? interface "Input parameters"

    `weight` ++"Weight"++ <span class="required" markdown>++"required"++</span>
    
    The execution weight to be converted into a fee.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ---

    `asset` ++"VersionedAssetId"++ <span class="required" markdown>++"required"++</span>
    
    The asset in which the fee will be calculated. This must be a versioned asset ID compatible with the runtime.

    ---

??? interface "Output parameters"

    ++"Result<u128, Error>"++
    
    The fee needed to pay for the execution for the given `AssetId.`

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to calculate the fee for a given execution weight using a specific versioned asset ID (PAS token) on Paseo Asset Hub.

    ***Usage with PAPI***

    ```js
    import { paseoAssetHub } from '@polkadot-api/descriptors';
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

    // Connect to the polkadot relay chain
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
    );

    const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

    // Define the weight to convert to fee
    const weight = { ref_time: 15574200000n, proof_size: 359300n };

    // Define the versioned asset id
    const versionedAssetId = {
      type: 'V4',
      value: { parents: 1, interior: { type: 'Here', value: undefined } },
    };

    // Execute the runtime call to convert the weight to fee
    const result =
      await paseoAssetHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
        weight,
        versionedAssetId,
      );

    // Print the fee
    console.dir(result.value, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <span data-ty>1796500000n</span>
    </div>

    ---

### Query Delivery Fees

Retrieves the delivery fees for sending a specific XCM message to a designated destination. The fees are always returned in a specific asset defined by the destination chain.

```rust
fn query_delivery_fees(destination: VersionedLocation, message: VersionedXcm<()>) -> Result<VersionedAssets, Error>;
```

??? interface "Input parameters"

    `destination` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>
    
    The target location where the message will be sent. Fees may vary depending on the destination, as different destinations often have unique fee structures and sender mechanisms.

    ---

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    The XCM message to be sent. The delivery fees are calculated based on the message's content and size, which can influence the cost.

    ---

??? interface "Output parameters"

    ++"Result<VersionedAssets, Error>"++
    
    The calculated delivery fees expressed in a specific asset supported by the destination chain. If an error occurs during the query, it returns an error instead.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to query the delivery fees for sending an XCM message from Paseo to Paseo Asset Hub.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/web';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import {
      XcmVersionedXcm,
      paseo,
      XcmVersionedLocation,
      XcmV3Junction,
      XcmV3Junctions,
      XcmV3WeightLimit,
      XcmV3MultiassetFungibility,
      XcmV3MultiassetAssetId,
      XcmV3Instruction,
      XcmV3MultiassetMultiAssetFilter,
      XcmV3MultiassetWildMultiAsset,
    } from '@polkadot-api/descriptors';
    import { Binary } from 'polkadot-api';
    import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

    const client = createClient(
      withPolkadotSdkCompat(getWsProvider('wss://paseo-rpc.dwellir.com')),
    );

    const paseoApi = client.getTypedApi(paseo);

    const paseoAssetHubParaID = 1000;
    const userAddress = 'INSERT_USER_ADDRESS';
    const userPublicKey = ss58Decode(userAddress)[0];
    const idBeneficiary = Binary.fromBytes(userPublicKey);

    // Define the destination
    const destination = XcmVersionedLocation.V3({
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(paseoAssetHubParaID)),
    });

    // Define the xcm message that will be sent to the destination
    const xcm = XcmVersionedXcm.V3([
      XcmV3Instruction.ReceiveTeleportedAsset([
        {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
        },
      ]),
      XcmV3Instruction.ClearOrigin(),
      XcmV3Instruction.BuyExecution({
        fees: {
          id: XcmV3MultiassetAssetId.Concrete({
            parents: 1,
            interior: XcmV3Junctions.Here(),
          }),
          fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
        },
        weight_limit: XcmV3WeightLimit.Unlimited(),
      }),
      XcmV3Instruction.DepositAsset({
        assets: XcmV3MultiassetMultiAssetFilter.Wild(
          XcmV3MultiassetWildMultiAsset.All(),
        ),
        beneficiary: {
          parents: 0,
          interior: XcmV3Junctions.X1(
            XcmV3Junction.AccountId32({
              network: undefined,
              id: idBeneficiary,
            }),
          ),
        },
      }),
    ]);

    // Execute the query delivery fees runtime call
    const result = await paseoApi.apis.XcmPaymentApi.query_delivery_fees(
      destination,
      xcm,
    );

    // Print the results
    console.dir(result.value, { depth: null });

    client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
      <pre>
        {
          type: 'V3',
          value: [
            {
              id: {
                type: 'Concrete',
                value: { parents: 0, interior: { type: 'Here', value: undefined } }
              },
              fun: { type: 'Fungible', value: 396000000n }
            }
          ]
        }
      </pre>
    </div>

    ---


---

Page Title: XCM Tools

- Source (raw): https://raw.githubusercontent.com/polkadot-developers/polkadot-docs/master/ai/pages/develop-toolkit-interoperability-xcm-tools.md
- Canonical (HTML): https://docs.polkadot.com/develop/toolkit/interoperability/xcm-tools/
- Summary: Explore essential XCM tools across Polkadot, crafted to enhance cross-chain functionality and integration within the ecosystem.

# XCM Tools

## Introduction

As described in the [Interoperability](/develop/interoperability){target=\_blank} section, XCM (Cross-Consensus Messaging) is a protocol used in the Polkadot and Kusama ecosystems to enable communication and interaction between chains. It facilitates cross-chain communication, allowing assets, data, and messages to flow seamlessly across the ecosystem.

As XCM is central to enabling communication between blockchains, developers need robust tools to help interact with, build, and test XCM messages. Several XCM tools simplify working with the protocol by providing libraries, frameworks, and utilities that enhance the development process, ensuring that applications built within the Polkadot ecosystem can efficiently use cross-chain functionalities.

## Popular XCM Tools

### Moonsong Labs XCM Tools

[Moonsong Labs XCM Tools](https://github.com/Moonsong-Labs/xcm-tools){target=\_blank} provides a collection of scripts for managing and testing XCM operations between Polkadot SDK-based runtimes. These tools allow performing tasks like asset registration, channel setup, and XCM initialization. Key features include:

- **Asset registration**: Registers assets, setting units per second (up-front fees), and configuring error (revert) codes.
- **XCM initializer**: Initializes XCM, sets default XCM versions, and configures revert codes for XCM-related precompiles.
- **HRMP manipulator**: Manages HRMP channel actions, including opening, accepting, or closing channels.
- **XCM-Transactor-Info-Setter**: Configures transactor information, including extra weight and fee settings.
- **Decode XCM**: Decodes XCM messages on the relay chain or parachains to help interpret cross-chain communication.

To get started, clone the repository and install the required dependencies:

```bash
git clone https://github.com/Moonsong-Labs/xcm-tools && 
cd xcm-tools &&
yarn install
```

For a full overview of each script, visit the [scripts](https://github.com/Moonsong-Labs/xcm-tools/tree/main/scripts){target=\_blank} directory or refer to the [official documentation](https://github.com/Moonsong-Labs/xcm-tools/blob/main/README.md){target=\_blank} on GitHub.

### ParaSpell

[ParaSpell](https://paraspell.xyz/){target=\_blank} is a collection of open-source XCM tools designed to streamline cross-chain asset transfers and interactions within the Polkadot and Kusama ecosystems. It equips developers with an intuitive interface to manage and optimize XCM-based functionalities. Some key points included by ParaSpell are:

- **[XCM SDK](https://paraspell.xyz/#xcm-sdk){target=\_blank}**: Provides a unified layer to incorporate XCM into decentralized applications, simplifying complex cross-chain interactions.
- **[XCM API](https://paraspell.xyz/#xcm-api){target=\_blank}**: Offers an efficient, package-free approach to integrating XCM functionality while offloading heavy computing tasks, minimizing costs and improving application performance.
- **[XCM router](https://paraspell.xyz/#xcm-router){target=\_blank}**: Enables cross-chain asset swaps in a single command, allowing developers to send one asset type (such as DOT on Polkadot) and receive a different asset on another chain (like ASTR on Astar).
- **[XCM analyser](https://paraspell.xyz/#xcm-analyser){target=\_blank}**: Decodes and translates complex XCM multilocation data into readable information, supporting easier troubleshooting and debugging.
- **[XCM visualizator](https://paraspell.xyz/#xcm-visualizator){target=\_blank}**: A tool designed to give developers a clear, interactive view of XCM activity across the Polkadot ecosystem, providing insights into cross-chain communication flow.

ParaSpell's tools make it simple for developers to build, test, and deploy cross-chain solutions without needing extensive knowledge of the XCM protocol. With features like message composition, decoding, and practical utility functions for parachain interactions, ParaSpell is especially useful for debugging and optimizing cross-chain communications.

### Astar XCM Tools

The [Astar parachain](https://github.com/AstarNetwork/Astar/tree/master){target=\_blank} offers a crate with a set of utilities for interacting with the XCM protocol. The [xcm-tools](https://github.com/AstarNetwork/Astar/tree/master/bin/xcm-tools){target=\_blank} crate provides a straightforward method for users to locate a sovereign account or calculate an XC20 asset ID. Some commands included by the xcm-tools crate allow users to perform the following tasks:

- **Sovereign accounts**: Obtain the sovereign account address for any parachain, either on the Relay Chain or for sibling parachains, using a simple command.
- **XC20 EVM addresses**: Generate XC20-compatible Ethereum addresses for assets by entering the asset ID, making it easy to integrate assets across Ethereum-compatible environments.
- **Remote accounts**: Retrieve remote account addresses needed for multi-location compatibility, using flexible options to specify account types and parachain IDs.

To start using these tools, clone the [Astar repository](https://github.com/AstarNetwork/Astar){target=\_blank} and compile the xcm-tools package:

```bash
git clone https://github.com/AstarNetwork/Astar &&
cd Astar &&
cargo build --release -p xcm-tools
```

After compiling, verify the setup with the following command:

```bash
./target/release/xcm-tools --help
```
For more details on using Astar xcm-tools, consult the [official documentation](https://docs.astar.network/docs/learn/interoperability/xcm/integration/tools/){target=\_blank}.

### Chopsticks

The Chopsticks library provides XCM functionality for testing XCM messages across networks, enabling you to fork multiple parachains along with a relay chain. For further details, see the [Chopsticks documentation](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} about XCM.

### Moonbeam XCM SDK

The [Moonbeam XCM SDK](https://github.com/moonbeam-foundation/xcm-sdk){target=\_blank} enables developers to easily transfer assets between chains, either between parachains or between a parachain and the relay chain, within the Polkadot/Kusama ecosystem. With the SDK, you don't need to worry about determining the [Multilocation](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#7-universal-consensus-location-identifiers){target=\_blank} of the origin or destination assets or which extrinsics are used on which networks.

The SDK consists of two main packages:

- **[XCM SDK](https://github.com/moonbeam-foundation/xcm-sdk/tree/main/packages/sdk){target=\_blank}**: Core SDK for executing XCM transfers between chains in the Polkadot/Kusama ecosystem.
- **[MRL SDK](https://github.com/moonbeam-foundation/xcm-sdk/tree/main/packages/mrl){target=\_blank}**: Extension of the XCM SDK for transferring liquidity into and across the Polkadot ecosystem from other ecosystems like Ethereum.

Key features include:

- **Simplified asset transfers**: Abstracts away complex multilocation determinations and extrinsic selection.
- **Cross-ecosystem support**: Enables transfers between Polkadot/Kusama chains and external ecosystems.
- **Developer-friendly API**: Provides intuitive interfaces for cross-chain functionality.
- **Comprehensive documentation**: Includes usage guides and API references for both packages.

For detailed usage examples and API documentation, visit the [official Moonbeam XCM SDK documentation](https://moonbeam-foundation.github.io/xcm-sdk/latest/){target=\_blank}.
