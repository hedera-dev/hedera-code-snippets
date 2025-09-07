// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Foundry-style Solidity tests
import "forge-std/Test.sol";

import "./MyHTSTokenPFWD.sol";

contract MyHTSTokenPFWD_Test is Test {
    MyHTSTokenPFWD internal token;

    // Test actors
    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        // Deploy with a pranked sender so owner() is set to `owner`
        vm.prank(owner);
        token = new MyHTSTokenPFWD();
    }

    function test_OwnerIsSet() public view {
        assertEq(token.owner(), owner, "owner should be set from constructor");
    }

    // -----------------------
    // createNFTCollection guard
    // -----------------------

    function test_CreateNFTCollection_onlyOwner() public {
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

    // -----------------------
    // Mint/Burn basic guards
    // -----------------------

    function test_MintRevertsBeforeCollectionCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.mintNFT(alice);
    }

    function test_MintWithMetadataOver100Bytes_revertsEarly() public {
        bytes memory tooLarge = new bytes(101);
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: metadata >100 bytes"));
        token.mintNFT(alice, tooLarge);
    }

    function test_BurnRevertsBeforeCollectionCreated() public {
        vm.expectRevert(bytes("HTS: not created"));
        token.burnNFT(1);
    }

    // -----------------------
    // Pause/Unpause
    // -----------------------

    function test_Pause_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.pauseToken();
    }

    function test_Pause_requireCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.pauseToken();
    }

    function test_Unpause_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.unpauseToken();
    }

    function test_Unpause_requireCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.unpauseToken();
    }

    // -----------------------
    // Freeze/Unfreeze
    // -----------------------

    function test_Freeze_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.freezeAccount(bob);
    }

    function test_Freeze_requireCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.freezeAccount(bob);
    }

    function test_Unfreeze_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.unfreezeAccount(bob);
    }

    function test_Unfreeze_requireCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.unfreezeAccount(bob);
    }

    // -----------------------
    // Wipe
    // -----------------------

    function test_Wipe_onlyOwner() public {
        int64[] memory serials = new int64[](1);
        serials[0] = int64(1);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.wipeTokenFromAccount(bob, serials);
    }

    function test_Wipe_requireCreated() public {
        int64[] memory serials = new int64[](1);
        serials[0] = int64(1);

        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.wipeTokenFromAccount(bob, serials);
    }

    // -----------------------
    // Delete
    // -----------------------

    function test_Delete_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.deleteToken();
    }

    function test_Delete_requireCreated() public {
        vm.prank(owner);
        vm.expectRevert(bytes("HTS: not created"));
        token.deleteToken();
    }

    // -----------------------
    // HBAR receive / withdraw
    // -----------------------

    function test_ReceiveAndWithdrawHBAR() public {
        // Fund alice and send HBAR to the contract (triggers receive and HBARReceived event)
        vm.deal(alice, 2 ether);

        // Expect the HBARReceived event from the token contract (set emitter!)
        vm.expectEmit(true, true, true, true, address(token));
        emit MyHTSTokenPFWD.HBARReceived(alice, 1.5 ether);

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
        emit MyHTSTokenPFWD.HBARWithdrawn(owner, 1.5 ether);

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
    // Full integration of pause/freeze/wipe/delete flows should be covered in integration tests on Hedera testnet.
}
