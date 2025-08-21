import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hedera"
});

async function main(): Promise<void> {
  // Get the signer of the tx and address for minting the token
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Counter = await ethers.getContractFactory("Counter", deployer);
  const contract = await Counter.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed at:", address);
}

main().catch(console.error);
