import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MyTokenUpgradeable (V1) via TransparentUpgradeableProxy", function () {
  async function deployProxyWithSeparateAdminAndOwner() {
    const [owner, admin, user] = await ethers.getSigners();

    // 1) Deploy logic V1
    const Impl = await ethers.getContractFactory("MyTokenUpgradeable", owner);
    const impl = await Impl.deploy();
    await impl.waitForDeployment();
    const implAddr = await impl.getAddress();

    // 2) Encode initializer with owner as initialOwner
    const initData = Impl.interface.encodeFunctionData("initialize", [
      owner.address
    ]);

    // 3) Deploy Transparent proxy with a distinct admin
    const Proxy = await ethers.getContractFactory(
      "OZTransparentUpgradeableProxy",
      admin
    );
    const proxy = await Proxy.deploy(implAddr, admin.address, initData);
    await proxy.waitForDeployment();
    const proxyAddr = await proxy.getAddress();

    // 4) Interact with the proxy using the logic ABI
    const tokenV1 = Impl.attach(proxyAddr);

    return { owner, admin, user, implAddr, proxyAddr, tokenV1 };
  }

  it("initializes correctly and exposes ERC721 metadata", async () => {
    const { owner, tokenV1 } = await deployProxyWithSeparateAdminAndOwner();

    const tokenAsOwner = tokenV1.connect(owner);
    expect(await tokenAsOwner.name()).to.equal("MyTokenUpgradeable");
    expect(await tokenAsOwner.symbol()).to.equal("MTU");
  });

  it("mints tokens only by owner and increments tokenId", async () => {
    const { owner, user, tokenV1 } =
      await deployProxyWithSeparateAdminAndOwner();

    const asOwner = tokenV1.connect(owner);
    const asUser = tokenV1.connect(user);

    // Non-owner cannot mint (OZ OwnableUpgradeable custom error)
    await expect(asUser.safeMint(user.address))
      .to.be.revertedWithCustomError(tokenV1, "OwnableUnauthorizedAccount")
      .withArgs(user.address);

    // Owner mints sequentially
    const tx1 = await asOwner.safeMint(owner.address);
    await tx1.wait();
    expect(await asOwner.ownerOf(0n)).to.equal(owner.address);

    const tx2 = await asOwner.safeMint(owner.address);
    await tx2.wait();
    expect(await asOwner.ownerOf(1n)).to.equal(owner.address);
  });

  it("cannot be re-initialized", async () => {
    const { owner, tokenV1 } = await deployProxyWithSeparateAdminAndOwner();
    const asOwner = tokenV1.connect(owner);

    // Second initialize call must revert (OZ Initializable custom error)
    await expect(
      asOwner.initialize(owner.address)
    ).to.be.revertedWithCustomError(tokenV1, "InvalidInitialization");
  });
});
