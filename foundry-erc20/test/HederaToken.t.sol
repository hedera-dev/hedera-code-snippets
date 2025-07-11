// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import {Test, console} from "forge-std/Test.sol";
import {HederaToken} from "../src/HederaToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract HederaTokenTest is Test {
    HederaToken public token;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(0xABCD);
        user = address(0x1234);
        token = new HederaToken(owner);
    }

    function testInitialSupplyToMsgSender() public view {
        uint256 expected = 1000 * 10 ** token.decimals();
        assertEq(token.balanceOf(address(this)), expected);
    }

    function testMintByOwner() public {
        uint256 amount = 500 * 10 ** token.decimals();
        uint256 prevBalance = token.balanceOf(user);

        vm.prank(owner);
        token.mint(user, amount);

        assertEq(token.balanceOf(user), prevBalance + amount);
    }

    function testMintByNonOwnerFails() public {
        uint256 amount = 100 * 10 ** token.decimals();
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user
            )
        );
        token.mint(user, amount);
    }

    function testTransfer() public {
        uint256 amount = 200 * 10 ** token.decimals();
        token.transfer(user, amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(
            token.balanceOf(address(this)),
            1000 * 10 ** token.decimals() - amount
        );
    }

    function testFuzz_Mint(uint256 value) public {
        value = value % (10 ** 24);
        vm.prank(owner);
        token.mint(user, value);
        assertEq(token.balanceOf(user), value);
    }
}
