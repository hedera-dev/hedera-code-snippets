import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress = "0x2543aD4C77ebB24a5320F69450888D56c2D2cb96";
  const tokenId = BigInt("1");

  const contract = await ethers.getContractAt(
    "MyHTSTokenKYC",
    contractAddress,
    signer
  );

  const tokenAddress: string = await contract.tokenAddress();
  console.log("HTS ERC721 facade address:", tokenAddress);

  // Minimal ERC721 ABI for approvals and balance
  const erc721 = new ethers.Contract(
    tokenAddress,
    [
      "function approve(address to, uint256 tokenId) external",
      "function getApproved(uint256 tokenId) external view returns (address)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function balanceOf(address owner) external view returns (uint256)"
    ],
    signer
  );

  const ownerOfToken: string = await erc721.ownerOf(tokenId);
  console.log("Current owner of token:", ownerOfToken);

  // Check if already approved for this tokenId; if not, approve MyHTSTokenKYC contract
  const currentApproved: string = await erc721.getApproved(tokenId);
  if (currentApproved.toLowerCase() !== contractAddress.toLowerCase()) {
    console.log(
      `Approving MyHTSTokenKYC contract ${contractAddress} for tokenId ${tokenId.toString()}...`
    );
    const approveTx = (await erc721.approve(
      contractAddress,
      tokenId
    )) as unknown as ContractTransactionResponse;
    await approveTx.wait();
    console.log("Approval tx hash:", approveTx.hash);
  } else {
    console.log("MyHTSTokenKYC contract is already approved for this tokenId.");
  }

  // Burn via MyHTSTokenKYC
  console.log(`Burning tokenId ${tokenId.toString()}...`);
  const burnTx = (await contract.burnNFT(tokenId, {
    gasLimit: 200_000
  })) as unknown as ContractTransactionResponse;
  const burnRcpt = await burnTx.wait();
  console.log("Burn tx hash:", burnTx.hash);
  console.log("Burn tx receipt:", JSON.stringify(burnRcpt, null, 2));

  // Show caller's balance after burn
  const balanceAfter = (await erc721.balanceOf(signer.address)) as bigint;
  console.log("Balance after burn:", balanceAfter.toString(), "NFTs");
}

main().catch(console.error);
