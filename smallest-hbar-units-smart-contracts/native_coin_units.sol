// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

contract NativeCoinUnits {
    // for ethereum,
    // - the "full unit" of the native coin is an ether, and
    // - the "smallest unit" is a wei
    uint256 public oneWei = 1 wei;
    bool public isOneWei = (oneWei == 1);
    uint256 public oneEther = 1 ether;
    bool public isOneEther = (oneEther == 1e18);

    // for hedera,
    // - the "full unit" of the native coin is an hbar, and
    // - the "smallest unit" is a tinyhbar
    uint256 public oneTinybar = 1;
    bool public isOneTinybar = (oneTinybar == 1);
    uint256 public oneHbar = 100_000_000; // note specify manually, no unit
    bool public isOneHbar = (oneHbar == 1e8);
}
