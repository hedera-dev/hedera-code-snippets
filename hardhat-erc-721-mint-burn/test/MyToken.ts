import { expect } from "chai";
import { network } from "hardhat";
import { ZeroAddress } from "ethers";

const { ethers } = await network.connect();

describe("MyToken (TypeScript tests)", function () {
  it("mints sequential token IDs to the correct owner", async function () {
    const [deployer] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();

    await expect(token.safeMint(deployer.address))
      .to.emit(token, "Transfer")
      .withArgs(ZeroAddress, deployer.address, 0n);

    await expect(token.safeMint(deployer.address))
      .to.emit(token, "Transfer")
      .withArgs(ZeroAddress, deployer.address, 1n);

    expect(await token.ownerOf(0)).to.equal(deployer.address);
    expect(await token.ownerOf(1)).to.equal(deployer.address);
    expect(await token.balanceOf(deployer.address)).to.equal(2n);
  });

  it("only the owner can mint", async function () {
    const [deployer, other] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();

    await expect(token.connect(other).safeMint(other.address))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(other.address);
  });

  it("owner can burn their token", async function () {
    const [deployer] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();

    await token.safeMint(deployer.address);
    expect(await token.balanceOf(deployer.address)).to.equal(1n);

    await token.burn(0);
    expect(await token.balanceOf(deployer.address)).to.equal(0n);

    await expect(token.ownerOf(0))
      .to.be.revertedWithCustomError(token, "ERC721NonexistentToken")
      .withArgs(0n);
  });

  it("approved operator can burn", async function () {
    const [deployer, operator] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();

    await token.safeMint(deployer.address);
    await token.approve(operator.address, 0);
    await token.connect(operator).burn(0);

    await expect(token.ownerOf(0))
      .to.be.revertedWithCustomError(token, "ERC721NonexistentToken")
      .withArgs(0n);
  });

  it("transfers work", async function () {
    const [deployer, receiver] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();

    await token.safeMint(deployer.address);
    await token.transferFrom(deployer.address, receiver.address, 0);

    expect(await token.ownerOf(0)).to.equal(receiver.address);
  });
});
