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

  // Mint a token to ourselves
  const mintTx = await contract.safeMint(
    deployer.address,
    "https://myserver.com/8bitbeard/8bitbeard-tokens/tokens/1"
  );
  const receipt = await mintTx.wait();
  console.log("receipt: ", JSON.stringify(receipt, null, 2));
  const mintedTokenId = receipt?.logs[0].topics[3];
  console.log("Minted token ID:", mintedTokenId);

  // Check the balance of the token
  const balance = await contract.balanceOf(deployer.address);
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
