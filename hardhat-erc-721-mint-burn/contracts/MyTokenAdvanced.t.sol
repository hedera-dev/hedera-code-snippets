// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MyTokenAdvanced} from "../contracts/MyTokenAdvanced.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract MyTokenAdvancedTest is Test {
    MyTokenAdvanced private token;
    address private admin = makeAddr("admin");
    address private pauser = makeAddr("pauser");
    address private minter = makeAddr("minter");
    address private alice = makeAddr("alice");
    address private bob = makeAddr("bob");

    function setUp() public {
        token = new MyTokenAdvanced(admin, pauser, minter);
    }

    function test_RolesGranted() public view {
        bytes32 DEFAULT_ADMIN_ROLE = 0x00;
        assertTrue(
            token.hasRole(DEFAULT_ADMIN_ROLE, admin),
            "admin should have default admin"
        );
        assertTrue(token.hasRole(token.PAUSER_ROLE(), pauser), "pauser role");
        assertTrue(token.hasRole(token.MINTER_ROLE(), minter), "minter role");
    }

    function test_MinterCanMint_WithURI() public {
        vm.prank(minter);
        uint256 id = token.safeMint(alice, "ipfs://token/1");
        assertEq(id, 0);
        assertEq(token.ownerOf(0), alice);
        assertEq(token.tokenURI(0), "ipfs://token/1");
    }

    function test_NonMinterCannotMint() public {
        vm.prank(alice);
        vm.expectRevert();
        token.safeMint(alice, "uri");
    }

    function test_PauseBlocksTransfers() public {
        vm.prank(minter);
        token.safeMint(alice, "uri");

        vm.prank(pauser);
        token.pause();

        vm.startPrank(alice);
        vm.expectRevert();
        token.transferFrom(alice, bob, 0);
        vm.stopPrank();
    }

    function test_UnpauseThenTransfer() public {
        vm.prank(minter);
        token.safeMint(alice, "uri");

        vm.prank(pauser);
        token.pause();

        vm.prank(pauser);
        token.unpause();

        vm.prank(alice);
        token.transferFrom(alice, bob, 0);

        assertEq(token.ownerOf(0), bob);
    }

    function test_SupportsInterface() public view {
        assertTrue(
            token.supportsInterface(type(IERC721).interfaceId),
            "supports IERC721"
        );
        assertTrue(
            token.supportsInterface(type(IAccessControl).interfaceId),
            "supports IAccessControl"
        );
    }
}
