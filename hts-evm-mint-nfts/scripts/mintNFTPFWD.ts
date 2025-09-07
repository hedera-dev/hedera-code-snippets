import { ContractTransactionResponse } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Replace with your deployed MyHTSTokenPFWD contract address
  const contractAddress = "0xed86d9Ba0bbCd429266276331B8298718f9DD755";
  const recipient = signer.address;

  const contract = await ethers.getContractAt(
    "MyHTSTokenPFWD",
    contractAddress,
    signer
  );

  // Display the underlying HTS token address
  const tokenAddress = await contract.tokenAddress();
  console.log("HTS ERC721 facade address:", tokenAddress);

  // 1) Associate the signer via token.associate() (EOA -> token contract), fully on-chain (no SDK)
  // If already associated, this may revert depending on node behavior; ignore in that case.
  const tokenAssociateAbi = ["function associate()"];
  const token = new ethers.Contract(tokenAddress, tokenAssociateAbi, signer);
  try {
    console.log("Associating signer to token via token.associate() ...");
    const assocTx = await token.associate({ gasLimit: 800_000 });
    await assocTx.wait();
    console.log("Associate tx hash:", assocTx.hash);
  } catch (e: any) {
    console.log(
      "Associate call skipped/ignored (possibly already associated):",
      e?.message || e
    );
  }

  // 2) Prepare metadata (<= 100 bytes)
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

  // 3) Mint to recipient via PFWD wrapper
  console.log(`Minting NFT to ${recipient} with metadata: ${metadata} ...`);
  const tx = (await contract.mintNFT(recipient, metadata, {
    gasLimit: 400_000
  })) as unknown as ContractTransactionResponse;

  const rcpt = await tx.wait();
  console.log("Mint tx hash:", tx.hash);
  console.log("Mint tx receipt:", JSON.stringify(rcpt, null, 2));

  // Check recipient's NFT balance on the ERC721 facade (not on MyHTSTokenPFWD)
  const erc721 = new ethers.Contract(
    tokenAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    signer
  );
  const balance = (await erc721.balanceOf(recipient)) as bigint;
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
