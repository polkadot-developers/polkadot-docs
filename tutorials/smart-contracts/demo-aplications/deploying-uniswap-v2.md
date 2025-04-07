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
    mkdir uniswap-polkadot
    cd uniswap-polkadot
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
TODO: add hardhat.config.js
```

Note: The Uniswap v2 contracts use multiple Solidity versions, which is why we've specified multiple compiler versions. -->

7. Create a `.env` file in your project root to store your private key:

    ```
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
- **WETH Contract** - wrapped ETH, allowing ETH to be treated as an ERC-20 token in the ecosystem

## Importing Uniswap v2 Contracts

1. Install the [Uniswap v2 contracts](https://github.com/Uniswap/v2-core){target=\_blank}:

    ```bash
    npm install @uniswap/v2-core @uniswap/v2-periphery
    ```

2. Create the necessary contract directories:

    ```bash
    mkdir -p contracts/core
    mkdir -p contracts/periphery
    ```

3. Let's first create a WETH contract for the Polkadot ecosystem. Create a file `contracts/periphery/WETH.sol`:

    ```solidity
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

4. Create a simple ERC-20 token for testing. Create a file `contracts/TestToken.sol`:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.28;

    contract TestToken {
        string public name;
        string public symbol;
        uint8 public decimals = 18;
        uint256 public totalSupply;

        mapping(address => uint256) public balanceOf;
        mapping(address => mapping(address => uint256)) public allowance;

        event Transfer(address indexed from, address indexed to, uint256 value);
        event Approval(address indexed owner, address indexed spender, uint256 value);

        constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
            name = _name;
            symbol = _symbol;
            _mint(msg.sender, _initialSupply);
        }

        function _mint(address account, uint256 amount) internal {
            require(account != address(0), "ERC20: mint to the zero address");

            totalSupply += amount;
            balanceOf[account] += amount;
            emit Transfer(address(0), account, amount);
        }

        function transfer(address recipient, uint256 amount) public returns (bool) {
            _transfer(msg.sender, recipient, amount);
            return true;
        }

        function approve(address spender, uint256 amount) public returns (bool) {
            _approve(msg.sender, spender, amount);
            return true;
        }

        function transferFrom(
            address sender,
            address recipient,
            uint256 amount
        ) public returns (bool) {
            _transfer(sender, recipient, amount);

            uint256 currentAllowance = allowance[sender][msg.sender];
            require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
            unchecked {
                _approve(sender, msg.sender, currentAllowance - amount);
            }

            return true;
        }

        function _transfer(
            address sender,
            address recipient,
            uint256 amount
        ) internal {
            require(sender != address(0), "ERC20: transfer from the zero address");
            require(recipient != address(0), "ERC20: transfer to the zero address");

            uint256 senderBalance = balanceOf[sender];
            require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
            unchecked {
                balanceOf[sender] = senderBalance - amount;
            }
            balanceOf[recipient] += amount;

            emit Transfer(sender, recipient, amount);
        }

        function _approve(
            address owner,
            address spender,
            uint256 amount
        ) internal {
            require(owner != address(0), "ERC20: approve from the zero address");
            require(spender != address(0), "ERC20: approve to the zero address");

            allowance[owner][spender] = amount;
            emit Approval(owner, spender, amount);
        }
    }
    ```

## Implementing the Uniswap Factory Contract

Create a file `contracts/core/UniswapV2Factory.sol`:

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity=0.5.16;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/UniswapV2Pair.sol';

contract UniswapV2Factory is IUniswapV2Factory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS');
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IUniswapV2Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
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

## Implementing the Uniswap Router Contract

Create a file `contracts/periphery/UniswapV2Router02.sol`:

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.6.6;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';
import '@uniswap/v2-periphery/contracts/libraries/SafeMath.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IERC20.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';

contract UniswapV2Router02 is IUniswapV2Router02 {
    using SafeMath for uint;

    address public immutable override factory;
    address public immutable override WETH;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        _;
    }

    constructor(address _factory, address _WETH) public {
        factory = _factory;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist yet
        if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
            IUniswapV2Factory(factory).createPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IUniswapV2Pair(pair).mint(to);
    }
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
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
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = IUniswapV2Pair(pair).burn(to);
        (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
    }
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
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
    
    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        amounts = UniswapV2Library.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[path.length - 1] == WETH, 'UniswapV2Router: INVALID_PATH');
        amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
    }
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        virtual
        override
        payable
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[0] == WETH, 'UniswapV2Router: INVALID_PATH');
        amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= msg.value, 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(UniswapV2Library.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        // refund dust eth, if any
        if (msg.value > amounts[0]) TransferHelper.safeTransferETH(msg.sender, msg.value - amounts[0]);
    }

    // **** LIBRARY FUNCTIONS ****
    function quote(uint amountA, uint reserveA, uint reserveB) public pure virtual override returns (uint amountB) {
        return UniswapV2Library.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountOut)
    {
        return UniswapV2Library.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut)
        public
        pure
        virtual
        override
        returns (uint amountIn)
    {
        return UniswapV2Library.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint amountIn, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint amountOut, address[] memory path)
        public
        view
        virtual
        override
        returns (uint[] memory amounts)
    {
        return UniswapV2Library.getAmountsIn(factory, amountOut, path);
    }
}
```

## Creating Deployment Scripts

Now let's create deployment scripts using Hardhat Ignition. Create a new folder `ignition/modules` and add the following files:

1. Create `ignition/modules/WethModule.js`:

```javascript
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('WethModule', (m) => {
  const weth = m.contract('WETH');
  return { weth };
});
```

2. Create `ignition/modules/TestTokenModule.js`:

```javascript
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('TestTokenModule', (m) => {
  // Create two test tokens with initial supply of 1,000,000 tokens
  const token1 = m.contract('TestToken', ['PolkaDot Test Token 1', 'PTT1', ethers.utils.parseEther('1000000')]);
  const token2 = m.contract('TestToken', ['PolkaDot Test Token 2', 'PTT2', ethers.utils.parseEther('1000000')]);
  
  return { token1, token2 };
});
```

3. Create `ignition/modules/UniswapV2Module.js`:

```javascript
const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('UniswapV2Module', async (m) => {
  const wethModule = await m.useModule('WethModule');

  // Deploy the factory
  const factory = m.contract('UniswapV2Factory', ['0x0000000000000000000000000000000000000000']); // No fee recipient

  // Deploy the router using the factory and WETH addresses
  const router = m.contract('UniswapV2Router02', [
    m.getContractAddress(factory),
    m.getContractAddress(wethModule.weth)
  ]);

  return { factory, router };
});
```

## Testing Uniswap v2 Contracts

Let's create tests to verify our contracts work correctly. Create a file `test/Uniswap.js`:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Uniswap v2", function () {
  let owner, user1, user2;
  let weth, token1, token2, factory, router;
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy WETH
    const WETH = await ethers.getContractFactory("WETH");
    weth = await WETH.deploy();
    await weth.deployed();

    // Deploy test tokens
    const TestToken = await ethers.getContractFactory("TestToken");
    token1 = await TestToken.deploy("PolkaDot Test Token 1", "PTT1", INITIAL_SUPPLY);
    token2 = await TestToken.deploy("PolkaDot Test Token 2", "PTT2", INITIAL_SUPPLY);
    await token1.deployed();
    await token2.deployed();

    // Deploy factory
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    // Deploy router
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(factory.address, weth.address);
    await router.deployed();

    // Transfer tokens to users for testing
    await token1.transfer(user1.address, ethers.utils.parseEther("10000"));
    await token2.transfer(user1.address, ethers.utils.parseEther("10000"));
  });

  it("should allow creating a pair and adding liquidity", async function () {
    // Approve router to spend tokens
    await token1.connect(user1).approve(router.address, ethers.utils.parseEther("5000"));
    await token2.connect(user1).approve(router.address, ethers.utils.parseEther("5000"));

    // Add liquidity
    await router.connect(user1).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1000"),  // amountADesired
      ethers.utils.parseEther("1000"),  // amountBDesired
      ethers.utils.parseEther("900"),   // amountAMin
      ethers.utils.parseEther("900"),   // amountBMin
      user1.address,                    // to
      Math.floor(Date.now() / 1000) + 60 * 10  // deadline: 10 minutes from now
    );

    // Get pair address
    const pairAddress = await factory.getPair(token1.address, token2.address);
    expect(pairAddress).to.not.equal(ethers.constants.AddressZero);
    
    // Get pair contract
    const Pair = await ethers.getContractFactory("UniswapV2Pair");
    const pair = Pair.attach(pairAddress);
    
    // Check liquidity tokens
    const balance = await pair.balanceOf(user1.address);
    expect(balance).to.be.gt(0);
  });

  it("should allow swapping tokens", async function () {
    // Create pair and add liquidity first
    await token1.connect(user1).approve(router.address, ethers.utils.parseEther("5000"));
    await token2.connect(user1).approve(router.address, ethers.utils.parseEther("5000"));
    
    await router.connect(user1).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1000"),
      ethers.utils.parseEther("1000"),
      0, 0, user1.address,
      Math.floor(Date.now() / 1000) + 60 * 10
    );
    
    // Check initial balance of user2
    const initialBalance = await token2.balanceOf(user2.address);
    
    // Swap tokens
    const amountToSwap = ethers.utils.parseEther("10");
    await token1.transfer(user2.address, amountToSwap);
    await token1.connect(user2).approve(router.address, amountToSwap);
    
    await router.connect(user2).swapExactTokensForTokens(
      amountToSwap,
      0, // min amount out
      [token1.address, token2.address],
      user2.address,
      Math.floor(Date.now() / 1000) + 60 * 10
    );
    
    // Check final balance of user2
    const finalBalance = await token2.balanceOf(user2.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });
});
```

## Deployment to Polkadot Asset Hub

Now that we have set up our contracts and tests, let's deploy them to the Westend Asset Hub testnet. Create a deployment script `scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Uniswap v2 to Polkadot Asset Hub...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy WETH
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH deployed to:", weth.address);

  // Deploy Factory
  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  // Deploy Router
  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(factory.address, weth.address);
  await router.deployed();
  console.log("Router deployed to:", router.address);

  // Deploy test tokens (optional for real deployment)
  const TestToken = await ethers.getContractFactory("TestToken");
  const token1 = await TestToken.deploy("PolkaDot Test Token 1", "PTT1", ethers.utils.parseEther("1000000"));
  await token1.deployed();
  console.log("Test Token 1 deployed to:", token1.address);

  const token2 = await TestToken.deploy("PolkaDot Test Token 2", "PTT2", ethers.utils.parseEther("1000000"));
  await token2.deployed();
  console.log("Test Token 2 deployed to:", token2.address);

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

To deploy to the Westend Asset Hub, run:

```bash
npx hardhat run scripts/deploy.js --network westendAssetHub
```

## Creating a Liquidity Pool and Making Swaps

After deployment, let's create a script to add liquidity and make swaps. Create a file `scripts/interact.js`:

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

## Troubleshooting

Here are some common issues and how to resolve them:

1. **Gas Error**: If you get gas-related errors, make sure your wallet has enough WND tokens for transaction fees.

2. **Contract Deployment Fails**: Double-check your compiler versions and make sure they match the requirements of Uniswap v2 contracts.

3. **Pair Creation Fails**: Ensure you're using valid token addresses and that you've approved the router to spend tokens.

4. **Swap Fails**: Verify that the liquidity pool has enough liquidity for the swap and check if the slippage tolerance is appropriate.

## Advanced Features

Once you have the basic implementation working, you can extend it with additional features:

1. **Flash Swaps**: Implement flash swap functionality to borrow and repay tokens within a single transaction.

2. **Price Oracle**: Use Uniswap v2's time-weighted average price (TWAP) oracle functionality.

3. **Fee Collection**: Configure fee collection to earn a percentage of trading fees.

4. **Integration with Other DeFi Protocols**: Connect your Uniswap v2 implementation with other DeFi protocols on Polkadot Asset Hub.

## Conclusion

In this tutorial, you've learned how to deploy Uniswap v2 contracts to Polkadot Asset Hub, create liquidity pools, and perform token swaps. This implementation brings the powerful AMM model to the Polkadot ecosystem, enabling decentralized trading of any ERC-20 token pair.

By following this guide, you've gained practical experience with:

- Setting up a Hardhat project for deploying to Polkadot Asset Hub
- Understanding the Uniswap v2 architecture
- Deploying and testing Uniswap v2 contracts
- Creating liquidity pools and executing swaps
- Building a basic UI for interacting with your deployment

This knowledge can be leveraged to build more complex DeFi applications or to integrate Uniswap v2 functionality into your existing projects on Polkadot.

## Further Resources

- [Uniswap v2 Documentation](https://docs.uniswap.org/protocol/V2/introduction)
- [Polkadot Asset Hub Documentation](https://docs.polkadot.network/docs/learn-asset-hub)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [ERC-20 Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)