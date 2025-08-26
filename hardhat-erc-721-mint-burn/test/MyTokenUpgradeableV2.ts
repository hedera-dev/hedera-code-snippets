import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Upgrade MyTokenUpgradeable -> MyTokenUpgradeableV2", function () {
  async function deployFixture() {
    const [owner, admin, other] = await ethers.getSigners();

    // Deploy V1
    const V1 = await ethers.getContractFactory("MyTokenUpgradeable", owner);
    const v1 = await V1.deploy();
    await v1.waitForDeployment();
    const v1Addr = await v1.getAddress();

    // Proxy init with owner
    const initData = V1.interface.encodeFunctionData("initialize", [
      owner.address
    ]);
    const Proxy = await ethers.getContractFactory(
      "OZTransparentUpgradeableProxy",
      admin
    );
    const proxy = await Proxy.deploy(v1Addr, admin.address, initData);
    await proxy.waitForDeployment();
    const proxyAddr = await proxy.getAddress();

    const tokenV1 = V1.attach(proxyAddr);
    await (await tokenV1.connect(owner).safeMint(owner.address)).wait();

    return { owner, admin, other, proxyAddr, V1, tokenV1 };
  }

  it("upgrades to V2 via UUPS and preserves state", async () => {
    const { owner, proxyAddr, V1, tokenV1 } = await deployFixture();

    const V2 = await ethers.getContractFactory("MyTokenUpgradeableV2", owner);
    const v2 = await V2.deploy();
    await v2.waitForDeployment();
    const v2Addr = await v2.getAddress();

    // Hardhat v3: avoid deprecated `.reverted` matcher. Send tx and await.
    const tx = await tokenV1.connect(owner).upgradeToAndCall(v2Addr, "0x");
    await tx.wait();

    const tokenV2 = V2.attach(proxyAddr);
    expect(await tokenV2.version()).to.equal("v2");
    expect(await tokenV2.ownerOf(0n)).to.equal(owner.address);

    await (await tokenV2.connect(owner).safeMint(owner.address)).wait();
    expect(await tokenV2.ownerOf(1n)).to.equal(owner.address);
  });

  it("prevents non-owner from performing UUPS upgrade", async () => {
    const { owner, other, proxyAddr, V1 } = await deployFixture();

    const V2 = await ethers.getContractFactory("MyTokenUpgradeableV2", owner);
    const v2 = await V2.deploy();
    await v2.waitForDeployment();
    const v2Addr = await v2.getAddress();

    const tokenV1 = V1.attach(proxyAddr);
    await expect(tokenV1.connect(other).upgradeToAndCall(v2Addr, "0x"))
      .to.be.revertedWithCustomError(tokenV1, "OwnableUnauthorizedAccount")
      .withArgs(other.address);
  });
});
