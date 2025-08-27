import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // 1) Deploy the wrapper contract
  // The deployer will also be the owner of our NFT contract
  const MyHTSToken = await ethers.getContractFactory("MyHTSToken", deployer);
  const contract = await MyHTSToken.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("MyHTSToken contract deployed at:", contractAddress);

  // 2) Create the HTS NFT collection by calling createNFTCollection()
  //    NOTE: createNFTCollection() must be payable to accept this value.
  const NAME = "MyHTSTokenNFTCollection";
  const SYMBOL = "MHT";
  const HBAR_TO_SEND = "15"; // HBAR to send with createNFTCollection()
  console.log(
    `Calling createNFTCollection() with ${HBAR_TO_SEND} HBAR to create the HTS collection...`
  );
  const tx = await contract.createNFTCollection(NAME, SYMBOL, {
    gasLimit: 250_000,
    value: ethers.parseEther(HBAR_TO_SEND)
  });
  const rcpt = await tx.wait();
  console.log(
    "createNFTCollection() tx receipt:",
    JSON.stringify(rcpt, null, 2)
  );

  // 3) Read the created HTS token address
  const tokenAddress = await contract.tokenAddress();
  console.log(
    "Underlying HTS NFT Collection (ERC721 facade) address:",
    tokenAddress
  );
}

main().catch(console.error);
