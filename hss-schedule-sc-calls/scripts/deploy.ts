import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // Deploy the AlarmClockSimple contract with initial HBAR funding
  const AlarmClockSimple = await ethers.getContractFactory(
    "AlarmClockSimple",
    deployer
  );

  // Send 5 HBAR to the contract during deployment
  // This HBAR will be used to pay for scheduled alarm executions
  const HBAR_TO_SEND = "5";
  console.log(
    `Deploying with ${HBAR_TO_SEND} HBAR to fund scheduled executions... `
  );

  const contract = await AlarmClockSimple.deploy({
    value: ethers.parseEther(HBAR_TO_SEND)
  });
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("AlarmClockSimple contract deployed at:", contractAddress);

  // Get the contract balance to verify funding
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract HBAR balance:", ethers.formatEther(balance), "HBAR");
}

main().catch(console.error);
