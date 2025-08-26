// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {MyTokenUpgradeable} from "./MyTokenUpgradeable.sol";

contract MyTokenUpgradeableV2 is MyTokenUpgradeable {
    // Example new function to verify the upgrade worked
    function version() public pure returns (string memory) {
        return "v2";
    }
}
