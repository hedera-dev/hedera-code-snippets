async function main() {
    try {
        // Get the signer of the tx and address for minting the token
        const [deployer] = await ethers.getSigners();

        // Get the ContractFactory of your MyToken ERC-721 contract
        const MyToken = await ethers.getContractFactory("MyToken", deployer);

        // Connect to the deployed contract 
        // (REPLACE WITH YOUR CONTRACT ADDRESS)
        const contractAddress = "0xf328dEfC4a28092b9134a8095B752C7d67dCCaA8";
        const contract = await MyToken.attach(contractAddress);

        // Burn the token
        const burnTx = await contract.burn(0);
        await burnTx.wait();
        console.log('Burned token with ID:', 0);

        // Check the balance of the token
        const balance = await contract.balanceOf(deployer.address);
        console.log('Balance:', balance.toString(), "NFTs");
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	  console.error(error);
	  process.exit(1);
  });