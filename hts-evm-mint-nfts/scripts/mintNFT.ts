import { ContractTransactionResponse } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress = "0xE93E01fEe6Aaf79302bb92c76cD5ee8FE88371Ff";
  const recipient = signer.address;

  const contract = await ethers.getContractAt(
    "MyHTSToken",
    contractAddress,
    signer
  );

  // Display the underlying HTS token address
  const tokenAddress = await contract.tokenAddress();
  console.log("HTS ERC721 facade address:", tokenAddress);

  // Create metadata for the NFT (must be <= 100 bytes)
  const metadata = ethers.hexlify(
    ethers.toUtf8Bytes(
      "ipfs://bafkreibr7cyxmy4iyckmlyzige4ywccyygomwrcn4ldcldacw3nxe3ikgq"
    )
  );
  const byteLen = ethers.getBytes(metadata).length;
  if (byteLen > 100) {
    throw new Error(
      `Metadata is ${byteLen} bytes; must be <= 100 bytes for HTS`
    );
  }

  console.log(`Minting NFT to ${recipient} with metadata: ${metadata} ...`);
  const tx = (await contract.mintNFT(recipient, metadata, {
    gasLimit: 350_000
  })) as unknown as ContractTransactionResponse;

  const rcpt = await tx.wait();
  console.log("Mint tx hash:", tx.hash);
  console.log("Mint tx receipt:", JSON.stringify(rcpt, null, 2));

  // Check recipient's NFT balance on the ERC721 facade (not on MyHTSToken)
  const erc721 = new ethers.Contract(
    tokenAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    signer
  );
  const balance = (await erc721.balanceOf(recipient)) as bigint;
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
