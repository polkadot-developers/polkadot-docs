---
title: Deploying Uniswap V2
description: Learn how to write a basic smart contract using just a text editor. This guide covers creating and preparing a contract for deployment on Asset Hub.
---

# Deploying Uniswap V2

## Introduction

Decentralized exchanges (DEXs) are a cornerstone of the DeFi ecosystem, allowing for permissionless token swaps without intermediaries. Uniswap v2, with its Automated Market Maker (AMM) model, revolutionized DEXs by enabling liquidity provision for any ERC-20 token pair. This tutorial will guide you through deploying Uniswap v2 contracts to the Polkadot Asset Hub. By deploying these contracts, you'll gain hands-on experience with one of the most influential DeFi protocols and understand how it functions across blockchain ecosystems.

## Prerequisites

Before starting, make sure you have:

- Node.js (v16.0.0 or later) and npm installed
- Basic understanding of Solidity and JavaScript
- Familiarity with Hardhat development environment
- Some WND test tokens to cover transaction fees (obtained from the Polkadot faucet)
- Basic understanding of how AMMs and liquidity pools work

## Setting Up the Project

Let's start by creating a new project for deploying Uniswap v2:

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir uniswap-v2-polkadot
    cd uniswap-v2-polkadot
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install Hardhat and the required plugins:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```
<!-- 
4. Install the Hardhat Polkadot-specific plugins:

    ```bash
    npm install --save-dev hardhat-resolc@{'name': '@hardhat-resolc', 'version': '0.0.7'} hardhat-revive-node@{'name': '@hardhat-revive-node', 'version': '0.0.6'} dotenv
    ``` -->

5. Initialize a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create an empty hardhat.config.js" when prompted.

6. Configure Hardhat by updating the hardhat.config.js file:

<!-- 
```javascript
TODO: add hardhat.config.js....
```

Note: The Uniswap v2 contracts use multiple Solidity versions, which is why we've specified multiple compiler versions. -->

1. Create a `.env` file in your project root to store your private key:

    ```text title=".env"
    PRIVATE_KEY="INSERT_PRIVATE_KEY"
    ```

    Ensure to replace "INSERT_PRIVATE_KEY" with your actual private key.

    !!!warning
        Keep your private key safe, and never share it with anyone. If it is compromised, your funds can be stolen.

## Understanding Uniswap v2 Architecture

Before we start deploying contracts, let's understand the key components of Uniswap v2:

- **Factory Contract** - creates and manages pair contracts for token swaps
- **Router Contract** - handles user interactions like swapping tokens and adding/removing liquidity
- **Pair Contracts** - automatically created by the Factory for each token pair, managing the liquidity pool
- **WETH Contract** - wrapped ETH, allowing ETH to be treated as an ERC20 token in the ecosystem

## Project Scafolding

```bash
uniswap-v2-polkadot
├── contracts
│   ├── core
│   │   ├── UniswapV2ERC20.sol
│   │   ├── UniswapV2Factory.sol
│   │   ├── UniswapV2Pair.sol
│   │   ├── interfaces
│   │   │   ├── IERC20.sol
│   │   │   ├── IUniswapV2Callee.sol
│   │   │   ├── IUniswapV2ERC20.sol
│   │   │   ├── IUniswapV2Factory.sol
│   │   │   └── IUniswapV2Pair.sol
│   │   ├── libraries
│   │   │   ├── Math.sol
│   │   │   └── UQ112x112.sol
│   │   └── test
│   │       └── ERC20.sol
│   └── periphery
│       ├── UniswapV2Router02.sol
│       ├── WETH.sol
│       ├── interfaces
│       │   ├── IERC20.sol
│       │   ├── IUniswapV2Router01.sol
│       │   ├── IUniswapV2Router02.sol
│       │   └── IWETH.sol
│       └── libraries
│           └── UniswapV2Library.sol
├── test
│   └── UniswapV2ERC20.test.js
├── hardhat.config.js
├── package-lock.json
├── package.json
└─── pnpm-lock.yaml
```

## Creating Uniswap V2 Contracts

1. Create the necessary contract directories:

    ```bash
    mkdir -p contracts/core
    mkdir -p contracts/periphery
    ```

### Uniswap V2 Core

1.  Navigate to the `core` folder

    ```bash
    cd contracts/core
    ```

2. Create three folders: `interfaces`, `libraries`, and `test`

    ```bash
    mkdir -p interfaces
    mkdir -p libraries
    mkdir -p test
    ```

3. Create the following files under the `interfaces` folder, and add this content:

    ???- "code `interfaces/IERC20.sol`"
        ```solidity title="IERC20.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IERC20 {
            event Approval(address indexed owner, address indexed spender, uint256 value);
            event Transfer(address indexed from, address indexed to, uint256 value);

            function name() external view returns (string memory);
            function symbol() external view returns (string memory);
            function decimals() external view returns (uint8);
            function totalSupply() external view returns (uint256);
            function balanceOf(address owner) external view returns (uint256);
            function allowance(address owner, address spender) external view returns (uint256);

            function approve(address spender, uint256 value) external returns (bool);
            function transfer(address to, uint256 value) external returns (bool);
            function transferFrom(address from, address to, uint256 value) external returns (bool);
        }
        ```


    ???- "code `interfaces/IUniswapV2Callee.sol`"
        ```solidity title="IUniswapV2Callee.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IUniswapV2Callee {
            function uniswapV2Call(address sender, uint256 amount0, uint256 amount1, bytes calldata data) external;
        }
        ```


    ???- "code `interfaces/IUniswapV2ERC20.sol`"
        ```solidity title="IUniswapV2ERC20.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IUniswapV2ERC20 {
            event Approval(address indexed owner, address indexed spender, uint256 value);
            event Transfer(address indexed from, address indexed to, uint256 value);

            function name() external pure returns (string memory);
            function symbol() external pure returns (string memory);
            function decimals() external pure returns (uint8);
            function totalSupply() external view returns (uint256);
            function balanceOf(address owner) external view returns (uint256);
            function allowance(address owner, address spender) external view returns (uint256);

            function approve(address spender, uint256 value) external returns (bool);
            function transfer(address to, uint256 value) external returns (bool);
            function transferFrom(address from, address to, uint256 value) external returns (bool);

            function DOMAIN_SEPARATOR() external view returns (bytes32);
            function PERMIT_TYPEHASH() external pure returns (bytes32);
            function nonces(address owner) external view returns (uint256);

            function permit(
                address owner,
                address spender,
                uint256 value,
                uint256 deadline,
                uint8 v,
                bytes32 r,
                bytes32 s
            ) external;
        }
        ```

    ???- "code `interfaces/IUniswapV2Factory.sol`"
        ```solidity title="IUniswapV2Factory.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IUniswapV2Factory {
            event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

            function feeTo() external view returns (address);
            function feeToSetter() external view returns (address);

            function getPair(address tokenA, address tokenB) external view returns (address pair);
            function allPairs(uint256) external view returns (address pair);
            function allPairsLength() external view returns (uint256);

            function createPair(address tokenA, address tokenB) external returns (address pair);

            function setFeeTo(address) external;
            function setFeeToSetter(address) external;
        }
        ```

    ???- "code `interfaces/IUniswapV2Pair.sol`"
        ```solidity title="IUniswapV2Pair.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import './IUniswapV2ERC20.sol';

        interface IUniswapV2Pair is IUniswapV2ERC20 {
            event Mint(address indexed sender, uint256 amount0, uint256 amount1);
            event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
            event Swap(
                address indexed sender,
                uint256 amount0In,
                uint256 amount1In,
                uint256 amount0Out,
                uint256 amount1Out,
                address indexed to
            );
            event Sync(uint reserve0, uint112 reserve1);

            function MINIMUM_LIQUIDITY() external pure returns (uint256);
            function factory() external view returns (address);
            function token0() external view returns (address);
            function token1() external view returns (address);
            function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
            function price0CumulativeLast() external view returns (uint256);
            function price1CumulativeLast() external view returns (uint256);
            function kLast() external view returns (uint256);

            function mint(address to) external returns (uint256 liquidity);
            function burn(address to) external returns (uint256 amount0, uint256 amount1);
            function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
            function skim(address to) external;
            function sync() external;

            function initialize(address, address) external;
        }
        ```

3. Create the following files under the `libraries` folder, and add this content:

    ???- "code `libraries/Math.sol`"
        ```solidity title="Math.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        /// @title Math Library - provides utility functions like min and sqrt
        library Math {
            function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
                z = x < y ? x : y;
            }

            // Babylonian method for computing square roots
            function sqrt(uint256 y) internal pure returns (uint256 z) {
                if (y > 3) {
                    z = y;
                    uint256 x = y / 2 + 1;
                    while (x < z) {
                        z = x;
                        x = (y / x + x) / 2;
                    }
                } else if (y != 0) {
                    z = 1;
                }
            }
        }
        ```

    ???- "code `libraries/UQ112x112.sol`"
        ```solidity title="UQ112x112.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        /// @title UQ112x112 - Fixed point math library for binary fractional numbers (Q format)
        /// @dev Range: [0, 2**112 - 1], Resolution: 1 / 2**112
        library UQ112x112 {
            uint224 constant Q112 = 2**112;

            /// @notice Encodes a uint112 as a UQ112x112
            /// @param y The uint112 value to encode
            /// @return z The encoded uint224 value
            function encode(uint112 y) internal pure returns (uint224 z) {
                z = uint224(y) * Q112; // Never overflows
            }

            /// @notice Divides a UQ112x112 by a uint112, returning a UQ112x112
            /// @param x The UQ112x112 numerator
            /// @param y The uint112 denominator
            /// @return z The resulting UQ112x112
            function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
                require(y != 0, "UQ112x112: division by zero");
                z = x / uint224(y);
            }
        }
        ```

4. Create the following files under the `test` folder, and add this content:

    ???- "code `test/ERC20.sol`"
        ```solidity title="ERC20.sol"
        //SPDX-License-Identifier: MIT
        pragma solidity ^0.8.19;
        import "../UniswapV2ERC20.sol";

        contract ERC20 is UniswapV2ERC20 {
            constructor(uint256 _totalSupply) public {
                _mint(msg.sender, _totalSupply);
            }
        }
        ```

4. Create the following files under the root of the `core` folder, and add this content:

    ???- "code `core/UniswapV2ERC20.sol`"
        ```solidity title="UniswapV2ERC20.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import './interfaces/IUniswapV2ERC20.sol';

        contract UniswapV2ERC20 is IUniswapV2ERC20 {
            string public constant name = 'Uniswap V2';
            string public constant symbol = 'UNI-V2';
            uint8 public constant decimals = 18;
            uint256 public totalSupply;

            mapping(address => uint256) public balanceOf;
            mapping(address => mapping(address => uint256)) public allowance;

            bytes32 public DOMAIN_SEPARATOR;
            bytes32 public constant PERMIT_TYPEHASH =
                0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
            mapping(address => uint256) public nonces;

            constructor() {
                uint256 chainId;
                assembly {
                    chainId := chainid()
                }

                DOMAIN_SEPARATOR = keccak256(
                    abi.encode(
                        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                        keccak256(bytes(name)),
                        keccak256(bytes("1")),
                        chainId,
                        address(this)
                    )
                );
            }

            function _mint(address to, uint256 value) internal {
                totalSupply += value;
                balanceOf[to] += value;
                emit Transfer(address(0), to, value);
            }

            function _burn(address from, uint256 value) internal {
                balanceOf[from] -= value;
                totalSupply -= value;
                emit Transfer(from, address(0), value);
            }

            function _approve(address owner, address spender, uint256 value) private {
                allowance[owner][spender] = value;
                emit Approval(owner, spender, value);
            }

            function _transfer(address from, address to, uint256 value) private {
                balanceOf[from] -= value;
                balanceOf[to] += value;
                emit Transfer(from, to, value);
            }

            function approve(address spender, uint256 value) external returns (bool) {
                _approve(msg.sender, spender, value);
                return true;
            }

            function transfer(address to, uint256 value) external returns (bool) {
                _transfer(msg.sender, to, value);
                return true;
            }

            function transferFrom(address from, address to, uint256 value) external returns (bool) {
                uint256 currentAllowance = allowance[from][msg.sender];
                if (currentAllowance != type(uint256).max) {
                    allowance[from][msg.sender] = currentAllowance - value;
                }
                _transfer(from, to, value);
                return true;
            }

            function permit(
                address owner,
                address spender,
                uint256 value,
                uint256 deadline,
                uint8 v,
                bytes32 r,
                bytes32 s
            ) external {
                require(deadline >= block.timestamp, "UniswapV2: EXPIRED");

                bytes32 digest = keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR,
                        keccak256(
                            abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline)
                        )
                    )
                );

                address recoveredAddress = ecrecover(digest, v, r, s);
                require(recoveredAddress != address(0) && recoveredAddress == owner, "UniswapV2: INVALID_SIGNATURE");

                _approve(owner, spender, value);
            }
        }
        ```


    ???- "code `core/UniswapV2Factory.sol`"
        ```solidity title="UniswapV2Factory.sol"
        //SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import './interfaces/IUniswapV2Factory.sol';
        import './UniswapV2Pair.sol';

        contract UniswapV2Factory is IUniswapV2Factory {
            address public feeTo;
            address public feeToSetter;

            mapping(address => mapping(address => address)) public getPair;
            address[] public allPairs;

            constructor(address _feeToSetter) {
                feeToSetter = _feeToSetter;
            }

            function allPairsLength() external view returns (uint) {
                return allPairs.length;
            }

            function createPair(address tokenA, address tokenB) external returns (address pair) {
                require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
                (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
                require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
                require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient

                bytes memory bytecode = type(UniswapV2Pair).creationCode;
                bytes32 salt = keccak256(abi.encodePacked(token0, token1));

                assembly {
                    pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
                    if iszero(pair) {
                        revert(0, 0)
                    }
                }

                IUniswapV2Pair(pair).initialize(token0, token1);
                getPair[token0][token1] = pair;
                getPair[token1][token0] = pair; // populate mapping in reverse direction
                allPairs.push(pair);
                emit PairCreated(token0, token1, pair, allPairs.length);
            }

            function setFeeTo(address _feeTo) external {
                require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
                feeTo = _feeTo;
            }

            function setFeeToSetter(address _feeToSetter) external {
                require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
                feeToSetter = _feeToSetter;
            }
        }
        ```

    ???- "code `core/UniswapV2Pair.sol`"
        ```solidity title="UniswapV2Pair.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import './interfaces/IUniswapV2Pair.sol';
        import './UniswapV2ERC20.sol';
        import './libraries/Math.sol';
        import './libraries/UQ112x112.sol';
        import './interfaces/IERC20.sol';
        import './interfaces/IUniswapV2Factory.sol';
        import './interfaces/IUniswapV2Callee.sol';

        contract UniswapV2Pair is UniswapV2ERC20, IUniswapV2Pair {
            using UQ112x112 for uint224;

            uint public constant MINIMUM_LIQUIDITY = 10**3;
            bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

            address public factory;
            address public token0;
            address public token1;

            uint112 private reserve0;           // uses single storage slot, accessible via getReserves
            uint112 private reserve1;           // uses single storage slot, accessible via getReserves
            uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

            uint public price0CumulativeLast;
            uint public price1CumulativeLast;
            uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

            uint private unlocked = 1;
            modifier lock() {
                require(unlocked == 1, 'UniswapV2: LOCKED');
                unlocked = 0;
                _;
                unlocked = 1;
            }

            function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
                _reserve0 = reserve0;
                _reserve1 = reserve1;
                _blockTimestampLast = blockTimestampLast;
            }

            function _safeTransfer(address token, address to, uint value) private {
                (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
                require(success && (data.length == 0 || abi.decode(data, (bool))), 'UniswapV2: TRANSFER_FAILED');
            }

            constructor() {
                factory = msg.sender;
            }

            // called once by the factory at time of deployment
            function initialize(address _token0, address _token1) external {
                require(msg.sender == factory, 'UniswapV2: FORBIDDEN'); // sufficient check
                token0 = _token0;
                token1 = _token1;
            }

            // update reserves and, on the first call per block, price accumulators
            function _update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1) private {
                require(balance0 <= type(uint112).max  && balance1 <= type(uint112).max, 'UniswapV2: OVERFLOW');
                uint32 blockTimestamp = uint32(block.timestamp % 2**32);
                uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
                if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
                    // * never overflows, and + overflow is desired
                    price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
                    price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
                }
                reserve0 = uint112(balance0);
                reserve1 = uint112(balance1);
                blockTimestampLast = blockTimestamp;
                emit Sync(reserve0, reserve1);
            }

            // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
            function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
                address feeTo = IUniswapV2Factory(factory).feeTo();
                feeOn = feeTo != address(0);
                uint _kLast = kLast; // gas savings
                if (feeOn) {
                    if (_kLast != 0) {
                        uint rootK = Math.sqrt(uint(_reserve0) * _reserve1);

                        uint rootKLast = Math.sqrt(_kLast);
                        if (rootK > rootKLast) {
                            uint numerator = totalSupply * (rootK - rootKLast);
                            uint denominator = (rootK * 5) + rootKLast;
                            uint liquidity = numerator / denominator;
                            if (liquidity > 0) _mint(feeTo, liquidity);
                        }
                    }
                } else if (_kLast != 0) {
                    kLast = 0;
                }
            }

            // this low-level function should be called from a contract which performs important safety checks
            function mint(address to) external lock returns (uint liquidity) {
                (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
                uint balance0 = IERC20(token0).balanceOf(address(this));
                uint balance1 = IERC20(token1).balanceOf(address(this));
                uint amount0 = balance0 - _reserve0;
                uint amount1 = balance1 - _reserve1;

                bool feeOn = _mintFee(_reserve0, _reserve1);
                uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
                if (_totalSupply == 0) {
                    liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
                _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
                } else {
                    liquidity = Math.min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
                }
                require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');
                _mint(to, liquidity);

                _update(balance0, balance1, _reserve0, _reserve1);
                if (feeOn) kLast = uint(reserve0) * reserve1; // reserve0 and reserve1 are up-to-date
                emit Mint(msg.sender, amount0, amount1);
            }

            // this low-level function should be called from a contract which performs important safety checks
            function burn(address to) external lock returns (uint amount0, uint amount1) {
                (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
                address _token0 = token0;                                // gas savings
                address _token1 = token1;                                // gas savings
                uint balance0 = IERC20(_token0).balanceOf(address(this));
                uint balance1 = IERC20(_token1).balanceOf(address(this));
                uint liquidity = balanceOf[address(this)];

                bool feeOn = _mintFee(_reserve0, _reserve1);
                uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
                amount0 = liquidity * balance0 / _totalSupply; // using balances ensures pro-rata distribution
                amount1 = liquidity * balance1 / _totalSupply; // using balances ensures pro-rata distribution
                require(amount0 > 0 && amount1 > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED');
                _burn(address(this), liquidity);
                _safeTransfer(_token0, to, amount0);
                _safeTransfer(_token1, to, amount1);
                balance0 = IERC20(_token0).balanceOf(address(this));
                balance1 = IERC20(_token1).balanceOf(address(this));

                _update(balance0, balance1, _reserve0, _reserve1);
                if (feeOn) kLast = uint(reserve0) * reserve1; // reserve0 and reserve1 are up-to-date
                emit Burn(msg.sender, amount0, amount1, to);
            }

            // this low-level function should be called from a contract which performs important safety checks
            function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock {
                require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
                (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
                require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');

                uint balance0;
                uint balance1;
                { // scope for _token{0,1}, avoids stack too deep errors
                address _token0 = token0;
                address _token1 = token1;
                require(to != _token0 && to != _token1, 'UniswapV2: INVALID_TO');
                if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
                if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
                if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
                balance0 = IERC20(_token0).balanceOf(address(this));
                balance1 = IERC20(_token1).balanceOf(address(this));
                }
                uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
                uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
                require(amount0In > 0 || amount1In > 0, 'UniswapV2: INSUFFICIENT_INPUT_AMOUNT');
                { // scope for reserve{0,1}Adjusted, avoids stack too deep errors
                uint balance0Adjusted = balance0 * 1000 - amount0In * 3;
                uint balance1Adjusted = balance1 * 1000 - amount1In * 3;
                require(balance0Adjusted * balance1Adjusted >= uint(_reserve0) * _reserve1 * 1000**2, 'UniswapV2: K');
                }

                _update(balance0, balance1, _reserve0, _reserve1);
                emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
            }

            // force balances to match reserves
            function skim(address to) external lock {
                address _token0 = token0; // gas savings
                address _token1 = token1; // gas savings
                _safeTransfer(_token0, to, IERC20(_token0).balanceOf(address(this)) - reserve0);
                _safeTransfer(_token1, to, IERC20(_token1).balanceOf(address(this)) - reserve1);
            }

            // force reserves to match balances
            function sync() external lock {
                _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
            }
        }
        ```

### Uniswap V2 Periphery

1.  Navigate to the `periphery` folder

    ```bash
    cd contracts/periphery
    ```

2. Create three folders: `interfaces` and `libraries`

    ```bash
    mkdir -p interfaces
    mkdir -p libraries
    ```

3. Create the following files under the `interfaces` folder, and add this content:

    ???- "code `interfaces/IUniswapV2Router01.sol`"
        ```solidity title="IUniswapV2Router01.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IUniswapV2Router01 {
            function factory() external view returns (address);
            function WETH() external view returns (address);

            function addLiquidity(
                address tokenA,
                address tokenB,
                uint256 amountADesired,
                uint256 amountBDesired,
                uint256 amountAMin,
                uint256 amountBMin,
                address to,
                uint256 deadline
            ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

            function addLiquidityETH(
                address token,
                uint256 amountTokenDesired,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline
            ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);

            function removeLiquidity(
                address tokenA,
                address tokenB,
                uint256 liquidity,
                uint256 amountAMin,
                uint256 amountBMin,
                address to,
                uint256 deadline
            ) external returns (uint256 amountA, uint256 amountB);

            function removeLiquidityETH(
                address token,
                uint256 liquidity,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline
            ) external returns (uint256 amountToken, uint256 amountETH);

            function removeLiquidityWithPermit(
                address tokenA,
                address tokenB,
                uint256 liquidity,
                uint256 amountAMin,
                uint256 amountBMin,
                address to,
                uint256 deadline,
                bool approveMax, uint8 v, bytes32 r, bytes32 s
            ) external returns (uint256 amountA, uint256 amountB);

            function removeLiquidityETHWithPermit(
                address token,
                uint256 liquidity,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline,
                bool approveMax, uint8 v, bytes32 r, bytes32 s
            ) external returns (uint256 amountToken, uint256 amountETH);

            function swapExactTokensForTokens(
                uint256 amountIn,
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external returns (uint256[] memory amounts);

            function swapTokensForExactTokens(
                uint256 amountOut,
                uint256 amountInMax,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external returns (uint256[] memory amounts);

            function swapExactETHForTokens(
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external payable returns (uint256[] memory amounts);

            function swapTokensForExactETH(
                uint256 amountOut,
                uint256 amountInMax,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external returns (uint256[] memory amounts);

            function swapExactTokensForETH(
                uint256 amountIn,
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external returns (uint256[] memory amounts);

            function swapETHForExactTokens(
                uint256 amountOut,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external payable returns (uint256[] memory amounts);

            function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256 amountB);
            function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut);
            function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountIn);
            function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);
            function getAmountsIn(uint256 amountOut, address[] calldata path) external view returns (uint256[] memory amounts);
        }
        ```


    ???- "code `interfaces/IUniswapV2Router02.sol`"
        ```solidity title="IUniswapV2Router02.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import "./IUniswapV2Router01.sol";

        interface IUniswapV2Router02 is IUniswapV2Router01 {
            function removeLiquidityETHSupportingFeeOnTransferTokens(
                address token,
                uint256 liquidity,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline
            ) external returns (uint256 amountETH);

            function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
                address token,
                uint256 liquidity,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline,
                bool approveMax,
                uint8 v,
                bytes32 r,
                bytes32 s
            ) external returns (uint256 amountETH);

            function swapExactTokensForTokensSupportingFeeOnTransferTokens(
                uint256 amountIn,
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external;

            function swapExactETHForTokensSupportingFeeOnTransferTokens(
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external payable;

            function swapExactTokensForETHSupportingFeeOnTransferTokens(
                uint256 amountIn,
                uint256 amountOutMin,
                address[] calldata path,
                address to,
                uint256 deadline
            ) external;
        }
        ```

    ???- "code `test/IWETH.sol`"
        ```solidity title="IWETH.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        interface IWETH {
            function deposit() external payable;
            function transfer(address to, uint256 value) external returns (bool);
            function withdraw(uint256) external;
        }
        ```

4. Create the following files under the `libraries` folder, and add this content:

    ???- "code `libraries/UniswapV2Library.sol`"
        ```solidity title="UniswapV2Library.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import 'contracts/core/interfaces/IUniswapV2Pair.sol';

        library UniswapV2Library {
            // returns sorted token addresses, used to handle return values from pairs sorted in this order
            function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
                require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
                (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
                require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
            }

            // calculates the CREATE2 address for a pair without making any external calls
            function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
                (address token0, address token1) = sortTokens(tokenA, tokenB);
                pair = address(uint160(uint(keccak256(abi.encodePacked(
                    hex'ff',
                    factory,
                    keccak256(abi.encodePacked(token0, token1)),
                    hex'01429e880a7972ebfbba904a5bbe32a816e78273e4b38ffa6bdeaebce8adba7c' // init code hash
                )))));
            }

            // fetches and sorts the reserves for a pair
            function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
                (address token0,) = sortTokens(tokenA, tokenB);
                (uint reserve0, uint reserve1,) = IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
                (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
            }

            // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
            function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
                require(amountA > 0, 'UniswapV2Library: INSUFFICIENT_AMOUNT');
                require(reserveA > 0 && reserveB > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
                amountB = (amountA * reserveB) / reserveA;
            }

            // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
            function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
                require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
                require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
                uint amountInWithFee = amountIn * 997;
                uint numerator = amountInWithFee * reserveOut;
                uint denominator = (reserveIn * 1000) + amountInWithFee;
                amountOut = numerator / denominator;
            }

            // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
            function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn) {
                require(amountOut > 0, 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT');
                require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
                uint numerator = reserveIn * amountOut * 1000;
                uint denominator = (reserveOut - amountOut) * 997;
                amountIn = (numerator / denominator) + 1;
            }

            // performs chained getAmountOut calculations on any number of pairs
            function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
                require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
                amounts = new uint[](path.length);
                amounts[0] = amountIn;
                for (uint i = 0; i < path.length - 1; i++) {
                    (uint reserveIn, uint reserveOut) = getReserves(factory, path[i], path[i + 1]);
                    amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
                }
            }

            // performs chained getAmountIn calculations on any number of pairs
            function getAmountsIn(address factory, uint amountOut, address[] memory path) internal view returns (uint[] memory amounts) {
                require(path.length >= 2, 'UniswapV2Library: INVALID_PATH');
                amounts = new uint[](path.length);
                amounts[amounts.length - 1] = amountOut;
                for (uint i = path.length - 1; i > 0; i--) {
                    (uint reserveIn, uint reserveOut) = getReserves(factory, path[i - 1], path[i]);
                    amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
                }
            }
        }
        ```

5. Create the following files under the root of the `periphery` folder, and add this content:

    ???- "code `periphery/UniswapV2Router02.sol`"
        ```solidity title="UniswapV2Router02.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        import 'contracts/core/interfaces/IUniswapV2Factory.sol';
        import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

        import './interfaces/IUniswapV2Router02.sol';
        import './libraries/UniswapV2Library.sol';
        import './interfaces/IERC20.sol';
        import './interfaces/IWETH.sol';

        abstract contract UniswapV2Router02 is IUniswapV2Router02 {
            address public immutable override factory;
            address public immutable override WETH;

            modifier ensure(uint deadline) {
                require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
                _;
            }

            constructor(address _factory, address _WETH) {
                factory = _factory;
                WETH = _WETH;
            }

            receive() external payable {
                require(msg.sender == WETH, 'UniswapV2Router: NOT_WETH'); // only accept ETH via fallback from the WETH contract
            }

            // **** ADD LIQUIDITY ****
            function _addLiquidity(
                address tokenA,
                address tokenB,
                uint256 amountADesired,
                uint256 amountBDesired,
                uint256 amountAMin,
                uint256 amountBMin
            ) internal virtual returns (uint256 amountA, uint256 amountB) {
                // create the pair if it doesn't exist yet
                if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
                    IUniswapV2Factory(factory).createPair(tokenA, tokenB);
                }
                (uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
                if (reserveA == 0 && reserveB == 0) {
                    (amountA, amountB) = (amountADesired, amountBDesired);
                } else {
                    uint256 amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
                    if (amountBOptimal <= amountBDesired) {
                        require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
                        (amountA, amountB) = (amountADesired, amountBOptimal);
                    } else {
                        uint256 amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
                        require(amountAOptimal <= amountADesired, 'UniswapV2Router: EXCESSIVE_A_AMOUNT');
                        require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
                        (amountA, amountB) = (amountAOptimal, amountBDesired);
                    }
                }
            }

            function addLiquidity(
                address tokenA,
                address tokenB,
                uint256 amountADesired,
                uint256 amountBDesired,
                uint256 amountAMin,
                uint256 amountBMin,
                address to,
                uint256 deadline
            ) external virtual override ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
                (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
                address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
                TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
                TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
                liquidity = IUniswapV2Pair(pair).mint(to);
            }

            function addLiquidityETH(
                address token,
                uint256 amountTokenDesired,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline
            ) external virtual override payable ensure(deadline) returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
                (amountToken, amountETH) = _addLiquidity(
                    token,
                    WETH,
                    amountTokenDesired,
                    msg.value,
                    amountTokenMin,
                    amountETHMin
                );
                address pair = UniswapV2Library.pairFor(factory, token, WETH);
                TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
                IWETH(WETH).deposit{value: amountETH}();
                assert(IWETH(WETH).transfer(pair, amountETH));
                liquidity = IUniswapV2Pair(pair).mint(to);
                // refund dust eth, if any
                if (msg.value > amountETH) TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
            }

            // **** REMOVE LIQUIDITY ****
            function removeLiquidity(
                address tokenA,
                address tokenB,
                uint256 liquidity,
                uint256 amountAMin,
                uint256 amountBMin,
                address to,
                uint256 deadline
            ) public virtual override ensure(deadline) returns (uint256 amountA, uint256 amountB) {
                address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
                IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
                (uint256 amount0, uint256 amount1) = IUniswapV2Pair(pair).burn(to);
                (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);
                (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
                require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
                require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
            }

            function removeLiquidityETH(
                address token,
                uint256 liquidity,
                uint256 amountTokenMin,
                uint256 amountETHMin,
                address to,
                uint256 deadline
            ) public virtual override ensure(deadline) returns (uint256 amountToken, uint256 amountETH) {
                (amountToken, amountETH) = removeLiquidity(
                    token,
                    WETH,
                    liquidity,
                    amountTokenMin,
                    amountETHMin,
                    address(this),
                    deadline
                );
                TransferHelper.safeTransfer(token, to, amountToken);
                IWETH(WETH).withdraw(amountETH);
                TransferHelper.safeTransferETH(to, amountETH);
            }

            // More functions go here...
        }
        ```

    ???- "code `periphery/WETH.sol`"
        ```solidity title="WETH.sol"
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.28;

        contract WETH {
            string public name = "Wrapped Polkadot Native Token";
            string public symbol = "WPND";
            uint8 public decimals = 18;

            event Approval(address indexed src, address indexed guy, uint256 wad);
            event Transfer(address indexed src, address indexed dst, uint256 wad);
            event Deposit(address indexed dst, uint256 wad);
            event Withdrawal(address indexed src, uint256 wad);

            mapping(address => uint256) public balanceOf;
            mapping(address => mapping(address => uint256)) public allowance;

            receive() external payable {
                deposit();
            }

            function deposit() public payable {
                balanceOf[msg.sender] += msg.value;
                emit Deposit(msg.sender, msg.value);
            }

            function withdraw(uint256 wad) public {
                require(balanceOf[msg.sender] >= wad);
                balanceOf[msg.sender] -= wad;
                payable(msg.sender).transfer(wad);
                emit Withdrawal(msg.sender, wad);
            }

            function totalSupply() public view returns (uint256) {
                return address(this).balance;
            }

            function approve(address guy, uint256 wad) public returns (bool) {
                allowance[msg.sender][guy] = wad;
                emit Approval(msg.sender, guy, wad);
                return true;
            }

            function transfer(address dst, uint256 wad) public returns (bool) {
                return transferFrom(msg.sender, dst, wad);
            }

            function transferFrom(address src, address dst, uint256 wad) public returns (bool) {
                require(balanceOf[src] >= wad);

                if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
                    require(allowance[src][msg.sender] >= wad);
                    allowance[src][msg.sender] -= wad;
                }

                balanceOf[src] -= wad;
                balanceOf[dst] += wad;

                emit Transfer(src, dst, wad);

                return true;
            }
        }
        ```



## Creating Deployment Scripts

TODO: this will be able to be tested once the compiler is fixed

## Testing Uniswap V2 Contracts

TODO: this will be able to be tested once the compiler is fixed

## Deployment to Polkadot Asset Hub

TODO: this will be able to be tested once the compiler is fixed

## Creating a Liquidity Pool and Making Swaps

After deployment, let's create a script to add liquidity and make swaps. Create a file `scripts/interact.js`:


<!-- TODO: this is just a PoC -->
```javascript
const { ethers } = require("hardhat");

// Update these addresses with your deployed contract addresses
const ROUTER_ADDRESS = "YOUR_DEPLOYED_ROUTER_ADDRESS";
const TOKEN1_ADDRESS = "YOUR_DEPLOYED_TOKEN1_ADDRESS";
const TOKEN2_ADDRESS = "YOUR_DEPLOYED_TOKEN2_ADDRESS";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Interacting with account:", deployer.address);

  // Connect to deployed contracts
  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = Router.attach(ROUTER_ADDRESS);

  const Token = await ethers.getContractFactory("TestToken");
  const token1 = Token.attach(TOKEN1_ADDRESS);
  const token2 = Token.attach(TOKEN2_ADDRESS);

  // Approve router to spend tokens
  const approvalAmount = ethers.utils.parseEther("10000");
  await token1.approve(router.address, approvalAmount);
  await token2.approve(router.address, approvalAmount);
  console.log("Approved router to spend tokens");

  // Add liquidity
  const tx1 = await router.addLiquidity(
    token1.address,
    token2.address,
    ethers.utils.parseEther("1000"),  // amountADesired
    ethers.utils.parseEther("1000"),  // amountBDesired
    ethers.utils.parseEther("900"),   // amountAMin
    ethers.utils.parseEther("900"),   // amountBMin
    deployer.address,                 // to
    Math.floor(Date.now() / 1000) + 60 * 10  // deadline: 10 minutes from now
  );
  await tx1.wait();
  console.log("Added liquidity successfully");

  // Perform a swap
  const swapAmount = ethers.utils.parseEther("10");
  const tx2 = await router.swapExactTokensForTokens(
    swapAmount,                      // amountIn
    0,                               // amountOutMin
    [token1.address, token2.address], // path
    deployer.address,                // to
    Math.floor(Date.now() / 1000) + 60 * 10  // deadline: 10 minutes from now
  );
  await tx2.wait();
  console.log("Swap completed successfully");

  // Check balances
  const balance1 = await token1.balanceOf(deployer.address);
  const balance2 = await token2.balanceOf(deployer.address);
  console.log("Token1 balance:", ethers.utils.formatEther(balance1));
  console.log("Token2 balance:", ethers.utils.formatEther(balance2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Before running this script, update the contract addresses with your deployed contract addresses. Then run:

```bash
npx hardhat run scripts/interact.js --network westendAssetHub
```

## Conclusion

In this tutorial, you've learned how to deploy Uniswap v2 contracts to Polkadot Asset Hub, create liquidity pools, and perform token swaps. This implementation brings the powerful AMM model to the Polkadot ecosystem, enabling decentralized trading of any ERC-20 token pair.

By following this guide, you've gained practical experience with:

- Setting up a Hardhat project for deploying to Polkadot Asset Hub
- Understanding the Uniswap v2 architecture
- Deploying and testing Uniswap v2 contracts
- Creating liquidity pools and executing swaps
- Building a basic UI for interacting with your deployment

This knowledge can be leveraged to build more complex DeFi applications or to integrate Uniswap v2 functionality into your existing projects on Polkadot.