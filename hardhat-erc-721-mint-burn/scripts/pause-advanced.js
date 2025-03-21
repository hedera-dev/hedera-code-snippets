async function main() {
    const [deployer] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory("MyTokenAdvanced", deployer);
  
    // Connect to the deployed contract (REPLACE WITH YOUR CONTRACT ADDRESS)
    const contractAddress = "0xDfFb980B13992d1445396320906e007274F089bB";
    const contract = await MyTokenAdvanced.attach(contractAddress);
  
    // Pause the token
    const pauseTx = await contract.pause();
    await pauseTx.wait();
    console.log("Paused token");

    // Read the paused state
    const pausedState = await contract.paused();
    console.log("Contract paused state is:", pausedState);
}
  
main().catch(console.error);