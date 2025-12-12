import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

describe("RebalancerCapacityAware", function () {
  let rebalancer: any;
  let deployer: any;
  let user: any;
  let contractAddress: string;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    user = signers[1] || signers[0]; // Use deployer as fallback if only one signer

    console.log("Deployer:", deployer.address);
    console.log("User:", user.address);

    // Deploy contract with 10 HBAR
    const RebalancerCapacityAware = await ethers.getContractFactory(
      "RebalancerCapacityAware",
      deployer
    );
    rebalancer = await RebalancerCapacityAware.deploy({
      value: ethers.parseEther("10")
    });
    await rebalancer.waitForDeployment();

    contractAddress = await rebalancer.getAddress();
    console.log("Contract deployed at:", contractAddress);

    // Add delay after deployment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  it("should deploy with correct initial state", async function () {
    const config = await rebalancer.config();

    expect(config.active).to.equal(false);
    expect(config.intervalSeconds).to.equal(0n);
    expect(config.rebalanceCount).to.equal(0n);
    expect(config.lastScheduleAddress).to.equal(ethers.ZeroAddress);

    const balance = await ethers.provider.getBalance(contractAddress);
    expect(balance).to.be.gt(0n);
  });

  it("should start rebalancing with capacity-aware scheduling", async function () {
    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    const intervalSeconds = 15;

    console.log("  Starting rebalancing.. .");
    const tx = (await rebalancerAsUser.startRebalancing(
      intervalSeconds
    )) as unknown as ContractTransactionResponse;

    console.log("  Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("  Transaction confirmed:", tx.hash);

    // Check RebalancingStarted event
    const startedEvent = receipt?.logs.find(
      (log: any) =>
        rebalancer.interface.parseLog(log)?.name === "RebalancingStarted"
    );
    expect(startedEvent).to.not.be.undefined;

    const parsedStarted = rebalancer.interface.parseLog(startedEvent);
    expect(parsedStarted?.args.intervalSeconds).to.equal(
      BigInt(intervalSeconds)
    );

    // Check RebalanceScheduled event
    const scheduledEvent = receipt?.logs.find(
      (log: any) =>
        rebalancer.interface.parseLog(log)?.name === "RebalanceScheduled"
    );
    expect(scheduledEvent).to.not.be.undefined;

    const parsedScheduled = rebalancer.interface.parseLog(scheduledEvent);
    expect(parsedScheduled?.args.scheduleAddress).to.not.equal(
      ethers.ZeroAddress
    );

    // Verify config
    const config = await rebalancer.config();
    expect(config.active).to.equal(true);
    expect(config.intervalSeconds).to.equal(BigInt(intervalSeconds));
    expect(config.rebalanceCount).to.equal(0n);
    expect(config.lastScheduleAddress).to.not.equal(ethers.ZeroAddress);
  });

  it("should wait for first rebalance execution", async function () {
    // Wait 20 seconds for the first rebalance to execute (15s interval + buffer)
    console.log("  Waiting 20 seconds for first scheduled rebalance...");
    await new Promise((resolve) => setTimeout(resolve, 20000));

    const config = await rebalancer.config();

    // The rebalance should have executed at least once
    expect(config.rebalanceCount).to.be.gte(1n);
    console.log("  Rebalances executed:", config.rebalanceCount.toString());
  });

  it("should wait for multiple rebalance executions", async function () {
    const configBefore = await rebalancer.config();
    const countBefore = configBefore.rebalanceCount;

    // Wait another 20 seconds for more rebalances
    console.log("  Waiting 20 more seconds for additional rebalances...");
    await new Promise((resolve) => setTimeout(resolve, 20000));

    const configAfter = await rebalancer.config();
    const countAfter = configAfter.rebalanceCount;

    // Should have executed at least one more rebalance
    expect(countAfter).to.be.gt(countBefore);
    console.log(`  Rebalances increased from ${countBefore} to ${countAfter}`);
  });

  it("should stop rebalancing and cancel pending schedule", async function () {
    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    const configBefore = await rebalancer.config();
    expect(configBefore.active).to.equal(true);

    console.log("  Stopping rebalancing...");
    const tx =
      (await rebalancerAsUser.stopRebalancing()) as unknown as ContractTransactionResponse;
    const receipt = await tx.wait();

    // Check RebalancingStopped event
    const event = receipt?.logs.find(
      (log: any) =>
        rebalancer.interface.parseLog(log)?.name === "RebalancingStopped"
    );
    expect(event).to.not.be.undefined;

    // Verify config
    const configAfter = await rebalancer.config();
    expect(configAfter.active).to.equal(false);
    expect(configAfter.lastScheduleAddress).to.equal(ethers.ZeroAddress);

    console.log(
      "  Final rebalance count:",
      configAfter.rebalanceCount.toString()
    );
  });

  it("should not rebalance after being stopped", async function () {
    const configBefore = await rebalancer.config();
    const countBefore = configBefore.rebalanceCount;

    // Wait 20 seconds
    console.log("  Waiting 20 seconds to confirm no new rebalances...");
    await new Promise((resolve) => setTimeout(resolve, 20000));

    const configAfter = await rebalancer.config();
    const countAfter = configAfter.rebalanceCount;

    // Count should not increase (or at most by 1 if a scheduled tx was already in flight)
    expect(countAfter).to.be.lte(countBefore + 1n);
    console.log(
      `  Rebalance count remained at ${countAfter} (was ${countBefore})`
    );
  });

  it("should be able to restart rebalancing with new interval", async function () {
    // Add delay before restart to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    const newInterval = 20;

    console.log("  Restarting with new interval.. .");
    const tx = (await rebalancerAsUser.startRebalancing(
      newInterval
    )) as unknown as ContractTransactionResponse;
    await tx.wait();

    const config = await rebalancer.config();
    expect(config.active).to.equal(true);
    expect(config.intervalSeconds).to.equal(BigInt(newInterval));
    expect(config.lastScheduleAddress).to.not.equal(ethers.ZeroAddress);

    console.log("  Restarted with", newInterval, "second interval");

    // Add delay before stopping
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Stop it again for cleanup
    await rebalancerAsUser.stopRebalancing();
  });

  it("should reject zero interval", async function () {
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    await expect(rebalancerAsUser.startRebalancing(0)).to.be.revertedWith(
      "interval must be > 0"
    );
  });

  it("should reject starting when already active", async function () {
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    // Start
    console.log("  Starting rebalancing...");
    const tx1 = await rebalancerAsUser.startRebalancing(15);
    await tx1.wait();

    // Add delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try to start again - should fail
    console.log("  Attempting to start again (should fail)...");
    await expect(rebalancerAsUser.startRebalancing(20)).to.be.revertedWith(
      "already active"
    );

    // Cleanup - add delay before stopping
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("  Cleaning up...");
    await rebalancerAsUser.stopRebalancing();
  });
});
