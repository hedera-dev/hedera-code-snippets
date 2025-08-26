import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get the ContractFactory of your MyToken ERC-721 contract
  const MyToken = await ethers.getContractFactory("MyToken", deployer);

  // Connect to the deployed contract
  // (REPLACE WITH YOUR CONTRACT ADDRESS)
  const contractAddress = "0x00f2753A689C3bdd1a733430c7b63A3993B1eFBc";
  const contract = MyToken.attach(contractAddress);

  // Burn the token
  const burnTx = await contract.burn(2);
  const receipt = await burnTx.wait();
  console.log("receipt: ", JSON.stringify(receipt, null, 2));
  const burnedTokenId = receipt?.logs[0].topics[3];
  console.log("Burned token with ID:", burnedTokenId);

  // Check the balance of the token
  const balance = await contract.balanceOf(deployer.address);
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
