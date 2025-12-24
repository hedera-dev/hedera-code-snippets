import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress =
    process.env.CONTRACT_ADDRESS || "<your-deployed-contract-address>";
  const alarmClockContract = await ethers.getContractAt(
    "AlarmClockSimple",
    contractAddress,
    signer
  );

  // Set a recurring alarm that fires every 10 seconds
  const recurring = true;
  const intervalSeconds = 10;

  console.log(
    `Setting recurring alarm to fire every ${intervalSeconds} seconds...`
  );
  const tx = await alarmClockContract.setAlarm(recurring, intervalSeconds);
  await tx.wait();
  console.log("setAlarm tx hash:", tx.hash);

  // Get the alarm ID
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
  console.log("  Interval:", alarm.interval.toString(), "seconds");
  console.log("  Times triggered:", alarm.numTimesTriggered.toString());

  // Check contract balance
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("\nContract HBAR balance:", ethers.formatEther(balance), "HBAR");

  console.log("\n✅ Recurring alarm scheduled!");
  console.log(
    `⏰ It will trigger every ${intervalSeconds} seconds automatically`
  );
  console.log(
    `⚠️  Make sure the contract has enough HBAR to pay for scheduled executions`
  );
  console.log(
    `📊 View events at: https://hashscan.io/testnet/contract/${contractAddress}/events`
  );
}

main().catch(console.error);
