import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // 1) Deploy implementation (V1)
  const Impl = await ethers.getContractFactory("MyTokenUpgradeable", deployer);
  const implementation = await Impl.deploy();
  await implementation.waitForDeployment();
  const implementationAddress = await implementation.getAddress();
  console.log("Implementation:", implementationAddress);

  // 2) Encode initializer
  const initData = Impl.interface.encodeFunctionData("initialize", [
    deployer.address
  ]);

  // 3) Deploy Transparent proxy with EOA admin (your deployer)
  // Requires wrapper contract OZTransparentUpgradeableProxy in your repo
  const TransparentProxy = await ethers.getContractFactory(
    "OZTransparentUpgradeableProxy",
    deployer
  );
  const proxy = await TransparentProxy.deploy(
    implementationAddress,
    deployer.address, // admin = EOA
    initData
  );
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("Proxy address:", proxyAddress);

  // 4) Sanity check via proxy
  const token = Impl.attach(proxyAddress);
  console.log("Name/Symbol:", await token.name(), "/", await token.symbol());
  const mintTx = await token.safeMint(deployer.address);
  await mintTx.wait();
  console.log("Minted token 0. Owner:", await token.ownerOf(0n));

  // 6) Output env var for upgrade step
  console.log("\nPROXY_ADDRESS:", proxyAddress);
}

main().catch(console.error);
