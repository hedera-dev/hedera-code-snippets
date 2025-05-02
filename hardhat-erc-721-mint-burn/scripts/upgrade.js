const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Upgrading contract with the account:", deployer.address);

  const MyTokenUpgradeableV2 = await ethers.getContractFactory(
    "MyTokenUpgradeableV2"
  );

  // REPLACE with your deployed proxy contract address
  const proxyAddress = "0xb54c97235A7a90004fEb89dDccd68f36066fea8c";

  const upgraded = await upgrades.upgradeProxy(
    proxyAddress,
    MyTokenUpgradeableV2
  );
  await upgraded.waitForDeployment();

  console.log(
    "Contract successfully upgraded at:",
    await upgraded.getAddress()
  );

  // Verify the upgrade by calling the new version() function
  const contractVersion = await upgraded.version();
  console.log("Contract version after upgrade:", contractVersion);
}

main().catch(console.error);
