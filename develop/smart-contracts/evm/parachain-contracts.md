---
title: Parachain Contracts
description: Learn how Polkadot parachains such as Moonbeam, Astar, Acala, and Manta leverage the Ethereum Virtual Machine (EVM) and integrate it into their parachains.
---

# Parachain Contracts

## Introduction

One key factor underpinning Ethereum's growth is the ease of deploying to the EVM. The EVM, or Ethereum Virtual Machine, provides developers with a consistent and predictable execution environment for smart contracts. While the EVM is not perfect, its popularity and ease of deployment have far outweighed any shortcomings and resulted in the massive growth of EVM-compatible smart contract platforms. 

Also integral to the proliferation of EVM-based smart contract networks is smart contract portability. Developers can take their smart contracts that they've deployed to Ethereum, and in many cases, deploy them to other EVM-compatible networks with minimal changes. More than "Copy/Paste" deployments, this enables chains' interoperability. Building a cross-chain application is much easier when both chains offer similar EVM compatibility. 

## Why Adopt the EVM as a Polkadot Parachain?

In addition to the developer mindshare of the EVM, Polkadot parachains leveraging the EVM can benefit from the extensive tooling for Ethereum developers that's already been built and battle-tested. This includes wallets, block explorers, developer tools, and more. Beyond just tools, the EVM has had a long headstart regarding smart contract auditors and institutional/custodial asset management. Integrating EVM compatibility can unlock several of these tools by default or allow for relatively easy future integrations. 

Polkadot enables parachains to supercharge the capabilities of their parachain beyond just the limitations of the EVM. To that end, many parachains have developed ways to tap into the powerful features offered by Polkadot, such as through precompiles or solidity interfaces that expose Substrate functionality to app developers and users. This guide will cover some of the unique features that each parachain offers. For more information about each parachain, visit the documentation site for the respective parachain.  

## EVM-Compatible Parachains 

### Astar

[Astar](https://astar.network/){target=\_blank} emerged as a key smart contract platform on Polkadot, distinguished by its unique multiple virtual machine approach that supports both EVM and WebAssembly (Wasm) smart contracts. This dual VM support allows developers to choose their preferred programming environment while maintaining full Ethereum compatibility. The platform's [runtime](https://github.com/AstarNetwork/Astar){target=\_blank} is built on Substrate using FRAME, incorporating crucial components from Polkadot-SDK alongside custom-built modules for handling its unique features.

Astar has established itself as an innovation hub through initiatives like the zk-rollup development framework and integration with multiple Layer 2 scaling solutions. Astar leverages [XCM](/develop/interoperability/intro-to-xcm/){target=\_blank} for native Polkadot ecosystem interoperability while maintaining connections to external networks through various bridge protocols. Through its support for both EVM and Wasm, along with advanced cross-chain capabilities, Astar serves as a crucial gateway for projects looking to leverage the unique advantages of both Ethereum and Polkadot ecosystems while maintaining seamless interoperability between them.

#### Technical Architecture

```mermaid
graph TB
    subgraph "DApp Layer"
        eth["Ethereum DApps\n(Web3)"]
        wasm["Wasm DApps\n(ink!, Ask!)"]
        substrate["Substrate DApps\n(Polkadot.js)"]
    end

    subgraph "Astar Network"
        rpc["RPC Layer\n(Web3 + Substrate)"]
        
        subgraph "Runtime"
            xvm["Cross-Virtual Machine (XVM)"]
            evm["EVM"]
            wasm_vm["Wasm VM"]
            
            subgraph "Core Features"
                staking["dApp Staking"]
            end
        end
    end

    subgraph "Base Layer"
        dot["Polkadot Relay Chain\n(Shared Security)"]
    end

    %% Connections
    eth --> rpc
    wasm --> rpc
    substrate --> rpc
    rpc --> xvm
    xvm --> evm
    xvm --> wasm_vm
    evm <--> wasm_vm
    xvm --> staking
    xvm --> dot

```

The diagram illustrates the layered architecture of Astar Network: at the top, dApps can interact with the Astar network through either Web3, Substrate, or Wasm. These requests flow through Astar's RPC layer into the main runtime, where the magic happens in the virtual machine layer. Here, Astar's unique Cross-Virtual Machine (XVM) coordinates between EVM and Wasm environments, allowing smart contracts from both ecosystems to interact. The Runtime also includes core blockchain functions through various pallets (like system operations and dApps staking), and everything is ultimately secured by connecting to the Polkadot Relay Chain at the bottom layer.

### Moonbeam

[Moonbeam](https://docs.moonbeam.network/){target=\_blank} was the first parachain to bring full Ethereum-compatibility to Polkadot, enabling Ethereum developers to bring their dApps to Polkadot and gain access to the rapidly growing Polkadot user base. [Moonbeam's runtime](https://github.com/moonbeam-foundation/moonbeam){target=\_blank} is built using [FRAME](/develop/blockchains/custom-blockchains/overview/#frame-runtime-architecture){target=\_blank}, and combines essential components from the Polkadot-SDK, Frontier, and custom pallets. The architecture integrates key Substrate offerings like balance management and transaction processing, while [Frontier's](https://github.com/polkadot-evm/frontier){target=\_blank} pallets enable EVM execution and Ethereum compatibility. Custom pallets handle Moonbeam-specific features such as parachain staking and block author verification. Moonbeam offers a variety of precompiles for dApp developers to access powerful Polkadot features via a Solidity interface, such as governance, randomness, transaction batching, and more. 

Additionally, Moonbeam is a hub for interoperability and cross-chain connected contracts. Moonbeam has a variety of integrations with GMP (general message passing) providers, including [Wormhole](https://wormhole.com/){target=\_blank}, [LayerZero](https://layerzero.network/){target=\_blank}, [Axelar](https://www.axelar.network/){target=\_blank}, and more. These integrations make it easy for developers to build cross-chain contracts on Moonbeam, and they also play an integral role in connecting the entire Polkadot ecosystem with other blockchains. Innovations like [Moonbeam Routed Liquidity](https://docs.moonbeam.network/builders/interoperability/mrl/){target=\_blank}, or MRL, enable users to bridge funds between chains like Ethereum and parachains like HydraDX. Through [XCM](/develop/interoperability/intro-to-xcm/){target=\_blank}, other parachains can connect to Moonbeam and access its established bridge connections to Ethereum and other networks, eliminating the need for each parachain to build and maintain their own bridges.

#### Technical Architecture 

``` mermaid
  graph LR
      A[Existing<br/>EVM DApp</br>Frontend]
      B[Ethereum<br/>Development<br/>Tool]
  
      subgraph C[Moonbeam Node]
        direction LR
        D[Web3 RPC]
        subgraph E[Ethereum Pallet]
          direction LR
          F[Substrate<br/>Runtime<br/>Functions]
          G[Block Processor]
        end
        subgraph H[EVM Pallet]
          direction LR
          I[EVM Execution]
        end
  
      end
  
      A --> C
      B --> C
      D --> E
      F --> G 
      E --> H
  
    classDef darkBackground fill:#2b2042,stroke:#000,color:#fff;
    classDef lightBox fill:#b8a8d9,stroke:#000,color:#000;

    class A,B darkBackground
    class D,E,H lightBox

The diagram above illustrates how transactions are processed on Moonbeam. When a DApp or Ethereum development tool (like Hardhat) sends a Web3 RPC request, it's first received by a Moonbeam node. Moonbeam nodes are versatile - they support both Web3 and Substrate RPCs, giving developers the flexibility to use either Ethereum or Substrate tools. When these RPC calls come in, they're processed by corresponding functions in the Substrate runtime. The runtime verifies signatures and processes any Substrate extrinsics. Finally, if the transaction involves smart contracts, these are forwarded to Moonbeam's EVM for execution and state changes.

### Acala

[Acala](https://acala.network/){target=\_blank} positioned itself as Polkadot's DeFi hub by introducing the [Acala EVM+](https://evmdocs.acala.network/){target=\_blank} - an enhanced version of the EVM specifically optimized for DeFi operations. This customized EVM implementation enables seamless deployment of Ethereum-based DeFi protocols while offering advanced features like on-chain scheduling, pre-built DeFi primitives, and native multi-token support that aren't available in traditional EVMs.

Acala supports a comprehensive DeFi ecosystem including a decentralized stablecoin (aUSD) and a liquid staking derivative for DOT. The platform's EVM+ innovations extend beyond standard Ethereum compatibility by enabling direct interaction between EVM smart contracts and Substrate pallets, facilitating advanced cross-chain DeFi operations through [XCM](/develop/interoperability/intro-to-xcm/){target=\_blank}, and providing built-in oracle integrations. These enhancements make it possible for DeFi protocols to achieve functionality that would be prohibitively expensive or technically infeasible on traditional EVM chains.

#### Technical Architecture

```mermaid
graph TB
    subgraph "DApp Layer"
        eth["Ethereum DApps\n(Web3 + bodhi.js)"]
        substrate["Substrate DApps\n(Polkadot.js)"]
    end

    subgraph "Acala Network"
        rpc["RPC Layer\n(Web3 + Substrate)"]
        
        subgraph "Runtime Layer"
            runtime["Substrate Runtime"]
            
            subgraph "EVM+"
                storage["Storage Meter"]
                precompiles["Precompiled Contracts\n(DEX, Oracle, Schedule)"]
                evm["EVM Engine"]
            end
        end
    end

    subgraph "Base Layer"
        dot["Polkadot Relay Chain\n(Shared Security)"]
    end

    %% Connections
    eth --> rpc
    substrate --> rpc
    rpc --> runtime
    runtime --> evm
    runtime --> storage
    runtime --> precompiles
    runtime --> dot
```

The diagram illustrates Acala's unique EVM+ architecture, which extends beyond standard EVM compatibility. At the top, DApps can interact with the network using either Ethereum tools (via Web3 and bodhi.js) or Substrate tools. These requests flow through Acala's dual RPC layer into the main Runtime. The key differentiator is the EVM+ environment, which includes special features like the Storage Meter for rent management, and numerous precompiled contracts (like DEX, Oracle, Schedule) that provide native Substrate functionality to EVM contracts. All of this runs on top of Polkadot's shared security as a parachain.

## Getting Started with Hardhat

[Hardhat](https://hardhat.org){target=\_blank} is an Ethereum development environment that makes it easy to deploy smart contracts on EVM-compatible blockchain networks. This guide will show you how to compile, deploy, and interact with a simple smart contract on Astar, Moonbeam, and Acala. Feel free to pick your network of choice and follow along!

=== "Astar"

	You'll need to have [MetaMask installed](https://metamask.io/){target=_blank} and connected to the Shibuya Testnet and an account with Shibuya tokens. You can get them from [the Shibuya faucet](https://docs.astar.network/docs/build/environment/faucet/){target=_blank}.

	To get started, first create a Hardhat Project:

	1. Create and initialize your project:
	```bash
	mkdir hardhat && cd hardhat
	npm init -y
	npm install hardhat
	npx hardhat init
	```

	2. When prompted, choose **Create an empty hardhat.config.js**

	Configure Hardhat as follows:

	1. Install required plugins:
	```bash
	npm install @nomicfoundation/hardhat-ethers ethers
	npm install --save-dev @nomicfoundation/hardhat-ignition-ethers
	```

	2. Update your `hardhat.config.js`:
	```javascript
	require('@nomicfoundation/hardhat-ethers');
	require('@nomicfoundation/hardhat-ignition-ethers');

	const privateKey = 'INSERT_PRIVATE_KEY';

	module.exports = {
	  solidity: '0.8.20',
	  networks: {
	    shibuya: {
	      url: 'https://evm.shibuya.astar.network',
	      chainId: 81,
	      accounts: [privateKey]
	    }
	  }
	};
	```

	You can create the smart contract as follows:

	1. Create a contract directory and file:
	```bash
	mkdir contracts
	touch contracts/Box.sol
	```

	2. Add this simple storage contract:
	```solidity
	// contracts/Box.sol
	// SPDX-License-Identifier: MIT
	pragma solidity ^0.8.1;

	contract Box {
	    uint256 private value;
	    event ValueChanged(uint256 newValue);

	    function store(uint256 newValue) public {
	        value = newValue;
	        emit ValueChanged(newValue);
	    }

	    function retrieve() public view returns (uint256) {
	        return value;
	    }
	}
	```

	Now it's time to compile and deploy the contract. To do so, take the following steps:

	1. Compile the contract:
	```bash
	npx hardhat compile
	```

	2. Create the deployment module:
	```bash
	mkdir ignition ignition/modules && touch ignition/modules/Box.js
	```

	3. Add deployment code to `ignition/modules/Box.js`:
	```javascript
	const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

	module.exports = buildModule("BoxModule", (m) => {
	  const deployer = m.getAccount(0);
	  const box = m.contract("Box", [], {
	    from: deployer,
	  });
	  return { box };
	});
	```

	4. Deploy to Shibuya:
	```bash
	npx hardhat ignition deploy ./ignition/modules/Box.js --network shibuya
	```

	You can interact with your contract using the Hardhat console:

	1. Start the console:
	```bash
	npx hardhat console --network shibuya
	```

	2. Interact with your contract:
	```javascript
	const Box = await ethers.getContractFactory('Box');
	const box = await Box.attach('YOUR_CONTRACT_ADDRESS');
	await box.store(5);
	const value = await box.retrieve();
	console.log(value);
	```

	That's it! You've deployed and interacted with a smart contract on Astar's Shibuya testnet using Hardhat.

=== "Moonbeam"

	You'll need to have [MetaMask installed](https://metamask.io/){target=\_blank} and connected to [Moonbase Alpha](https://chainlist.org/chain/1287){target=\_blank} and an account with Moonbase Alpha tokens. You can get them from [the Moonbase Alpha faucet](https://faucet.moonbeam.network){target=_blank}.

	To get started, first create a Hardhat Project:

	1. Create and initialize your project:
	```bash
	mkdir hardhat && cd hardhat
	npm init -y
	npm install hardhat
	npx hardhat init
	```

	2. When prompted, choose **Create an empty hardhat.config.js**

	Configure Hardhat as follows:

	1. Install required plugins:
	```bash
	npm install @nomicfoundation/hardhat-ethers ethers
	npm install --save-dev @nomicfoundation/hardhat-ignition-ethers
	```

	2. Update your `hardhat.config.js`:
	```javascript
	require('@nomicfoundation/hardhat-ethers');
	require('@nomicfoundation/hardhat-ignition-ethers');

	const privateKey = 'INSERT_PRIVATE_KEY';

	module.exports = {
	  solidity: '0.8.20',
	  networks: {
	    moonbase: {
	      url: 'https://rpc.api.moonbase.moonbeam.network',
	      chainId: 1287,
	      accounts: [privateKey]
	    }
	  }
	};
	```

	You can create the smart contract as follows:

	1. Create a contract directory and file:
	```bash
	mkdir contracts
	touch contracts/Box.sol
	```

	2. Add this simple storage contract:
	```solidity
	// contracts/Box.sol
	// SPDX-License-Identifier: MIT
	pragma solidity ^0.8.1;

	contract Box {
	    uint256 private value;
	    event ValueChanged(uint256 newValue);

	    function store(uint256 newValue) public {
	        value = newValue;
	        emit ValueChanged(newValue);
	    }

	    function retrieve() public view returns (uint256) {
	        return value;
	    }
	}
	```

	Now it's time to compile and deploy the contract. To do so, take the following steps:

	1. Compile the contract:
	```bash
	npx hardhat compile
	```

	2. Create the deployment module:
	```bash
	mkdir ignition ignition/modules && touch ignition/modules/Box.js
	```

	3. Add deployment code to `ignition/modules/Box.js`:
	```javascript
	const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

	module.exports = buildModule("BoxModule", (m) => {
	  const deployer = m.getAccount(0);
	  const box = m.contract("Box", [], {
	    from: deployer,
	  });
	  return { box };
	});
	```

	4. Deploy to Moonbase Alpha:
	```bash
	npx hardhat ignition deploy ./ignition/modules/Box.js --network moonbase
	```

	You can interact with your contract using the Hardhat console:

	1. Start the console:
	```bash
	npx hardhat console --network moonbase
	```

	2. Interact with your contract:
	```javascript
	const Box = await ethers.getContractFactory('Box');
	const box = await Box.attach('YOUR_CONTRACT_ADDRESS');
	await box.store(5);
	const value = await box.retrieve();
	console.log(value);
	```

	That's it! You've deployed and interacted with a smart contract on Moonbase Alpha using Hardhat.



=== "Acala"

	You'll need to have [MetaMask installed](https://metamask.io/){target=\_blank} and connected to [Acala Testnet](https://chainlist.org/chain/595){target=\_blank} and an account with Acala testnet tokens. You can get them from [the Acala testnet faucet](https://discord.gg/5JJgXKSznc){target=\_blank}.

	To get started, first create a Hardhat Project:

	1. Create and initialize your project:
	```bash
	mkdir hardhat && cd hardhat
	npm init -y
	npm install hardhat
	npx hardhat init
	```

	2. When prompted, choose **Create an empty hardhat.config.js**

	Configure Hardhat as follows:

	1. Install required plugins:
	```bash
	npm install @nomicfoundation/hardhat-ethers ethers
	npm install --save-dev @nomicfoundation/hardhat-ignition-ethers
	```

	2. Update your `hardhat.config.js`:
	```javascript
	require('@nomicfoundation/hardhat-ethers');
	require('@nomicfoundation/hardhat-ignition-ethers');

	const privateKey = 'INSERT_PRIVATE_KEY';

	module.exports = {
	  solidity: '0.8.20',
	  networks: {
	    acala: {
	      url: 'https://eth-rpc-tc9.aca-staging.network',
	      chainId: 595,
	      accounts: [privateKey]
	    }
	  }
	};
	```

	You can create the smart contract as follows:

	1. Create a contract directory and file:
	```bash
	mkdir contracts
	touch contracts/Box.sol
	```

	2. Add this simple storage contract:
	```solidity
	// contracts/Box.sol
	// SPDX-License-Identifier: MIT
	pragma solidity ^0.8.1;

	contract Box {
	    uint256 private value;
	    event ValueChanged(uint256 newValue);

	    function store(uint256 newValue) public {
	        value = newValue;
	        emit ValueChanged(newValue);
	    }

	    function retrieve() public view returns (uint256) {
	        return value;
	    }
	}
	```

	Now it's time to compile and deploy the contract. To do so, take the following steps:

	1. Compile the contract:
	```bash
	npx hardhat compile
	```

	2. Create the deployment module:
	```bash
	mkdir ignition ignition/modules && touch ignition/modules/Box.js
	```

	3. Add deployment code to `ignition/modules/Box.js`:
	```javascript
	const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

	module.exports = buildModule("BoxModule", (m) => {
	  const deployer = m.getAccount(0);
	  const box = m.contract("Box", [], {
	    from: deployer,
	  });
	  return { box };
	});
	```

	4. Deploy to Acala testnet:
	```bash
	npx hardhat ignition deploy ./ignition/modules/Box.js --network acala
	```

	You can interact with your contract using the Hardhat console:

	1. Start the console:
	```bash
	npx hardhat console --network acala
	```

	2. Interact with your contract:
	```javascript
	const Box = await ethers.getContractFactory('Box');
	const box = await Box.attach('YOUR_CONTRACT_ADDRESS');
	await box.store(5);
	const value = await box.retrieve();
	console.log(value);
	```

	That's it! You've deployed and interacted with a smart contract on Acala testnet using Hardhat.

The beauty of EVM-compatible parachains is that they work seamlessly with existing Ethereum development tools like Hardhat. Since these parachains are EVM-compatible, the deployment process remains identical across chains - you simply need to update the RPC endpoint in your configuration and ensure your wallet has the appropriate testnet tokens. This demonstrates one of the key strengths of EVM-compatible Polkadot parachains: the ability to deploy EVM smart contracts across multiple chains with minimal changes.

!!! warning
	In the above Hardhat tutorials, the private keys are stored directly in the javascript file. This is for simplication/demonstration purposes and should never be done in production.

## Reading Contract State on EVM-Based Blockchains

Let's dive into another practical demonstration. The following script showcases how to interact with multiple Polkadot parachains using their EVM compatibility. We'll query:

- Moonbeam for its Wormhole USDC total supply
- Acala for its native ACA token supply using a precompile
- Astar for its USDC total supply

What makes this demo particularly powerful is that all three chains—Astar, Moonbeam, and Acala—share EVM compatibility. This means we can use a single, unified script to query token balances across all chains, simply by adjusting the RPC endpoints and token contract addresses. Thanks to EVM-compatibility, there's no need for chain-specific scripts or custom development work.

??? code "Expand to view the complete script"
    ```js
    --8<-- 'code/develop/smart-contracts/parachain-contracts/check-token-supply.js'
    ```

This script demonstrates one of the fundamental ways to interact with blockchain networks - querying on-chain state through smart contract calls. We're using the standardized ERC20 interface (which most tokens implement) to read the total supply of tokens across different EVM networks. This type of interaction is "read-only" or a "view" call, meaning we're just fetching data from the blockchain without making any transactions or state changes. Therefore, we aren't using any gas. Transactions that attempt to make a state change to the blockchain require gas.  The ability to query state like this is essential for DApps, analytics tools, and monitoring systems that need real-time blockchain data.

## Network Endpoints and Faucets

=== "Astar"
    | Variable | Value |
    |:--------:|:------|
    | Network Name | Shibuya Testnet |
    | EVM Chain ID | 81 |
    | Public RPC URLs | <pre>https://evm.shibuya.astar.network</pre> |
    | Public WSS URLs | <pre>wss://evm.shibuya.astar.network</pre> |
    | Block Explorer | [Shibuya Blockscout](https://blockscout.com/shibuya){target=\_blank} |
    | Faucet Link | [Faucet - Astar Docs](https://docs.astar.network/docs/build/environment/faucet/){target=\_blank} |

=== "Moonbeam"
    | Variable | Value |
    |:--------:|:------|
    | Network Name | Moonbase Alpha Testnet |
    | EVM Chain ID | [1287](https://chainlist.org/chain/1287){target=_blank} |
    | Public RPC URLs | <pre>https://rpc.api.moonbase.moonbeam.network</pre> |
    | Public WSS URLs | <pre>wss://wss.api.moonbase.moonbeam.network</pre> |
    | Block Explorer | [Moonbase Alpha Moonscan](https://moonbase.moonscan.io/){target=\_blank} |
    | Faucet Link | [Moonbase Faucet](https://faucet.moonbeam.network){target=\_blank} |

=== "Acala"
    | Variable | Value |
    |:--------:|:------|
    | Network Name | Mandala TC7 Testnet |
    | EVM Chain ID | [595](https://chainlist.org/chain/595){target=_blank} |
    | Public RPC URLs | <pre>https://eth-rpc-tc9.aca-staging.network</pre> |
    | Public WSS URLs | <pre>wss://tc7-eth.aca-dev.network</pre> |
    | Block Explorer | [Mandala Blockscout](https://blockscout.mandala.aca-staging.network){target=\_blank} |
    | Faucet Link | [Mandala Faucet](https://discord.gg/5JJgXKSznc){target=\_blank} |

## Ready to Start Building?

Check out the links below for each respective parachain for network endpoints, getting started guides, and more. 

=== "Astar"
    - [Astar Docs](https://docs.astar.network/){target=\_blank}
    - [Astar Network Endpoints](https://docs.astar.network/docs/build/environment/endpoints/){target=\_blank}
    - [Build EVM Smart Contracts on Astar](https://docs.astar.network/docs/build/EVM/){target=\_blank}

=== "Moonbeam"
    - [Moonbeam Docs](https://docs.moonbeam.network/){target=\_blank}
    - [Moonbeam Network Endpoints](https://docs.moonbeam.network/builders/get-started/endpoints/){target=\_blank}
    - [Get Started Building on Moonbeam](https://docs.moonbeam.network/builders/get-started/){target=\_blank}

=== "Acala"
    - [Acala Docs](https://evmdocs.acala.network/){target=\_blank}
    - [Acala Network Endpoints](https://wiki.acala.network/integrate/acala/endpoints){target=\_blank}
    - [About the Acala Network](https://wiki.acala.network/learn/acala-introduction){target=\_blank}

