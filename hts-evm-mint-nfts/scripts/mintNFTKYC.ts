import { ContractTransactionResponse } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const contractAddress = "0x2543aD4C77ebB24a5320F69450888D56c2D2cb96";
  const recipient = signer.address;

  const contract = await ethers.getContractAt(
    "MyHTSTokenKYC",
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
    const assocRcpt = await assocTx.wait();
    console.log("Associate tx hash:", assocTx.hash);
  } catch (e: any) {
    console.log(
      "Associate call skipped/ignored (possibly already associated):",
      e?.message || e
    );
  }

  // 2) Grant KYC to the recipient via wrapper (wrapper holds KYC key)
  try {
    console.log(`Granting KYC to ${recipient} ...`);
    const grantTx = await contract.grantKYC(recipient, { gasLimit: 75_000 });
    const grantRcpt = await grantTx.wait();
    console.log("Grant KYC tx hash:", grantTx.hash);
  } catch (e: any) {
    console.warn(
      "Grant KYC failed (ensure wrapper still holds KYC key):",
      e?.message || e
    );
    throw e;
  }

  // 3) Prepare metadata (<= 100 bytes)
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

  // 4) Mint to recipient
  console.log(`Minting NFT to ${recipient} with metadata: ${metadata} ...`);
  const tx = (await contract.mintNFT(recipient, metadata, {
    gasLimit: 400_000
  })) as unknown as ContractTransactionResponse;

  const rcpt = await tx.wait();
  console.log("Mint tx hash:", tx.hash);
  console.log("Mint tx receipt:", JSON.stringify(rcpt, null, 2));

  // Check recipient's NFT balance on the ERC721 facade (not on MyHTSTokenKYC)
  const erc721 = new ethers.Contract(
    tokenAddress,
    ["function balanceOf(address owner) view returns (uint256)"],
    signer
  );
  const balance = (await erc721.balanceOf(recipient)) as bigint;
  console.log("Balance:", balance.toString(), "NFTs");
}

main().catch(console.error);
