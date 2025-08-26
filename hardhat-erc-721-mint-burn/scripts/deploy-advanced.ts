import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "testnet"
});

async function main() {
  // Get the signer of the tx and address for minting the token
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // The deployer will also be the owner of our NFT contract
  const MyTokenAdvanced = await ethers.getContractFactory(
    "MyTokenAdvanced",
    deployer
  );
  const contract = await MyTokenAdvanced.deploy(
    deployer.address,
    deployer.address,
    deployer.address
  ); // Deployer account gets all roles

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed at:", address);
}

main().catch(console.error);
