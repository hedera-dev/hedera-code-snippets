import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // 1) Deploy the PFWD wrapper contract
  const MyHTSTokenPFWD = await ethers.getContractFactory(
    "MyHTSTokenPFWD",
    deployer
  );
  const contract = await MyHTSTokenPFWD.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("MyHTSTokenPFWD contract deployed at:", contractAddress);

  // 2) Create the HTS NFT collection by calling createNFTCollection()
  const NAME = "MyHTSTokenPFWDCollection";
  const SYMBOL = "MHTPFWD";
  const HBAR_TO_SEND = "15"; // HBAR to send with createNFTCollection()

  console.log(
    `Calling createNFTCollection() with ${HBAR_TO_SEND} HBAR to create the HTS collection...`
  );
  const tx = await contract.createNFTCollection(NAME, SYMBOL, {
    gasLimit: 350_000,
    value: ethers.parseEther(HBAR_TO_SEND)
  });
  const rcpt = await tx.wait();
  console.log(
    "createNFTCollection() tx receipt:",
    JSON.stringify(rcpt, null, 2)
  );

  // 3) Read the created HTS token address (ERC721 facade)
  const tokenAddress = await contract.tokenAddress();
  console.log(
    "Underlying HTS NFT Collection (ERC721 facade) address:",
    tokenAddress
  );
}

main().catch(console.error);
