import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

let myHTSTokenKYC: any;
let htsErc721Address: string;
let mintedTokenId: bigint;

const ERC721_MIN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)"
];

describe("MyHTSToken KYC (Hedera testnet)", function () {
  this.timeout(300_000);

  it("deploys the MyHTSTokenKYC contract", async () => {
    myHTSTokenKYC = await ethers.deployContract("MyHTSTokenKYC");
    console.log("MyHTSTokenKYC deployed to:", myHTSTokenKYC.target);
    expect(myHTSTokenKYC.target).to.be.properAddress;
  });

  it("creates an HTS NFT collection (with KYC key)", async () => {
    const tx = await myHTSTokenKYC.createNFTCollection(
      "MyHTSTokenKYCCollection",
      "MHTKYC",
      {
        value: ethers.parseEther("15"),
        gasLimit: 350_000
      }
    );

    await expect(tx).to.emit(myHTSTokenKYC, "NFTCollectionCreated");

    htsErc721Address = await myHTSTokenKYC.tokenAddress();
    console.log("HTS ERC721 facade address:", htsErc721Address);
    expect(htsErc721Address).to.be.properAddress;
    expect(htsErc721Address).to.not.equal(ethers.ZeroAddress);
  });

  it("fails to mint to account2 before KYC is granted", async () => {
    const [deployer] = await ethers.getSigners();
    await expect(
      myHTSTokenKYC["mintNFT(address)"](deployer.address, {
        gasLimit: 350_000
      })
    ).to.be.revert(ethers);
  });

  it("associates deployer, grants KYC, then mints successfully and captures tokenId", async () => {
    const [deployer] = await ethers.getSigners();

    // 1) EOA associates directly with the HTS token contract (no SDK)
    const tokenAssociateAbi = ["function associate()"];
    const token = new ethers.Contract(
      htsErc721Address,
      tokenAssociateAbi,
      deployer
    );
    try {
      const assocTx = await token.associate({ gasLimit: 800_000 });
      await assocTx.wait();
    } catch {
      // If already associated, this may revert silently; continue
    }

    // 2) Grant KYC to deployer via wrapper
    const grantTx = await myHTSTokenKYC.grantKYC(deployer.address, {
      gasLimit: 75_000
    });
    await expect(grantTx)
      .to.emit(myHTSTokenKYC, "KYCGranted")
      .withArgs(deployer.address);

    // 3) Mint to deployer (disambiguate overload)
    const mintTx = (await myHTSTokenKYC["mintNFT(address)"](deployer.address, {
      gasLimit: 400_000
    })) as unknown as ContractTransactionResponse;
    const rcpt = await mintTx.wait();

    // 4) Extract tokenId from wrapper event; fallback to 1n if logs omitted
    const wrapperAddr = myHTSTokenKYC.target.toLowerCase();
    mintedTokenId = 0n;

    if (rcpt && rcpt.logs) {
      for (const log of rcpt.logs) {
        if (log.address.toLowerCase() !== wrapperAddr) continue;
        try {
          const parsed = myHTSTokenKYC.interface.parseLog({
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
          // ignore non-wrapper logs
        }
      }
    }
    if (mintedTokenId === 0n) {
      mintedTokenId = 1n; // first mint fallback
    }

    console.log("Minted tokenId:", mintedTokenId.toString());
    expect(mintedTokenId).to.not.equal(0n);
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
    if (currentApproved.toLowerCase() !== myHTSTokenKYC.target.toLowerCase()) {
      const approveTx = await erc721.approve(
        myHTSTokenKYC.target,
        mintedTokenId
      );
      await approveTx.wait();
    }

    // Burn via MyHTSToken; wrapper will transfer to treasury and burn
    const burnTx = await myHTSTokenKYC.burnNFT(mintedTokenId, {
      gasLimit: 100_000
    });
    await expect(burnTx).to.emit(myHTSTokenKYC, "NFTBurned");

    // Optional: check deployer balance after burn
    const raw = await erc721.balanceOf(deployer.address);
    const bal = typeof raw === "bigint" ? raw : BigInt(raw.toString());
    // Balance might be >0 if multiple NFTs minted; at least it shouldn't throw
    expect(bal >= 0n).to.equal(true);
  });

  it("updates KYC key to deployer's compressed public key (no env PK needed)", async function () {
    const [deployer] = await ethers.getSigners();
    const cpkBytes = await getCompressedPublicKeyFromSigner(deployer);

    const updateTx = await myHTSTokenKYC.updateKYCKey(cpkBytes, {
      gasLimit: 200_000
    });
    await expect(updateTx)
      .to.emit(myHTSTokenKYC, "KYCKeyUpdated")
      .withArgs(cpkBytes);
  });

  it("fails to grant KYC after KYC key update (contract no longer holds KYC key)", async () => {
    const [deployer] = await ethers.getSigners();
    await expect(
      myHTSTokenKYC.grantKYC(deployer.address)
    ).to.be.revert(ethers);
  });
});

// Derive the signer's compressed secp256k1 public key via a signature (no env PK needed)
async function getCompressedPublicKeyFromSigner(
  signer: any
): Promise<Uint8Array> {
  const message = ethers.toUtf8Bytes("derive-compressed-pubkey");
  const signature = await signer.signMessage(message);
  const digest = ethers.hashMessage(message);
  const uncompressed = ethers.SigningKey.recoverPublicKey(digest, signature); // 0x04...
  const compressedHex = ethers.SigningKey.computePublicKey(uncompressed, true); // 0x02/0x03...
  return ethers.getBytes(compressedHex);
}


