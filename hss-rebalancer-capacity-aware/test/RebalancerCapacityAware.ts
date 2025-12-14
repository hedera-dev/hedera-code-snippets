import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

describe("RebalancerCapacityAware", function () {
  let rebalancer: any;
  let deployer: any;
  let user: any;
  let contractAddress: string;

  // Helper function to poll for a condition with timeout
  async function waitForCondition(
    checkFn: () => Promise<boolean>,
    timeoutMs: number = 30000,
    pollIntervalMs: number = 2000
  ): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await checkFn()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`);
  }

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    user = signers[1] || signers[0];

    console.log("Deployer:", deployer.address);
    console.log("User:", user.address);

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

    const tx = (await rebalancerAsUser.startRebalancing(
      intervalSeconds
    )) as unknown as ContractTransactionResponse;
    const receipt = await tx.wait();

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
    await waitForCondition(
      async () => {
        const config = await rebalancer.config();
        return config.rebalanceCount >= 1n;
      },
      30000,
      2000
    );

    const config = await rebalancer.config();
    expect(config.rebalanceCount).to.be.gte(1n);
  });

  it("should wait for multiple rebalance executions", async function () {
    const configBefore = await rebalancer.config();
    const countBefore = configBefore.rebalanceCount;

    await waitForCondition(
      async () => {
        const config = await rebalancer.config();
        return config.rebalanceCount > countBefore;
      },
      30000,
      2000
    );

    const configAfter = await rebalancer.config();
    const countAfter = configAfter.rebalanceCount;

    expect(countAfter).to.be.gt(countBefore);
  });

  it("should stop rebalancing and cancel pending schedule", async function () {
    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    const configBefore = await rebalancer.config();
    expect(configBefore.active).to.equal(true);

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
  });

  it("should be able to restart rebalancing with new interval", async function () {
    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    const newInterval = 20;

    const tx = (await rebalancerAsUser.startRebalancing(
      newInterval
    )) as unknown as ContractTransactionResponse;
    await tx.wait();

    const config = await rebalancer.config();
    expect(config.active).to.equal(true);
    expect(config.intervalSeconds).to.equal(BigInt(newInterval));
    expect(config.lastScheduleAddress).to.not.equal(ethers.ZeroAddress);

    // Stop it again for cleanup
    await rebalancerAsUser.stopRebalancing();
  });

  it("should reject zero interval", async function () {
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
    const rebalancerAsUser = await ethers.getContractAt(
      "RebalancerCapacityAware",
      contractAddress,
      user
    );

    // Start
    await rebalancerAsUser.startRebalancing(15);

    // Try to start again
    await expect(rebalancerAsUser.startRebalancing(20)).to.be.revertedWith(
      "already active"
    );

    // Cleanup
    await rebalancerAsUser.stopRebalancing();
  });
});
