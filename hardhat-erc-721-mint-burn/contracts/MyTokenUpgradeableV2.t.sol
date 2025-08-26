// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Solidity tests use Foundry (forge-std). Run with `forge test`.
import "forge-std/Test.sol";

import {MyTokenUpgradeable} from "./MyTokenUpgradeable.sol";
import {MyTokenUpgradeableV2} from "./MyTokenUpgradeableV2.sol";
import {OZTransparentUpgradeableProxy} from "./OZTransparentUpgradeableProxy.sol";

contract MyTokenUpgradeableV2_SolidityTest is Test {
    address internal admin = address(this); // proxy admin
    address internal owner = address(0xA11CE); // token owner

    MyTokenUpgradeable internal implV1;
    OZTransparentUpgradeableProxy internal proxy;

    function setUp() public {
        // Deploy V1 and proxy
        implV1 = new MyTokenUpgradeable();
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address)",
            owner
        );
        proxy = new OZTransparentUpgradeableProxy(
            address(implV1),
            admin,
            initData
        );

        // Upgrade to V2 via UUPS as the token owner (not the proxy admin)
        MyTokenUpgradeableV2 implV2 = new MyTokenUpgradeableV2();
        vm.prank(owner);
        MyTokenUpgradeable(address(proxy)).upgradeToAndCall(
            address(implV2),
            ""
        );
    }

    function test_VersionFunctionAfterUpgrade() public {
        vm.prank(owner);
        string memory v = MyTokenUpgradeableV2(address(proxy)).version();
        assertEq(v, "v2");
    }

    function test_MintStillWorksAndStateIsConsistent() public {
        vm.startPrank(owner);
        MyTokenUpgradeableV2 token = MyTokenUpgradeableV2(address(proxy));
        token.safeMint(owner);
        token.safeMint(owner);
        assertEq(token.ownerOf(0), owner);
        assertEq(token.ownerOf(1), owner);
        vm.stopPrank();
    }
}
