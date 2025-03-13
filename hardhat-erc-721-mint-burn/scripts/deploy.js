async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // The deployer will also be the woner of our NFT contract
    const MyToken = await ethers.getContractFactory("MyToken", deployer);
    const contract = await MyToken.deploy(deployer.address);
  
    console.log("Contract deployed at:", contract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  