// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title SimpleStorage
 * @dev Store & retrieve a value in the blockchain
 */
contract SimpleStorage {
    // State variable to store a number
    uint256 private storedData;
    
    // Event to emit when the stored value changes
    event ValueChanged(uint256 newValue);

    // Function to store a new value
    function set(uint256 x) public {
        storedData = x;
        emit ValueChanged(x);
    }

    // Function to retrieve the current value
    function get() public view returns (uint256) {
        return storedData;
    }
}