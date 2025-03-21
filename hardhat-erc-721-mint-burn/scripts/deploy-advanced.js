async function main() {
  const [deployer] = await ethers.getSigners();
  const MyTokenAdvanced = await ethers.getContractFactory(
    "MyTokenAdvanced",
    deployer
  );

  // Third argument is the minting role set to an unknown address
  const contract = await MyTokenAdvanced.deploy(
    deployer.address,
    deployer.address,
    deployer.address
  );
  console.log("Contract deployed at:", contract.target);
}

main().catch(console.error);
