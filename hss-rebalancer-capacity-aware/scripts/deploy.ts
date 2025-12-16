import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const RebalancerCapacityAware = await ethers.getContractFactory(
    "RebalancerCapacityAware",
    deployer
  );

  // Fund with 10 HBAR for multiple rebalancing operations
  const HBAR_TO_SEND = "10";
  console.log(
    `Deploying with ${HBAR_TO_SEND} HBAR for rebalancing operations... `
  );

  const contract = await RebalancerCapacityAware.deploy({
    value: ethers.parseEther(HBAR_TO_SEND)
  });
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("RebalancerCapacityAware deployed at:", contractAddress);

  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract HBAR balance:", ethers.formatEther(balance), "HBAR");

  // Display initial config
  const config = await contract.config();
  console.log("\nInitial Config:");
  console.log("  Active:", config.active);
  console.log("  Rebalance Count:", config.rebalanceCount.toString());
}

main().catch(console.error);
