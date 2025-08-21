import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

const PROXY_ADDRESS = "0x5A69d6fFcd27A4D253B2197A95D8488879Dd8ab5";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Upgrader (must be proxy admin EOA):", signer.address);
  console.log("Proxy:", PROXY_ADDRESS);

  // 1) Deploy the new implementation (V2)
  const V2 = await ethers.getContractFactory("MyTokenUpgradeableV2", signer);
  const newImpl = await V2.deploy();
  await newImpl.waitForDeployment();
  const newImplAddress = await newImpl.getAddress();
  console.log("New implementation:", newImplAddress);

  // 2) Upgrade directly via proxy (EOA admin path)
  // Transparent proxy exposes upgradeToAndCall(newImpl, data) to the admin EOA
  const proxyIface = new ethers.Interface([
    "function upgradeToAndCall(address newImplementation, bytes data)"
  ]);
  const data = proxyIface.encodeFunctionData("upgradeToAndCall", [
    newImplAddress,
    "0x" // no initializer
  ]);

  const tx = await signer.sendTransaction({
    to: PROXY_ADDRESS,
    data
  });
  const receipt = await tx.wait();
  console.log("Upgrade tx status:", receipt?.status);

  const proxyAsV2 = V2.attach(PROXY_ADDRESS);
  console.log("version():", await proxyAsV2.version());
}

main().catch(console.error);
