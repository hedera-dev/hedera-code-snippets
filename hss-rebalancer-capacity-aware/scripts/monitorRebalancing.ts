import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const contractAddress = "0x2d8E63dE36eD12670E65FCf501e4a084562CF6ea"; // Replace with your deployed address
  const rebalancer = await ethers.getContractAt(
    "RebalancerCapacityAware",
    contractAddress
  );

  console.log("Monitoring Rebalancer:", contractAddress);
  console.log("Press Ctrl+C to stop\n");

  // Display current state
  async function displayState() {
    const config = await rebalancer.config();
    const balance = await ethers.provider.getBalance(contractAddress);

    console.log(`[${new Date().toISOString()}]`);
    console.log("  Active:", config.active);
    console.log("  Rebalance Count:", config.rebalanceCount.toString());
    console.log(
      "  Last Rebalance:",
      config.lastRebalanceTime > 0
        ? new Date(Number(config.lastRebalanceTime) * 1000).toISOString()
        : "Never"
    );
    console.log("  Contract Balance:", ethers.formatEther(balance), "HBAR");
    console.log("  Interval:", config.intervalSeconds.toString(), "seconds");
    console.log("---");
  }

  // Initial display
  await displayState();

  // Poll every 5 seconds
  setInterval(async () => {
    await displayState();
  }, 5000);
}

main().catch(console.error);
