// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MyTokenTest is Test {
    // Your deployed mainnet contract:
    // https://hashscan.io/mainnet/contract/0x07F6D65f9454EA2dff99bF8C2C1De918Fcd27416
    address internal constant DEPLOYED =
        0x07F6D65f9454EA2dff99bF8C2C1De918Fcd27416;

    MyToken internal token;

    address internal owner;
    address internal alice;
    address internal bob;

    function setUp() public {
        // Bind to deployed contract
        token = MyToken(DEPLOYED);

        // Discover real on-chain owner (Ownable)
        owner = token.owner();

        // Locally create EOAs with labeled traces
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        // Fund/initialize accounts locally to avoid remote eth_getBalance calls
        // (Helps prevent 429 rate limits when running on a fork)
        vm.deal(owner, 100 ether);
        vm.deal(alice, 0);
        vm.deal(bob, 0);

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
        assertTrue(
            IERC721(address(token)).supportsInterface(type(IERC721).interfaceId)
        );
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
        // Use real owner from chain
        uint256 beforeBal = token.balanceOf(alice);

        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);
        assertEq(token.ownerOf(id0), alice);
        assertEq(token.balanceOf(alice), beforeBal + 1);

        vm.prank(owner);
        uint256 id1 = token.safeMint(alice);
        assertEq(token.ownerOf(id1), alice);
        assertEq(token.balanceOf(alice), beforeBal + 2);

        // Do not assume sequential IDs starting at 0 on a fork; just ensure distinct IDs
        assertTrue(id1 != id0);
    }

    /* =========================
                 Burn
       ========================= */

    function test_BurnByOwner_RemovesTokenAndDecrementsBalance() public {
        // Mint to Alice using the real owner
        vm.startPrank(owner);
        uint256 id0 = token.safeMint(alice);
        vm.stopPrank();

        uint256 beforeBal = token.balanceOf(alice);
        assertEq(token.ownerOf(id0), alice);

        // Alice (owner of token) burns tokenId
        vm.prank(alice);
        token.burn(id0);

        // After burn: token no longer exists → ownerOf(id0) should revert
        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", id0)
        );
        token.ownerOf(id0);

        // Balance drops by 1
        assertEq(token.balanceOf(alice), beforeBal - 1);
    }

    function test_BurnRequiresOwnerOrApproved() public {
        // Mint tokenId to Alice
        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);

        // Bob (not owner/approved) tries to burn → revert with ERC721InsufficientApproval(address,uint256)
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC721InsufficientApproval(address,uint256)",
                bob,
                id0
            )
        );
        token.burn(id0);
    }

    function test_BurnByApprovedOperator_Succeeds() public {
        // Mint tokenId to Alice
        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);

        // Alice approves Bob for tokenId
        vm.prank(alice);
        token.approve(bob, id0);

        // Bob can now burn that tokenId
        vm.prank(bob);
        token.burn(id0);

        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", id0)
        );
        token.ownerOf(id0);
        // Balance of Alice decreased
        // (we don't assert exact value; just ensure the token is gone)
        // Optionally: assertEq(token.balanceOf(alice), prev - 1);
    }

    function test_BurnByOperatorApprovedForAll_Succeeds() public {
        // Mint tokenId to Alice
        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);

        // Approve Bob for all of Alice's tokens
        vm.prank(alice);
        token.setApprovalForAll(bob, true);

        // Bob can burn that tokenId
        vm.prank(bob);
        token.burn(id0);

        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", id0)
        );
        token.ownerOf(id0);
        // Optionally check balance decrease as above
    }

    /* =========================
               Fuzzing
       ========================= */

    function testFuzz_MintToAnyNonZeroAddress(address to) public {
        vm.assume(to != address(0));

        // Avoid remote eth_getBalance lookups for every fuzz input
        vm.deal(to, 0);

        vm.prank(owner);
        uint256 id = token.safeMint(to);

        // id should be valid
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
    }
}
