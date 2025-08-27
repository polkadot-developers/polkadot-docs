---
title: [Your Smart Contract Tutorial Title - Max 45 chars]
description: [Description of the smart contract functionality - 120-160 chars]
tutorial_badge: Beginner | Intermediate | Advanced
categories: Smart Contracts, EVM, ink!, DeFi
---

# [Your Smart Contract Tutorial Title]

## Introduction

[2-3 paragraphs explaining:]
- What smart contract users will build
- What functionality it provides
- What blockchain concepts they'll learn

## Prerequisites

Before starting, ensure you have:

- **For EVM contracts**: Remix IDE or local development setup
- **For ink! contracts**: ink! development environment
- MetaMask wallet configured for [specific network]
- Test tokens for deployment and testing
- Basic understanding of [Solidity/Rust/relevant language]

## Step 1: Development Environment Setup

[Set up the appropriate development environment]

### For EVM Contracts:
```bash
# Install required tools
npm install -g @openzeppelin/cli
npm install hardhat
```

### For ink! Contracts:
```bash
# Install ink! CLI
cargo install --force --locked cargo-contract --version 4.0.0-alpha
```

## Step 2: Contract Design and Structure

[Explain the contract architecture and key components]

```solidity
// For EVM contracts - example structure
pragma solidity ^0.8.19;

contract YourContract {
    // State variables
    mapping(address => uint256) public balances;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    // Functions
    function transfer(address to, uint256 amount) external {
        // Implementation
    }
}
```

```rust
// For ink! contracts - example structure
#[ink::contract]
mod your_contract {
    #[ink(storage)]
    pub struct YourContract {
        value: bool,
    }

    impl YourContract {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            Self { value: init_value }
        }

        #[ink(message)]
        pub fn flip(&mut self) {
            self.value = !self.value;
        }
    }
}
```

## Step 3: Contract Implementation

[Step-by-step implementation of core functionality]

### Core Functions
[Implement main contract functions with explanations]

### State Management
[Explain how contract state is managed]

### Security Considerations
!!!warning
    Important security considerations specific to this contract type.

## Step 4: Testing

Write comprehensive tests:

### For EVM Contracts:
```javascript
// Hardhat test example
describe("YourContract", function () {
  it("Should deploy and initialize correctly", async function () {
    // Test implementation
  });
});
```

### For ink! Contracts:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[ink::test]
    fn default_works() {
        // Test implementation
    }
}
```

Run tests:
```bash
# For EVM contracts
npx hardhat test

# For ink! contracts
cargo test
```

## Step 5: Deployment

Deploy your contract:

### For EVM Contracts:
```bash
# Deploy to testnet
npx hardhat run scripts/deploy.js --network [testnet-name]
```

### For ink! Contracts:
```bash
# Build contract
cargo contract build

# Deploy to testnet (using contracts UI or CLI)
```

## Step 6: Interaction and Verification

Test contract functionality:

1. **Connect to deployed contract**
2. **Test main functions**:
   - [Function 1 test]
   - [Function 2 test]
3. **Verify expected behavior**
4. **Check transaction history**

![Contract interaction screenshot](/images/tutorials/smart-contracts/[category]/[tutorial-name]/contract-interaction.webp)

## Advanced Features [Optional]

[For intermediate/advanced tutorials - additional features like:]
- Integration with oracles
- Advanced token mechanics
- Cross-contract calls
- Upgradeable patterns

## Troubleshooting

Common deployment and interaction issues:

- **Issue**: Gas estimation failed
  - **Solution**: Check contract logic and increase gas limit

- **Issue**: Transaction reverts
  - **Solution**: Verify function parameters and contract state

## Where to Go Next

Extend your smart contract skills:
- [Related smart contract tutorial]
- [Integration with frontend tutorial]
- [Advanced DeFi patterns tutorial]

## Additional Resources

- [Remix IDE](https://remix.ethereum.org/)
- [ink! Documentation](https://use.ink/)
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/)