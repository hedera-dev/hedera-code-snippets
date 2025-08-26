import { expect } from "chai";
import { network } from "hardhat";
import { ZeroAddress } from "ethers";

const { ethers } = await network.connect();

describe("MyTokenAdvanced (TypeScript tests)", function () {
  it("assigns roles on deployment", async function () {
    const [admin, pauser, minter] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      admin
    );
    const token = await MyTokenAdvanced.deploy(
      admin.address,
      pauser.address,
      minter.address
    );
    await token.waitForDeployment();

    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
    expect(await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(
      true
    );
    expect(
      await token.hasRole(await token.PAUSER_ROLE(), pauser.address)
    ).to.equal(true);
    expect(
      await token.hasRole(await token.MINTER_ROLE(), minter.address)
    ).to.equal(true);
  });

  it("only MINTER_ROLE can mint with a URI", async function () {
    const [admin, pauser, minter, alice] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      admin
    );
    const token = await MyTokenAdvanced.deploy(
      admin.address,
      pauser.address,
      minter.address
    );
    await token.waitForDeployment();

    const MINTER_ROLE = await token.MINTER_ROLE();

    await expect(token.connect(alice).safeMint(alice.address, "ipfs://x"))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
      .withArgs(alice.address, MINTER_ROLE);

    const tx = await token
      .connect(minter)
      .safeMint(alice.address, "ipfs://token/1");
    await expect(tx)
      .to.emit(token, "Transfer")
      .withArgs(ZeroAddress, alice.address, 0n);

    expect(await token.ownerOf(0)).to.equal(alice.address);
    expect(await token.tokenURI(0)).to.equal("ipfs://token/1");
  });

  it("pause blocks transfers, unpause allows transfers", async function () {
    const [admin, pauser, minter, alice, bob] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      admin
    );
    const token = await MyTokenAdvanced.deploy(
      admin.address,
      pauser.address,
      minter.address
    );
    await token.waitForDeployment();

    await token.connect(minter).safeMint(alice.address, "ipfs://1");
    await token.connect(pauser).pause();

    await expect(
      token.connect(alice).transferFrom(alice.address, bob.address, 0)
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.connect(pauser).unpause();

    await token.connect(alice).transferFrom(alice.address, bob.address, 0);
    expect(await token.ownerOf(0)).to.equal(bob.address);
  });

  it("supports IERC721 and IAccessControl interfaces", async function () {
    const [admin, pauser, minter] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      admin
    );
    const token = await MyTokenAdvanced.deploy(
      admin.address,
      pauser.address,
      minter.address
    );
    await token.waitForDeployment();

    const IERC165_ID = "0x01ffc9a7";
    const IERC721_ID = "0x80ac58cd";
    const IAccessControl_ID = "0x7965db0b";

    expect(await token.supportsInterface(IERC165_ID)).to.equal(true);
    expect(await token.supportsInterface(IERC721_ID)).to.equal(true);
    expect(await token.supportsInterface(IAccessControl_ID)).to.equal(true);
  });
});
