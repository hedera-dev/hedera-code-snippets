// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Solidity tests use Foundry (forge-std). Run with `forge test`.
import "forge-std/Test.sol";

import {MyTokenUpgradeable} from "./MyTokenUpgradeable.sol";
import {MyTokenUpgradeableV2} from "./MyTokenUpgradeableV2.sol";
import {OZTransparentUpgradeableProxy} from "./OZTransparentUpgradeableProxy.sol";

contract MyTokenUpgradeable_SolidityTest is Test {
    address internal admin = address(this); // proxy admin
    address internal owner = address(0xA11CE); // token owner
    address internal user = address(0xBEEF);

    MyTokenUpgradeable internal implV1;
    OZTransparentUpgradeableProxy internal proxy;

    function setUp() public {
        // Deploy V1 implementation
        implV1 = new MyTokenUpgradeable();

        // Initialize via proxy (owner = initialOwner)
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address)",
            owner
        );
        proxy = new OZTransparentUpgradeableProxy(
            address(implV1),
            admin,
            initData
        );
    }

    function test_InitializeAndMintThroughProxy() public {
        vm.startPrank(owner);
        MyTokenUpgradeable token = MyTokenUpgradeable(address(proxy));

        assertEq(token.name(), "MyTokenUpgradeable");
        assertEq(token.symbol(), "MTU");

        uint256 tokenId = token.safeMint(owner);
        assertEq(tokenId, 0);
        assertEq(token.ownerOf(0), owner);

        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        MyTokenUpgradeable(address(proxy)).safeMint(user);
        vm.stopPrank();
    }

    function test_UpgradeToV2AndVersion() public {
        // Deploy V2 implementation
        MyTokenUpgradeableV2 implV2 = new MyTokenUpgradeableV2();

        // Perform UUPS upgrade via implementation as the token owner
        vm.prank(owner);
        MyTokenUpgradeable(address(proxy)).upgradeToAndCall(
            address(implV2),
            ""
        );

        // Verify new behavior through the same proxy address
        vm.startPrank(owner);
        MyTokenUpgradeableV2 tokenV2 = MyTokenUpgradeableV2(address(proxy));
        assertEq(tokenV2.version(), "v2");

        // State and minting still work
        tokenV2.safeMint(owner);
        assertEq(tokenV2.ownerOf(0), owner);
        vm.stopPrank();
    }

    function test_NonAdminCannotUpgrade() public {
        // Deploy V2
        MyTokenUpgradeableV2 implV2 = new MyTokenUpgradeableV2();

        // Non-owner tries UUPS upgrade via implementation -> revert (onlyOwner)
        vm.startPrank(user);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        MyTokenUpgradeable(address(proxy)).upgradeToAndCall(
            address(implV2),
            ""
        );
        vm.stopPrank();
    }
}
