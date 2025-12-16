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

  // Start rebalancing with 15-second intervals
  const intervalSeconds = 15;
  console.log(`\nStarting rebalancing with ${intervalSeconds}s intervals...`);

  const tx = await rebalancer.startRebalancing(intervalSeconds);
  const receipt = await tx.wait();
  console.log("Transaction hash:", tx.hash);

  // Parse RebalancingStarted event
  const event = receipt?.logs.find(
    (log: any) =>
      rebalancer.interface.parseLog(log)?.name === "RebalancingStarted"
  );

  if (event) {
    const parsed = rebalancer.interface.parseLog(event);
    console.log("\n✅ Rebalancing Started!");
    console.log(
      "  Interval:",
      parsed?.args.intervalSeconds.toString(),
      "seconds"
    );
    console.log(
      "  First scheduled at:",
      new Date(Number(parsed?.args.firstScheduledAt) * 1000).toISOString()
    );
  }

  // Display current config
  const config = await rebalancer.config();
  console.log("\nCurrent Config:");
  console.log("  Active:", config.active);
  console.log("  Interval:", config.intervalSeconds.toString(), "seconds");
  console.log("  Rebalance Count:", config.rebalanceCount.toString());
  console.log(
    "  Last Schedule Address:",
    config.lastScheduleAddress !== ethers.ZeroAddress
      ? config.lastScheduleAddress
      : "None"
  );

  console.log(
    `\n📊 Monitor events at: https://hashscan.io/testnet/contract/${contractAddress}/events`
  );
  console.log(
    `⏰ Rebalancing will execute automatically every ~${intervalSeconds} seconds`
  );
}

main().catch(console.error);
