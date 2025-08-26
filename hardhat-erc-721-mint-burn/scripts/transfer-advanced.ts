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

  // Unpause the token
  const unpauseTx = await contract.unpause();
  let receipt = await unpauseTx.wait();
  console.log("receipt - unpauseTx: ", JSON.stringify(receipt, null, 2));
  console.log("Unpaused token");

  // Read the paused state
  const pausedState = await contract.paused();
  console.log("Contract paused state is:", pausedState);

  // Transfer the token with ID 0
  const transferTx = await contract.transferFrom(
    deployer.address,
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    0
  );
  receipt = await transferTx.wait();
  console.log("receipt - transferTx: ", JSON.stringify(receipt, null, 2));

  // Check the balance of the token
  const balance = await contract.balanceOf(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
