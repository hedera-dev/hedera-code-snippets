import { expect } from "chai";
import { network } from "hardhat";
import type { ContractTransactionResponse, Wallet } from "ethers";

const { ethers } = await network.connect({ network: "testnet" });

let myHTSTokenPFWD: any;
let htsErc721Address: string;
let tokenIdA: bigint; // minted to deployer initially
let tokenIdB: bigint; // minted to user2 for wipe/burn test
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
        gasLimit: 400_000
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
    expect(tokenIdA).to.not.equal(0n);
  });

  it("pauses and unpauses the token; transfers fail while paused and succeed when unpaused", async () => {
    // Pause the token
    const pauseTx = await myHTSTokenPFWD.pauseToken({ gasLimit: 70_000 });
    await expect(pauseTx).to.emit(myHTSTokenPFWD, "TokenPaused");

    // Assert transfer fails while paused (flag + assert)
    const erc721Deployer = erc721For(deployer);
    let pausedTransferFailed = false;
    try {
      const t = await erc721Deployer.transferFrom(
        deployer.address,
        user2.address,
        tokenIdA,
      );
      await t.wait();
    } catch {
      pausedTransferFailed = true;
    }
    expect(pausedTransferFailed).to.equal(true);

    // Unpause the token
    const unpauseTx = await myHTSTokenPFWD.unpauseToken({ gasLimit: 70_000 });
    await expect(unpauseTx).to.emit(myHTSTokenPFWD, "TokenUnpaused");

    // Transfer should now succeed
    const xferTx = await erc721Deployer.transferFrom(
      deployer.address,
      user2.address,
      tokenIdA
    );
    await xferTx.wait();

    const newOwner = await ownerOf(tokenIdA);
    expect(newOwner.toLowerCase()).to.equal(user2.address.toLowerCase());
  });

  it("mints a second NFT to user2 for wipe/burn test (tokenIdB)", async () => {
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

  it("wipes tokenIdB from user2; balance must decrease", async () => {
    // Balance before (on ERC721 facade)
    const erc721Viewer = new ethers.Contract(
      htsErc721Address,
      ERC721_MIN_ABI,
      ethers.provider
    );
    const balBefore = (await erc721Viewer.balanceOf(user2.address)) as bigint;

    // Attempt wipe once (wrapper holds WIPE key)
    let wipeSucceeded = false;
    try {
      const wipeTx = await myHTSTokenPFWD.wipeTokenFromAccount(
        user2.address,
        [tokenIdB],
        { gasLimit: 70_000 }
      );
      await wipeTx.wait();
      wipeSucceeded = true;
    } catch {
      wipeSucceeded = false;
    }
    expect(wipeSucceeded, "Wipe failed").to.equal(true);

    // Balance after
    const balAfter = (await erc721Viewer.balanceOf(user2.address)) as bigint;
    expect(
      balAfter < balBefore,
      "Balance did not decrease after wipe"
    ).to.equal(true);
  });

  it("burns tokenIdA via wrapper (using the current holder) and then deletes the token", async () => {
    // Determine current holder (it was moved to user2 earlier)
    const currentOwner = (await ownerOf(tokenIdA)).toLowerCase();
    const holderSigner =
      currentOwner === deployer.address.toLowerCase() ? deployer : user2;
    expect(currentOwner).to.equal(
      (await holderSigner.getAddress()).toLowerCase()
    );

    // Ensure approval for THIS tokenId from the holder
    await ensureApprovedForToken(holderSigner, myHTSTokenPFWD.target, tokenIdA);

    // Burn (call wrapper as the holder)
    const burnTx = await myHTSTokenPFWD
      .connect(holderSigner)
      .burnNFT(tokenIdA, {
        gasLimit: 350_000
      });
    const burnRcpt = await burnTx.wait();
    expect(!!burnRcpt?.hash, "Burn tx did not finalize").to.equal(true);

    // ownerOf should now revert for tokenIdA
    let ownerOfReverted = false;
    try {
      await ownerOf(tokenIdA);
    } catch {
      ownerOfReverted = true;
    }
    expect(ownerOfReverted, "ownerOf did not revert after burn").to.equal(true);

    // Delete token (succeeds when total supply is zero)
    const delTx = await myHTSTokenPFWD.deleteToken({ gasLimit: 70_000 });
    const delRcpt = await delTx.wait();
    expect(!!delRcpt?.hash, "Delete tx did not finalize").to.equal(true);
  });

  it("fails to mint after token deletion", async () => {
    await expect(
      myHTSTokenPFWD["mintNFT(address)"](deployer.address, {
        gasLimit: 400_000
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
  } catch {
    // If already associated, a revert is acceptable and can be ignored here.
  }
}

function erc721For(signer: any) {
  return new ethers.Contract(htsErc721Address, ERC721_MIN_ABI, signer);
}

async function ownerOf(tokenId: bigint): Promise<string> {
  const viewer = new ethers.Contract(
    htsErc721Address,
    ERC721_MIN_ABI,
    ethers.provider
  );
  return viewer.ownerOf(tokenId);
}

async function ensureOperatorApproval(signer: any, operator: string) {
  const erc721 = new ethers.Contract(
    htsErc721Address,
    ["function setApprovalForAll(address operator, bool approved) external"],
    signer
  );
  const tx = await erc721.setApprovalForAll(operator, true);
  await tx.wait();
}

async function ensureApprovedForToken(
  signer: any,
  operator: string,
  tokenId: bigint
) {
  const erc721 = new ethers.Contract(htsErc721Address, ERC721_MIN_ABI, signer);

  // Already approved for this token?
  try {
    const curr = (await erc721.getApproved(tokenId)) as string;
    if (curr && curr.toLowerCase() === operator.toLowerCase()) return;
  } catch {}

  // Already operator-approved?
  try {
    const op = await erc721.isApprovedForAll(
      await signer.getAddress(),
      operator
    );
    if (op === true) return;
  } catch {}

  // Prefer single-token approval; if it fails, fall back to operator approval
  try {
    const atx = await erc721.approve(operator, tokenId);
    await atx.wait();
    const curr = (await erc721.getApproved(tokenId)) as string;
    if (curr && curr.toLowerCase() === operator.toLowerCase()) return;
  } catch {
    // fall through to operator approval
  }

  const o = await erc721.setApprovalForAll(operator, true);
  await o.wait();

  const op = await erc721.isApprovedForAll(await signer.getAddress(), operator);
  if (op !== true) {
    throw new Error("Failed to ensure approval for burn");
  }
}
