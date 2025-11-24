// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Storage {
    uint256 private storedNumber;

    event NumberUpdated(uint256 newValue);

    function store(uint256 num) public {
        storedNumber = num;
        emit NumberUpdated(num);
    }

    function retrieve() public view returns (uint256) {
        return storedNumber;
    }
}
