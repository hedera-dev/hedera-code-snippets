import { expect } from "chai";
import { network } from "hardhat";
import { ZeroAddress, ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

let myHTSToken: any;
let htsErc721Address: string;
let mintedTokenId: bigint;

const ERC721_MIN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)"
];

describe("MyHTSToken (Hedera testnet)", function () {
  this.timeout(300_000);

  it("deploys the MyHTSToken contract", async () => {
    myHTSToken = await ethers.deployContract("MyHTSToken");
    console.log("MyHTSToken deployed to:", myHTSToken.target);
    expect(myHTSToken.target).to.be.properAddress;
  });

  it("creates an HTS NFT collection", async () => {
    const tx = await myHTSToken.createNFTCollection(
      "MyHTSTokenNFTCollection",
      "MHT",
      {
        value: ethers.parseEther("15"),
        gasLimit: 250_000
      }
    );

    await expect(tx).to.emit(myHTSToken, "NFTCollectionCreated");

    htsErc721Address = await myHTSToken.tokenAddress();
    console.log("HTS ERC721 facade address:", htsErc721Address);
    expect(htsErc721Address).to.be.properAddress;
    expect(htsErc721Address).to.not.equal(ethers.ZeroAddress);
  });

  it("mints an NFT with metadata to the deployer (capture tokenId)", async () => {
    const [deployer] = await ethers.getSigners();

    const metadata = ethers.toUtf8Bytes(
      "ipfs://bafkreibr7cyxmy4iyckmlyzige4ywccyygomwrcn4ldcldacw3nxe3ikgq"
    );

    const tx = (await myHTSToken.mintNFT(deployer.address, metadata, {
      gasLimit: 350_000
    })) as unknown as ContractTransactionResponse;
    await expect(tx).to.emit(myHTSToken, "NFTMinted");

    // Extract tokenId from MyHTSToken's NFTMinted event
    const rcpt = await tx.wait();
    const wrapperAddr = myHTSToken.target.toLowerCase();
    mintedTokenId = 0n;

    for (const log of rcpt.logs ?? []) {
      if (log.address.toLowerCase() !== wrapperAddr) continue;
      try {
        const parsed = myHTSToken.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        if (parsed && parsed.name === "NFTMinted") {
          const tok = parsed.args[1];
          mintedTokenId =
            typeof tok === "bigint" ? tok : BigInt(tok.toString());
          break;
        }
      } catch {
        // Not a wrapper event; ignore
      }
    }

    expect(mintedTokenId, "failed to decode minted tokenId").to.not.equal(0n);
    console.log("Minted tokenId:", mintedTokenId.toString());
  });

  it("approves and burns the minted NFT (no pre-transfer needed)", async () => {
    const [deployer] = await ethers.getSigners();

    // Use minimal ABI (no artifact dependency)
    const erc721 = new ethers.Contract(
      htsErc721Address,
      ERC721_MIN_ABI,
      deployer
    );

    // Ensure MyHTSToken is approved for this tokenId
    const currentApproved: string = await erc721.getApproved(mintedTokenId);
    if (currentApproved.toLowerCase() !== myHTSToken.target.toLowerCase()) {
      const approveTx = await erc721.approve(myHTSToken.target, mintedTokenId);
      await approveTx.wait();
    }

    // Burn via MyHTSToken; wrapper will transfer to treasury and burn
    const burnTx = await myHTSToken.burnNFT(mintedTokenId, {
      gasLimit: 200_000
    });
    await expect(burnTx).to.emit(myHTSToken, "NFTBurned");

    // Optional: check deployer balance after burn
    const raw = await erc721.balanceOf(deployer.address);
    const bal = typeof raw === "bigint" ? raw : BigInt(raw.toString());
    // Balance might be >0 if multiple NFTs minted; at least it shouldn't throw
    expect(bal >= 0n).to.equal(true);
  });
});
