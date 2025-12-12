import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress = "0x76CFE47809A84e62D633562c350e775e0dB7E1bF"; // Replace with your deployed contract address
  const alarmClockContract = await ethers.getContractAt(
    "AlarmClockSimple",
    contractAddress,
    signer
  );

  // Set a one-shot alarm that fires in 10 seconds
  const recurring = false;
  const intervalSeconds = 10;

  console.log(
    `Setting one-shot alarm to fire in ${intervalSeconds} seconds... `
  );
  const tx = await alarmClockContract.setAlarm(recurring, intervalSeconds);
  await tx.wait();
  console.log("setAlarm tx hash:", tx.hash);

  // Get the alarm ID (it's the nextAlarmId - 1 after our call)
  const nextAlarmId = await alarmClockContract.nextAlarmId();
  const alarmId = nextAlarmId - BigInt(1);
  console.log("Alarm ID:", alarmId.toString());

  // Retrieve alarm details
  const alarm = await alarmClockContract.alarms(alarmId);
  console.log("\nAlarm Details:");
  console.log("  User:", alarm.user);
  console.log(
    "  Scheduled time:",
    new Date(Number(alarm.time) * 1000).toISOString()
  );
  console.log("  Recurring:", alarm.recurring);
  console.log("  Times triggered:", alarm.numTimesTriggered.toString());

  console.log("\n✅ One-shot alarm scheduled!");
  console.log(
    `⏰ It will automatically trigger in ~${intervalSeconds} seconds`
  );
  console.log(
    `📊 View events at: https://hashscan.io/testnet/contract/${contractAddress}/events`
  );
}

main().catch(console.error);
