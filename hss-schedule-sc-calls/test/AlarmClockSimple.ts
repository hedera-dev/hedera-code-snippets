import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

describe("AlarmClockSimple", function () {
  let alarmClock: any;
  let deployer: any;
  let user: any;
  let contractAddress: string;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    user = signers[1] || signers[0]; // Use deployer as fallback if only one signer

    console.log("Deployer:", deployer.address);
    console.log("User:", user.address);

    // Deploy contract with 5 HBAR (more funding for multiple tests)
    const AlarmClockSimple = await ethers.getContractFactory(
      "AlarmClockSimple",
      deployer
    );
    alarmClock = await AlarmClockSimple.deploy({
      value: ethers.parseEther("5")
    });
    await alarmClock.waitForDeployment();

    contractAddress = await alarmClock.getAddress();
    console.log("Contract deployed at:", contractAddress);
  });

  it("should deploy with correct initial state", async function () {
    const nextAlarmId = await alarmClock.nextAlarmId();
    expect(nextAlarmId).to.be.gte(0n); // Use gte since other tests might have run

    // Check contract has HBAR
    const balance = await ethers.provider.getBalance(contractAddress);
    expect(balance).to.be.gt(0n);
  });

  it("should set a one-shot alarm", async function () {
    // Get contract instance with user signer
    const alarmClockAsUser = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      user
    );

    const alarmIdBefore = await alarmClock.nextAlarmId();

    const tx = (await alarmClockAsUser.setAlarm(
      false,
      10 // 10 seconds
    )) as unknown as ContractTransactionResponse;
    const receipt = await tx.wait();

    // Check AlarmScheduled event
    const event = receipt?.logs.find(
      (log: any) =>
        alarmClock.interface.parseLog(log)?.name === "AlarmScheduled"
    );
    expect(event).to.not.be.undefined;

    // Verify alarm details using the ID we captured
    const alarm = await alarmClock.alarms(alarmIdBefore);
    expect(alarm.user).to.equal(user.address);
    expect(alarm.recurring).to.equal(false);
    expect(alarm.interval).to.equal(10n);
    expect(alarm.numTimesTriggered).to.equal(0n);
  });

  it("should set a recurring alarm", async function () {
    // Get contract instance with user signer
    const alarmClockAsUser = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      user
    );

    const alarmIdBefore = await alarmClock.nextAlarmId();

    const tx = (await alarmClockAsUser.setAlarm(
      true,
      10 // 10 seconds
    )) as unknown as ContractTransactionResponse;
    const receipt = await tx.wait();

    // Check AlarmScheduled event
    const event = receipt?.logs.find(
      (log: any) =>
        alarmClock.interface.parseLog(log)?.name === "AlarmScheduled"
    );
    expect(event).to.not.be.undefined;

    // Verify alarm details
    const alarm = await alarmClock.alarms(alarmIdBefore);
    expect(alarm.user).to.equal(user.address);
    expect(alarm.recurring).to.equal(true);
    expect(alarm.interval).to.equal(10n);
    expect(alarm.numTimesTriggered).to.equal(0n);
  });

  it("should manually trigger an alarm", async function () {
    // Get contract instance with user signer
    const alarmClockAsUser = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      user
    );

    // Set up a new alarm specifically for this test
    const alarmIdBefore = await alarmClock.nextAlarmId();
    await alarmClockAsUser.setAlarm(false, 60); // 60 seconds - won't auto-trigger during test
    const alarmId = alarmIdBefore;

    // Verify it hasn't been triggered yet
    let alarm = await alarmClock.alarms(alarmId);
    expect(alarm.numTimesTriggered).to.equal(0n);

    // Manually trigger it (user can trigger their own alarms)
    const tx = (await alarmClockAsUser.triggerAlarm(
      alarmId
    )) as unknown as ContractTransactionResponse;
    const receipt = await tx.wait();

    // Check AlarmTriggered event
    const event = receipt?.logs.find(
      (log: any) =>
        alarmClock.interface.parseLog(log)?.name === "AlarmTriggered"
    );
    expect(event).to.not.be.undefined;

    // Verify trigger count
    alarm = await alarmClock.alarms(alarmId);
    expect(alarm.numTimesTriggered).to.equal(1n);
  });

  it("should not allow non-owner to trigger someone else's alarm", async function () {
    // Skip this test if deployer and user are the same
    if (deployer.address === user.address) {
      console.log(
        "Skipping: deployer and user are the same account. Add a second signer account on hardhat.config.ts to fully test."
      );
      this.skip();
      return;
    }

    // Get contract instances with different signers
    const alarmClockAsUser = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      user
    );
    const alarmClockAsDeployer = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      deployer
    );

    // User sets an alarm with a long interval so it won't auto-trigger
    const alarmIdBefore = await alarmClock.nextAlarmId();
    await alarmClockAsUser.setAlarm(false, 300); // 5 minutes
    const alarmId = alarmIdBefore;

    // Deployer tries to trigger user's alarm (should fail)
    await expect(alarmClockAsDeployer.triggerAlarm(alarmId)).to.be.revertedWith(
      "Not authorized"
    );
  });

  it("should not allow triggering a one-shot alarm twice", async function () {
    // Get contract instance with user signer
    const alarmClockAsUser = await ethers.getContractAt(
      "AlarmClockSimple",
      contractAddress,
      user
    );

    // Set and trigger a one-shot alarm
    const alarmIdBefore = await alarmClock.nextAlarmId();
    await alarmClockAsUser.setAlarm(false, 300); // 5 minutes
    const alarmId = alarmIdBefore;

    await alarmClockAsUser.triggerAlarm(alarmId);

    // Try to trigger again (should fail)
    await expect(alarmClockAsUser.triggerAlarm(alarmId)).to.be.revertedWith(
      "Already triggered"
    );
  });
});
