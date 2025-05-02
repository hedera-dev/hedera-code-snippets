const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MyTokenUpgradeable");
  const token = await upgrades.deployProxy(Token, [deployer.address], { initializer: "initialize" });
  await token.waitForDeployment();

  console.log("Upgradeable ERC721 deployed to:", await token.getAddress());
}

main().catch(console.error);
