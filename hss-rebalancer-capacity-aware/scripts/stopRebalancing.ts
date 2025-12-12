import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress = "0x2d8E63dE36eD12670E65FCf501e4a084562CF6ea"; // Replace with your deployed address
  const rebalancer = await ethers.getContractAt(
    "RebalancerCapacityAware",
    contractAddress,
    signer
  );

  // Check current state
  const configBefore = await rebalancer.config();
  console.log("\nBefore Stopping:");
  console.log("  Active:", configBefore.active);
  console.log("  Rebalance Count:", configBefore.rebalanceCount.toString());
  console.log("  Pending Schedule:", configBefore.lastScheduleAddress);

  // Stop rebalancing
  console.log("\nStopping rebalancing...");
  const tx = await rebalancer.stopRebalancing();
  await tx.wait();
  console.log("Transaction hash:", tx.hash);

  // Check new state
  const configAfter = await rebalancer.config();
  console.log("\nAfter Stopping:");
  console.log("  Active:", configAfter.active);
  console.log("  Rebalance Count:", configAfter.rebalanceCount.toString());
  console.log("  Pending Schedule:", configAfter.lastScheduleAddress);

  console.log("\n✅ Rebalancing stopped!");
  console.log(
    "  Total rebalances executed:",
    configAfter.rebalanceCount.toString()
  );
}

main().catch(console.error);
