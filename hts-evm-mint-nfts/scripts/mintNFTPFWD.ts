import { network } from "hardhat";

const { ethers } = await network.connect({ network: "testnet" });

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Replace with your deployed MyHTSTokenPFWD contract address
  const contractAddress = "<your-contract-address>";
  const recipient = signer.address;

  const myHTSTokenPFWDContract = await ethers.getContractAt(
    "MyHTSTokenPFWD",
    contractAddress,
    signer
  );

  // Display the underlying HTS token address
  const tokenAddress = await myHTSTokenPFWDContract.tokenAddress();
  console.log("HTS ERC721 facade address:", tokenAddress);

  // 1) Associate the signer via token.associate() (EOA -> token contract)
  const tokenAssociateAbi = ["function associate()"];
  const token = new ethers.Contract(tokenAddress, tokenAssociateAbi, signer);
  console.log("Associating signer to token via token.associate() ...");
  const assocTx = await token.associate({ gasLimit: 800_000 });
  await assocTx.wait();
  console.log("Associate tx hash:", assocTx.hash);

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

  // 3) Mint the NFT via the wrapper (wrapper holds supply key)
  console.log(`Minting NFT to ${recipient} with metadata: ${metadata} ...`);
  // Note: Our mintNFT function is overloaded; we must use this syntax to disambiguate
  // or we get a typescript error.
  const tx = await myHTSTokenPFWDContract["mintNFT(address,bytes)"](
    recipient,
    metadata,
    {
      gasLimit: 400_000
    }
  );
  await tx.wait();
  console.log("Mint tx hash:", tx.hash);

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
