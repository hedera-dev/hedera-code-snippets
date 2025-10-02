// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MyHTSToken} from "./MyHTSToken.sol";

contract MyHTSTokenTest is Test {
    MyHTSToken private token;

    address private owner = makeAddr("owner");
    address private alice = makeAddr("alice");
    address private bob = makeAddr("bob");

    function setUp() public {
        // Deploy with a pranked sender so owner() is set to `owner`
        vm.prank(owner);
        token = new MyHTSToken();
    }

    function test_OwnerIsSet() public view {
        assertEq(token.owner(), owner, "owner should be set from constructor");
    }

    function test_OnlyOwnerCanCallCreateNFTCollection() public {
        // Non-owner should be blocked by onlyOwner before hitting HTS precompile
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.createNFTCollection("Name", "SYM");

        // Owner path: we expect the call to revert due to missing HTS precompile in local tests,
        // but the onlyOwner gate is what we verify here. To avoid hitting HTS, we do not execute it.
    }

    function test_MintRevertsBeforeCollectionCreated() public {
        // OnlyOwner gate passes first
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.mintNFT(alice);
    }

    function test_BurnRevertsBeforeCollectionCreated() public {
        vm.expectRevert(bytes("HTS: not created"));
        token.burnNFT(1);
    }

    function test_ReceiveAndWithdrawHBAR() public {
        // Fund alice and send HBAR to the contract (triggers receive and HBARReceived event)
        vm.deal(alice, 2 ether);

        vm.expectEmit(true, true, true, true);
        emit MyHTSToken.HBARReceived(alice, 1.5 ether);

        vm.prank(alice);
        (bool ok, ) = address(token).call{value: 1.5 ether}("");
        assertTrue(ok, "sending HBAR to contract failed");

        // Non-owner cannot withdraw
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.withdrawHBAR();

        // Owner can withdraw all HBAR; verify event and contract balance goes to zero
        vm.expectEmit(true, true, true, true);
        emit MyHTSToken.HBARWithdrawn(owner, 1.5 ether);

        vm.prank(owner);
        token.withdrawHBAR();

        assertEq(
            address(token).balance,
            0,
            "contract balance should be zero after withdraw"
        );
    }

    // Note: We intentionally avoid calling createNFTCollection() in local tests,
    // because Hedera HTS precompiles are not available in a standard local EVM.
    // Full integration of mint/burn flows is covered in the TypeScript test targeting Hedera testnet.
}
