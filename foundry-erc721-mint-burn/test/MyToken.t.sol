// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MyTokenTest is Test {
    MyToken internal token;

    address internal owner;
    address internal alice;
    address internal bob;

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        // Deploy with explicit initial owner
        token = new MyToken(owner);

        // For nicer traces
        vm.label(address(token), "MyToken");
        vm.label(owner, "Owner");
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
    }

    /* =========================
                Basics
       ========================= */

    function test_NameAndSymbol() public view {
        assertEq(token.name(), "MyToken");
        assertEq(token.symbol(), "MTK");
    }

    function test_SupportsERC721Interface() public view {
        // IERC721 interfaceId = 0x80ac58cd
        assertTrue(token.supportsInterface(type(IERC721).interfaceId));
    }

    /* =========================
               Ownership
       ========================= */

    function test_OnlyOwnerCanMint() public {
        // Non-owner tries to mint → revert with OwnableUnauthorizedAccount(address)
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                alice
            )
        );
        token.safeMint(alice);
    }

    function test_MintByOwner_IncrementsBalanceAndReturnsTokenId() public {
        // First mint should return 0
        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);
        assertEq(id0, 0);
        assertEq(token.balanceOf(alice), 1);
        assertEq(token.ownerOf(0), alice);

        // Second mint should return 1
        vm.prank(owner);
        uint256 id1 = token.safeMint(alice);
        assertEq(id1, 1);
        assertEq(token.balanceOf(alice), 2);
        assertEq(token.ownerOf(1), alice);
    }

    /* =========================
                 Burn
       ========================= */

    function test_BurnByOwner_RemovesTokenAndDecrementsBalance() public {
        // Mint tokenId 0 to Alice
        vm.startPrank(owner);
        uint256 id0 = token.safeMint(alice);
        vm.stopPrank();

        assertEq(id0, 0);
        assertEq(token.balanceOf(alice), 1);
        assertEq(token.ownerOf(0), alice);

        // Alice (owner) burns tokenId 0
        vm.prank(alice);
        token.burn(0);

        // After burn: token no longer exists → ownerOf(0) should revert
        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 0)
        );
        token.ownerOf(0);

        // Balance drops
        assertEq(token.balanceOf(alice), 0);
    }

    function test_BurnRequiresOwnerOrApproved() public {
        // Mint tokenId 0 to Alice
        vm.prank(owner);
        token.safeMint(alice);

        // Bob (not owner/approved) tries to burn → revert with ERC721InsufficientApproval(address,uint256)
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC721InsufficientApproval(address,uint256)",
                bob,
                0
            )
        );
        token.burn(0);
    }

    function test_BurnByApprovedOperator_Succeeds() public {
        // Mint tokenId 0 to Alice
        vm.prank(owner);
        token.safeMint(alice);

        // Alice approves Bob for tokenId 0
        vm.prank(alice);
        token.approve(bob, 0);

        // Bob can now burn tokenId 0
        vm.prank(bob);
        token.burn(0);

        // Token gone
        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 0)
        );
        token.ownerOf(0);
        assertEq(token.balanceOf(alice), 0);
    }

    function test_BurnByOperatorApprovedForAll_Succeeds() public {
        // Mint tokenId 0 to Alice
        vm.prank(owner);
        token.safeMint(alice);

        // Approve Bob for all of Alice's tokens
        vm.prank(alice);
        token.setApprovalForAll(bob, true);

        // Bob can burn tokenId 0
        vm.prank(bob);
        token.burn(0);

        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 0)
        );
        token.ownerOf(0);
        assertEq(token.balanceOf(alice), 0);
    }

    /* =========================
               Fuzzing
       ========================= */

    function testFuzz_MintToAnyNonZeroAddress(address to) public {
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0); // ensure EOA, not a contract

        vm.prank(owner);
        uint256 id = token.safeMint(to);

        // id should be valid (not strictly needed to check exact id; existence is enough)
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
    }
}
