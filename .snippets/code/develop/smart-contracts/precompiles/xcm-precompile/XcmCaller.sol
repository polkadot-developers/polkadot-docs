// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title XcmCaller
 * @dev A contract to interact with the IXcm precompile at a fixed address.
 */
contract XcmCaller {
    // The address of the IXcm precompiled contract.
    address private immutable XCM_PRECOMPILE_ADDRESS = 0x00000000000000000000000000000000000a0000;

    /**
     * @notice Forwards the xcmExecute call to the precompiled IXcm contract.
     * @param message The Versioned XCM message to send.
     * @param weight The maximum amount of weight to be used to execute the message.
     */
    function callXcmExecute(bytes calldata message, IXcm.Weight calldata weight) external {
        IXcm(XCM_PRECOMPILE_ADDRESS).execute(message, weight);
    }

    /**
     * @notice Forwards the xcmSend call to the precompiled IXcm contract.
     * @param destination The destination location, encoded according to the XCM format.
     * @param message The Versioned XCM message to send.
     */
    function callXcmSend(bytes calldata destination, bytes calldata message) external {
        IXcm(XCM_PRECOMPILE_ADDRESS).send(destination, message);
    }

    /**
     * @notice Forwards the weighMessage call to the precompiled IXcm contract.
     * @param message The XCM message to send.
     * @return weight The estimated weight cost.
     */
    function callWeighMessage(bytes calldata message) external view returns (IXcm.Weight memory) {
        return IXcm(XCM_PRECOMPILE_ADDRESS).weighMessage(message);
    }

    receive() external payable {}
}