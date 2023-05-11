// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

contract TinybarsDemo {
    function checkBalance()
        public view
        returns (uint256 senderBalance)
    {
        senderBalance = msg.sender.balance;
    }
}
