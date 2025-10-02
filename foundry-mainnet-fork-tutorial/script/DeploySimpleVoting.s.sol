// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import {SimpleVoting} from "../src/SimpleVoting.sol";

contract DeploySimpleVoting is Script {
    function run() external returns (address deployed) {
        uint256 pk = vm.envUint("HEDERA_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        console2.log("Deployer:", deployer);

        vm.startBroadcast(pk);
        // No constructor params (intentionally minimal)
        SimpleVoting voting = new SimpleVoting();
        vm.stopBroadcast();

        deployed = address(voting);
        console2.log("SimpleVoting deployed at:", deployed);
    }
}
