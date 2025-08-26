import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get the ContractFactory of your MyTokenAdvanced ERC-721 contract
  const MyTokenAdvanced = await ethers.getContractFactory(
    "MyTokenAdvanced",
    deployer
  );

  // Connect to the deployed contract
  // (REPLACE WITH YOUR CONTRACT ADDRESS)
  const contractAddress = "0x2a35e6532e9e6477205Cc845362EB6e71FcC0F0E";
  const contract = MyTokenAdvanced.attach(contractAddress);

  // Pause the token
  const pauseTx = await contract.pause();
  const receipt = await pauseTx.wait();
  console.log("receipt: ", JSON.stringify(receipt, null, 2));
  console.log("Paused token");

  // Read the paused state
  const pausedState = await contract.paused();
  console.log("Contract paused state is:", pausedState);
}

main().catch(console.error);
