---
title: Viem
description: TODO
---

# Viem

## Introduction

Viem is a lightweight TypeScript library for interacting with Ethereum Virtual Machine (EVM)-compatible blockchains. This guide demonstrates how to use Viem to interact with and deploy smart contracts to Asset Hub.

## Set Up the Project

First, create a new folder and initialize your project:

```bash
mkdir viem-project
cd viem-project
npm init -y
```

## Install Dependencies

Install Viem and other required dependencies:

```bash
# Install Viem and Revive
npm install viem @parity/revive

# Install TypeScript and development dependencies
npm install --save-dev typescript ts-node @types/node
```

## Init Project

Init TypeScript project

```bash
npx tsc --init
```

Update the `package.json` file to add scripts for running TypeScript files:

```json
{
  "scripts": {
    "compile": "tsc",
    "start": "ts-node",
    "build": "tsc -p tsconfig.json",
    "deploy": "ts-node src/deploy.ts",
    "interact": "ts-node src/interact.ts"
  }
}
```

Create a `src` directory for your TypeScript files:

```bash
mkdir src
```

## Set Up the Viem Client

Create `src/createClient.ts`:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const transport = http('https://westend-asset-hub-eth-rpc.polkadot.io')

// Configure the Asset Hub chain
const assetHub = {
  id: 420420421,
  name: 'Westend Asset Hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    decimals: 18,
    name: 'WND',
    symbol: 'WND',
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
} as const

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: assetHub,
  transport
})

// Create a wallet client for writing data
export const createWallet = (privateKey: `0x${string}`) => {
  const account = privateKeyToAccount(privateKey)
  return createWalletClient({
    account,
    chain: assetHub,
    transport
  })
}
```

## Compile Contracts

Create `src/compile.ts`:

```typescript
import { compile } from '@parity/revive'
import { readFileSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

const compileContract = async (solidityFilePath: string, outputDir: string) => {
  try {
    const source = readFileSync(solidityFilePath, 'utf8')
    const input = {
      [basename(solidityFilePath)]: { content: source }
    }

    console.log(`Compiling contract: ${basename(solidityFilePath)}...`)
    const output = await compile(input)

    for (const contracts of Object.values(output.contracts)) {
      for (const [name, contract] of Object.entries(contracts)) {
        console.log(`Compiled contract: ${name}`)

        // Save ABI
        const abiPath = join(outputDir, `${name}.json`)
        writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2))
        console.log(`ABI saved to ${abiPath}`)

        // Save bytecode
        const bytecodePath = join(outputDir, `${name}.polkavm`)
        writeFileSync(
          bytecodePath,
          Buffer.from(contract.evm.bytecode.object, 'hex')
        )
        console.log(`Bytecode saved to ${bytecodePath}`)
      }
    }
  } catch (error) {
    console.error('Error compiling contracts:', error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  compileContract('./contracts/Storage.sol', './artifacts')
}

export { compileContract }
```

To run the compilation:

```bash
# Create directories
mkdir contracts artifacts

# Copy your Storage.sol contract to contracts/
# Then run:
npm run start src/compile.ts
```

## Deploy the Compiled Contract

Create `src/deploy.ts`:

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseEther } from 'viem'
import { publicClient, createWallet } from './createClient'

const deployContract = async (
  contractName: string,
  privateKey: `0x${string}`
) => {
  try {
    console.log(`Deploying ${contractName}...`)

    // Read contract artifacts
    const abi = JSON.parse(
      readFileSync(join(__dirname, '../artifacts', `${contractName}.json`), 'utf8')
    )
    const bytecode = `0x${readFileSync(
      join(__dirname, '../artifacts', `${contractName}.polkavm`)
    ).toString('hex')}`

    // Create wallet
    const wallet = createWallet(privateKey)

    // Deploy contract
    const hash = await wallet.deployContract({
      abi,
      bytecode,
      args: [] // Add constructor arguments if needed
    })

    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    const contractAddress = receipt.contractAddress

    console.log(`Contract deployed at: ${contractAddress}`)
    return contractAddress
  } catch (error) {
    console.error('Deployment failed:', error)
    throw error
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required')
  }
  deployContract('Storage', PRIVATE_KEY)
}

export { deployContract }
```

To deploy:

```bash
# Set your private key and run
PRIVATE_KEY=0x... npm run deploy
```

## Interact with the Contract

Create `src/interact.ts`:

```typescript
import { parseAbi } from 'viem'
import { publicClient, createWallet } from './createClient'

const STORAGE_ABI = parseAbi([
  'function storedNumber() view returns (uint256)',
  'function setNumber(uint256 _newNumber)'
])

const interactWithStorage = async (
  contractAddress: `0x${string}`,
  privateKey: `0x${string}`
) => {
  try {
    const wallet = createWallet(privateKey)

    // Read the current number
    const currentNumber = await publicClient.readContract({
      address: contractAddress,
      abi: STORAGE_ABI,
      functionName: 'storedNumber'
    })
    console.log('Current stored number:', currentNumber)

    // Set a new number
    const newNumber = 42n
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: STORAGE_ABI,
      functionName: 'setNumber',
      args: [newNumber],
      account: wallet.account
    })

    const hash = await wallet.writeContract(request)
    await publicClient.waitForTransactionReceipt({ hash })
    console.log(`Number updated to ${newNumber}`)

    // Read the updated number
    const updatedNumber = await publicClient.readContract({
      address: contractAddress,
      abi: STORAGE_ABI,
      functionName: 'storedNumber'
    })
    console.log('Updated stored number:', updatedNumber)
  } catch (error) {
    console.error('Interaction failed:', error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`
  
  if (!CONTRACT_ADDRESS || !PRIVATE_KEY) {
    throw new Error('CONTRACT_ADDRESS and PRIVATE_KEY environment variables are required')
  }
  
  interactWithStorage(CONTRACT_ADDRESS, PRIVATE_KEY)
}

export { interactWithStorage }
```

To interact with the contract:

```bash
CONTRACT_ADDRESS=0x... PRIVATE_KEY=0x... npm run interact
```

## Project Structure

After setting up, your project structure should look like this:

```
viem-project/
├── src/
│   ├── createClient.ts
│   ├── compile.ts
│   ├── deploy.ts
│   └── interact.ts
├── contracts/
│   └── Storage.sol
├── artifacts/
│   ├── Storage.json
│   └── Storage.polkavm
├── package.json
└── tsconfig.json
```

## Error Handling and Gas Estimation

Create `src/safeInteract.ts`:

```typescript
import { BaseError } from 'viem'
import { publicClient, createWallet } from './createClient'
import { STORAGE_ABI } from './interact'

const safeContractInteraction = async (
  contractAddress: `0x${string}`,
  privateKey: `0x${string}`,
  newValue: bigint
) => {
  const wallet = createWallet(privateKey)

  try {
    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: STORAGE_ABI,
      functionName: 'setNumber',
      args: [newValue],
      account: wallet.account
    })

    // Estimate gas
    const gasEstimate = await publicClient.estimateContractGas({
      ...request,
      account: wallet.account
    })

    // Execute with gas estimate
    const hash = await wallet.writeContract({
      ...request,
      gas: gasEstimate
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return receipt
  } catch (error) {
    if (error instanceof BaseError) {
      console.error('Contract interaction failed:', error.shortMessage)
    }
    throw error
  }
}

export { safeContractInteraction }
```

## Where to Go Next

Now that you have the foundation for using Viem with Asset Hub, consider exploring:

- Advanced Viem features - such as multicall, batch transactions, and custom actions
- Test frameworks - integrate with tools like Hardhat or Foundry for comprehensive testing
- Event handling - subscribe to and process contract events
- Building dApps - combine Viem with frameworks like Next.js or React for full-stack applications

## Resources

- [Viem Documentation](https://viem.sh)
- [Asset Hub Documentation](https://contracts.polkadot.io)
- [Polkadot Developer Resources](https://wiki.polkadot.network/docs/build-index)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)