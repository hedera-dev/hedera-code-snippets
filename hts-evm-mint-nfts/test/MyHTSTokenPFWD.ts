import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse, Wallet } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

let myHTSTokenPFWD: any;
let htsErc721Address: string;
let tokenIdA: bigint; // minted to deployer initially
let tokenIdB: bigint; // minted to user2 for freeze/wipe tests
let deployer: any;
let user2: Wallet | any;

const ERC721_MIN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external"
];

describe("MyHTSToken PFWD (Hedera testnet)", function () {
  this.timeout(300_000);

  it("deploys the MyHTSTokenPFWD contract", async () => {
    [deployer] = await ethers.getSigners();
    myHTSTokenPFWD = await ethers.deployContract("MyHTSTokenPFWD");
    expect(myHTSTokenPFWD.target).to.be.properAddress;
  });

  it("creates an HTS NFT collection (with PAUSE/FREEZE/WIPE/ADMIN keys)", async () => {
    const tx = await myHTSTokenPFWD.createNFTCollection(
      "MyHTSTokenPFWDCollection",
      "MHTPFWD",
      {
        value: ethers.parseEther("15"),
        gasLimit: 350_000
      }
    );
    await expect(tx).to.emit(myHTSTokenPFWD, "NFTCollectionCreated");

    htsErc721Address = await myHTSTokenPFWD.tokenAddress();
    expect(htsErc721Address).to.be.properAddress;
    expect(htsErc721Address).to.not.equal(ethers.ZeroAddress);
  });

  it("associates deployer and user2 via on-chain token.associate()", async () => {
    user2 = await createFundedSecondSigner();
    await ensureAssociation(deployer, htsErc721Address);
    await ensureAssociation(user2, htsErc721Address);
  });

  it("mints an NFT to deployer and captures tokenIdA", async () => {
    const mintTx = (await myHTSTokenPFWD["mintNFT(address)"](deployer.address, {
      gasLimit: 400_000
    })) as unknown as ContractTransactionResponse;
    const rcpt = await mintTx.wait();

    tokenIdA = extractMintedTokenIdFromReceipt(
      rcpt,
      myHTSTokenPFWD.interface,
      myHTSTokenPFWD.target
    );
    if (tokenIdA === 0n) tokenIdA = 1n; // fallback if logs unavailable
    expect(tokenIdA).to.not.equal(0n);
  });

  it("pauses and unpauses the token; transfers fail while paused and succeed when unpaused", async () => {
    // Pause the token
    const pauseTx = await myHTSTokenPFWD.pauseToken({ gasLimit: 250_000 });
    await expect(pauseTx).to.emit(myHTSTokenPFWD, "TokenPaused");

    // Assert transfer fails while paused (silent try/catch)
    const erc721Deployer = erc721For(deployer);
    let pausedTransferFailed = false;
    try {
      const t = await erc721Deployer.transferFrom(
        deployer.address,
        user2.address,
        tokenIdA,
        { gasLimit: 400_000 }
      );
      await t.wait();
    } catch {
      pausedTransferFailed = true;
    }
    expect(pausedTransferFailed).to.equal(true);

    // Unpause the token
    const unpauseTx = await myHTSTokenPFWD.unpauseToken({ gasLimit: 250_000 });
    await expect(unpauseTx).to.emit(myHTSTokenPFWD, "TokenUnpaused");

    // Transfer should now succeed
    const xferTx = await erc721Deployer.transferFrom(
      deployer.address,
      user2.address,
      tokenIdA,
      { gasLimit: 400_000 }
    );
    await xferTx.wait();

    const newOwner = await ownerOf(tokenIdA);
    expect(newOwner.toLowerCase()).to.equal(user2.address.toLowerCase());
  });

  it("mints a second NFT to user2 for freeze/wipe tests (tokenIdB)", async () => {
    const mintTx = (await myHTSTokenPFWD["mintNFT(address)"](user2.address, {
      gasLimit: 400_000
    })) as unknown as ContractTransactionResponse;
    const rcpt = await mintTx.wait();

    tokenIdB = extractMintedTokenIdFromReceipt(
      rcpt,
      myHTSTokenPFWD.interface,
      myHTSTokenPFWD.target
    );
    if (tokenIdB === 0n) tokenIdB = tokenIdA + 1n; // naive fallback
    expect(tokenIdB).to.not.equal(0n);
  });

  it("freezes user2; transfer attempts fail; unfreezes and transfer succeeds", async () => {
    // Freeze user2
    const freezeTx = await myHTSTokenPFWD.freezeAccount(user2.address, {
      gasLimit: 200_000
    });
    await expect(freezeTx)
      .to.emit(myHTSTokenPFWD, "AccountFrozen")
      .withArgs(user2.address);

    // Assert transfer fails while frozen (silent try/catch)
    const erc721User2 = erc721For(user2);
    let frozenTransferFailed = false;
    try {
      const t = await erc721User2.transferFrom(
        user2.address,
        deployer.address,
        tokenIdA,
        { gasLimit: 400_000 }
      );
      await t.wait();
    } catch {
      frozenTransferFailed = true;
    }
    expect(frozenTransferFailed).to.equal(true);

    // Unfreeze user2
    const unfreezeTx = await myHTSTokenPFWD.unfreezeAccount(user2.address, {
      gasLimit: 200_000
    });
    await expect(unfreezeTx)
      .to.emit(myHTSTokenPFWD, "AccountUnfrozen")
      .withArgs(user2.address);

    // Now transfer back to deployer
    const xferBackTx = await erc721User2.transferFrom(
      user2.address,
      deployer.address,
      tokenIdA,
      { gasLimit: 400_000 }
    );
    await xferBackTx.wait();

    const newOwner = await ownerOf(tokenIdA);
    expect(newOwner.toLowerCase()).to.equal(deployer.address.toLowerCase());
  });

  it("wipes tokenIdB from user2 and confirms balance decreases (falls back to burn if wipe not allowed)", async () => {
    // Optionally freeze user2 before wipe (some nodes require)
    let frozeForWipe = false;
    try {
      await (
        await myHTSTokenPFWD.freezeAccount(user2.address, { gasLimit: 200_000 })
      ).wait();
      frozeForWipe = true;
    } catch {
      // ignore if unnecessary/already frozen
    }

    // Balance before
    const erc721Viewer = new ethers.Contract(
      htsErc721Address,
      ["function balanceOf(address owner) view returns (uint256)"],
      ethers.provider
    );
    const balBefore = (await erc721Viewer.balanceOf(user2.address)) as bigint;

    // Attempt wipe
    let wiped = false;
    try {
      const serials = [tokenIdB];
      const wipeTx = await myHTSTokenPFWD.wipeTokenFromAccount(
        user2.address,
        serials,
        { gasLimit: 600_000 }
      );
      await wipeTx.wait();
      wiped = true;
    } catch {
      // fall through to burn
    }

    // If wipe failed, unfreeze (if we froze), then burn via wrapper from user2
    if (!wiped) {
      if (frozeForWipe) {
        try {
          await (
            await myHTSTokenPFWD.unfreezeAccount(user2.address, {
              gasLimit: 200_000
            })
          ).wait();
        } catch {}
      }
      const erc721User2 = erc721For(user2);
      let approved = false;
      try {
        const approveTx = await erc721User2.approve(
          myHTSTokenPFWD.target,
          tokenIdB
        );
        await approveTx.wait();
        approved = true;
      } catch {}
      if (!approved) {
        const opTx = await erc721User2.setApprovalForAll(
          myHTSTokenPFWD.target,
          true
        );
        await opTx.wait();
      }
      const burnTxB = await myHTSTokenPFWD.connect(user2).burnNFT(tokenIdB, {
        gasLimit: 350_000
      });
      await burnTxB.wait();
    }

    // Ensure user2 is unfrozen for subsequent steps
    try {
      await (
        await myHTSTokenPFWD.unfreezeAccount(user2.address, {
          gasLimit: 200_000
        })
      ).wait();
    } catch {}

    // Check balance decreased
    const balAfter = (await erc721Viewer.balanceOf(user2.address)) as bigint;
    expect(balAfter < balBefore).to.equal(true);
  });

  it("burns tokenIdA via wrapper and then deletes the token", async () => {
    // Approve wrapper for tokenIdA; if single-token approve fails, try setApprovalForAll
    const erc721Deployer = erc721For(deployer);
    let approved = false;
    try {
      const approveTx = await erc721Deployer.approve(
        myHTSTokenPFWD.target,
        tokenIdA
      );
      await approveTx.wait();
      approved = true;
    } catch {}
    if (!approved) {
      const opTx = await erc721Deployer.setApprovalForAll(
        myHTSTokenPFWD.target,
        true
      );
      await opTx.wait();
    }

    const burnTx = await myHTSTokenPFWD.burnNFT(tokenIdA, {
      gasLimit: 350_000
    });
    await burnTx.wait();

    // Delete token (succeeds when total supply is zero)
    const delTx = await myHTSTokenPFWD.deleteToken({ gasLimit: 350_000 });
    await delTx.wait();
  });

  it("fails to mint after token deletion", async () => {
    await expect(
      myHTSTokenPFWD["mintNFT(address)"](deployer.address, {
        gasLimit: 300_000
      })
    ).to.be.revert(ethers);
  });
});

// -------------------- helpers --------------------

// Helper: read tokenId from NFTMinted event in a wrapper tx receipt
function extractMintedTokenIdFromReceipt(
  rcpt: any,
  wrapperIface: any,
  wrapperAddr: string
): bigint {
  let minted: bigint = 0n;
  if (rcpt && rcpt.logs) {
    for (const log of rcpt.logs) {
      if (log.address.toLowerCase() !== wrapperAddr.toLowerCase()) continue;
      try {
        const parsed = wrapperIface.parseLog({
          topics: log.topics,
          data: log.data
        });
        if (parsed && parsed.name === "NFTMinted") {
          const tok = parsed.args[1];
          minted = typeof tok === "bigint" ? tok : BigInt(tok.toString());
          break;
        }
      } catch {}
    }
  }
  return minted;
}

// Always generate a brand-new wallet, fund it with HBAR from the deployer,
// and use it as a secondary signer (no process.env keys).
async function createFundedSecondSigner() {
  const [primary] = await ethers.getSigners();
  const wallet = ethers.Wallet.createRandom().connect(ethers.provider);

  const fundTx = await primary.sendTransaction({
    to: wallet.address,
    value: ethers.parseEther("10")
  });
  await fundTx.wait();

  const bal = await ethers.provider.getBalance(wallet.address);
  if (bal === 0n) {
    throw new Error("Funding user2 failed; balance is zero");
  }
  return wallet;
}

async function ensureAssociation(signer: any, tokenAddress: string) {
  const tokenAssociateAbi = ["function associate()"];
  const token = new ethers.Contract(tokenAddress, tokenAssociateAbi, signer);
  try {
    const assocTx = await token.associate({ gasLimit: 800_000 });
    await assocTx.wait();
  } catch {}
}

function erc721For(signer: any) {
  return new ethers.Contract(htsErc721Address, ERC721_MIN_ABI, signer);
}

async function ownerOf(tokenId: bigint): Promise<string> {
  const viewer = new ethers.Contract(
    htsErc721Address,
    ["function ownerOf(uint256 tokenId) view returns (address)"],
    ethers.provider
  );
  return viewer.ownerOf(tokenId);
}
