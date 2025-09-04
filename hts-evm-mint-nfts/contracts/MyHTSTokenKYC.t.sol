// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Foundry-style Solidity tests
import "forge-std/Test.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

import "./MyHTSTokenKYC.sol";

contract MyHTSTokenKYC_Test is Test {
    MyHTSTokenKYC internal token;

    // Test actors
    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    // Common constants
    uint256 constant CREATION_FEE_HBAR = 15 ether;

    function setUp() public {
        // Deploy with a pranked sender so owner() is set to `owner`
        vm.prank(owner);
        token = new MyHTSTokenKYC();
    }

    function test_OwnerIsSet() public view {
        assertEq(token.owner(), owner, "owner should be set from constructor");
    }

    // -----------------------
    // Basic ownership/guards
    // -----------------------

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

        // Owner path intentionally not executed in unit tests (HTS precompile unavailable locally)
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

    function test_UpdateKYCKey_onlyOwner() public {
        // Non-owner cannot call
        bytes memory dummyKey = hex"02";
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.updateKYCKey(dummyKey);
    }

    function test_GrantRevokeKYC_requireCreated() public {
        // Before create, KYC ops revert with "HTS: not created"
        vm.expectRevert(bytes("HTS: not created"));
        token.grantKYC(alice);

        vm.expectRevert(bytes("HTS: not created"));
        token.revokeKYC(alice);

        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.updateKYCKey(hex"02");
    }

    function test_ReceiveAndWithdrawHBAR() public {
        // Fund alice and send HBAR to the contract (triggers receive and HBARReceived event)
        vm.deal(alice, 2 ether);

        // Expect the HBARReceived event from the token contract (set emitter!)
        vm.expectEmit(true, true, true, true, address(token));
        emit MyHTSTokenKYC.HBARReceived(alice, 1.5 ether);

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
        vm.expectEmit(true, true, true, true, address(token));
        emit MyHTSTokenKYC.HBARWithdrawn(owner, 1.5 ether);

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
    // Full integration of mint/burn + KYC flows is covered in the TS tests on Hedera testnet.
}
