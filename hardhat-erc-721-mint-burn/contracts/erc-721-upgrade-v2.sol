// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./erc-721-upgrade.sol";

contract MyTokenUpgradeableV2 is MyTokenUpgradeable {

    // New function for demonstration
    function version() public pure returns (string memory) {
        return "v2";
    }
}
