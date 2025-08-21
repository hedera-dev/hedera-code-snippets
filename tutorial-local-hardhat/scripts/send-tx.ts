import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hedera"
});

console.log("Sending transaction on Hedera network");

const [sender] = await ethers.getSigners();

console.log("Sending 10_000_000_000 wei from", sender.address, "to itself");

console.log("Sending transaction");
const tx = await sender.sendTransaction({
  to: sender.address,
  value: 10_000_000_000n
});

await tx.wait();

console.log("Transaction sent successfully");
