async function main() {
    const [deployer] = await ethers.getSigners();
    const MyTokenAdvanced = await ethers.getContractFactory(
      "MyTokenAdvanced",
      deployer
    );
  
    // Connect to the deployed contract (REPLACE WITH YOUR CONTRACT ADDRESS)
    const contractAddress = "0xDfFb980B13992d1445396320906e007274F089bB";
    const contract = await MyTokenAdvanced.attach(contractAddress);
  
    // Mint a token to ourselves
    const mintTx = await contract.safeMint(
      deployer.address,
      "https://myserver.com/8bitbeard/8bitbeard-tokens/tokens/1"
    );
    const receipt = await mintTx.wait();
    const mintedTokenId = receipt.logs[0].topics[3];
    console.log("Minted token ID:", mintedTokenId);
  
    // Check the balance of the token
    const balance = await contract.balanceOf(deployer.address);
    console.log("Balance:", balance.toString(), "NFTs");
  
    // Check the token URI
    const tokenURI = await contract.tokenURI(mintedTokenId);
    console.log("Token URI:", tokenURI);
  }
  
  main().catch(console.error);
  