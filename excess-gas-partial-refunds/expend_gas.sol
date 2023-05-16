// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

contract ExpendSomeGasDemo {
    uint256 public state;

    function updateState(
        uint256 newState
    )
        public
        returns (uint256 updatedState)
    {
        state = newState;
        updatedState = newState;
    }
}
