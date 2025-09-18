// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract MintMyTokenScript is Script {
    function run() external {
        // Load the private key from the .env file
        uint256 deployerPrivateKey = vm.envUint("HEDERA_PRIVATE_KEY");

        address contractAddr = 0x1112a82254f48e0daEEE3fFD009B4E44a66A7f77; // Replace with your deployed contract address
        address recipient = vm.envOr("RECIPIENT", vm.addr(deployerPrivateKey)); // Default to deployer address if RECIPIENT not set

        vm.startBroadcast(deployerPrivateKey);
        MyToken token = MyToken(contractAddr);
        uint256 beforeBal = token.balanceOf(recipient);
        uint256 tokenId = token.safeMint(recipient);
        uint256 afterBal = token.balanceOf(recipient);
        vm.stopBroadcast();

        console.log("Minted tokenId:", tokenId);
        console.log("Recipient:", recipient);
        console.log("Balance before:", beforeBal);
        console.log("Balance after:", afterBal);
    }
}
