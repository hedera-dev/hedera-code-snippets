// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {HederaToken} from "../src/HederaToken.sol";

contract HederaTokenScript is Script {
    function run() external returns (address) {
        // Load the private key from the .env file
        uint256 deployerPrivateKey = vm.envUint("HEDERA_PRIVATE_KEY");

        // Start broadcasting transactions with the loaded private key
        vm.startBroadcast(deployerPrivateKey);

        // Get the deployer's address to use as the initial owner
        address deployerAddress = vm.addr(deployerPrivateKey);

        // Deploy the contract
        HederaToken hederaToken = new HederaToken(deployerAddress);

        // Stop broadcasting
        vm.stopBroadcast();

        console.log("HederaToken deployed to:", address(hederaToken));

        return address(hederaToken);
    }
}
