// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MyToken} from "../contracts/MyToken.sol";

contract MyTokenTest is Test {
    MyToken private token;
    address private owner = makeAddr("owner");
    address private alice = makeAddr("alice");
    address private bob = makeAddr("bob");

    function setUp() public {
        token = new MyToken(owner);
    }

    function test_OwnerCanMintAndTokenIdsIncrement() public {
        vm.prank(owner);
        uint256 id0 = token.safeMint(alice);
        assertEq(id0, 0);

        vm.prank(owner);
        uint256 id1 = token.safeMint(alice);
        assertEq(id1, 1);

        assertEq(token.balanceOf(alice), 2);
        assertEq(token.ownerOf(0), alice);
        assertEq(token.ownerOf(1), alice);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(alice);
        vm.expectRevert();
        token.safeMint(alice);
    }

    function test_BurnByOwner() public {
        vm.prank(owner);
        uint256 id = token.safeMint(owner);
        assertEq(id, 0);
        assertEq(token.balanceOf(owner), 1);

        vm.prank(owner);
        token.burn(0);

        assertEq(token.balanceOf(owner), 0);
        vm.expectRevert();
        token.ownerOf(0);
    }

    function test_ApprovedCanBurn() public {
        vm.prank(owner);
        token.safeMint(alice);
        assertEq(token.ownerOf(0), alice);

        vm.prank(alice);
        token.approve(bob, 0);

        vm.prank(bob);
        token.burn(0);

        vm.expectRevert();
        token.ownerOf(0);
    }

    function test_Transfer() public {
        vm.prank(owner);
        token.safeMint(owner);

        vm.prank(owner);
        token.transferFrom(owner, alice, 0);

        assertEq(token.ownerOf(0), alice);
        assertEq(token.balanceOf(alice), 1);
    }
}
