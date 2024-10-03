// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HederaERC20Token is ERC20, Ownable {
    constructor() ERC20("Hedera Test Token", "HTT") Ownable(msg.sender) {
        // Mint initial supply 
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Function to mint tokens (only the contract owner)
    function mintToAddress(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
