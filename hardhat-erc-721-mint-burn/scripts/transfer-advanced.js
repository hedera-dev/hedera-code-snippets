async function main() {
    // Get the signer of the tx and address for minting the token
    const [deployer] = await ethers.getSigners();
  
    // Get the ContractFactory of your MyToken ERC-721 contract
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      deployer
    );
  
    // Connect to the deployed contract (REPLACE WITH YOUR CONTRACT ADDRESS)
    const contractAddress = "0xDfFb980B13992d1445396320906e007274F089bB";
    const contract = await MyTokenAdvanced.attach(contractAddress);
  
    // Unpause the token
    const unpauseTx = await contract.unpause();
    await unpauseTx.wait();
    console.log("Unpaused token");
  
    // Read the paused state
    const pausedState = await contract.paused();
    console.log("Contract paused state is:", pausedState);
  
    // Transfer the token with ID 0
    const transferTx = await contract.transferFrom(
      deployer.address,
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      0
    );
  
    await transferTx.wait();
  
    const balance = await contract.balanceOf("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log("Balance:", balance.toString(), "NFTs");
  }
  
  main().catch(console.error);