
// Verifying if your browser is running MetaMask
// Note This property is non-standard. Non-MetaMask providers may also set this property to true.
if (!window.ethereum) {
  throw new Error("Metamask is not installed! Go install the extension!");
}

const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

async function switchToHederaNetwork() {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: 0x128 }] // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    // If the Hedera Testnet network has not been added
    // Add it to MetaMask using wallet_addEthereumChain
    if (error.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: `Hedera Testnet`,
              chainId: 0x128,
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18
              },
              rpcUrls: ["https://testnet.hashio.io/api"]
            },
          ],
        });
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
  }
}

/* Associate an account with the provided HTS token solidity address by
treating HTS tokens as if they were ERC20/ERC721 tokens.
This allows us to call the associate function directly on the HTS token.
*/
async function associateToken() {
  await switchToHederaNetwork(window.ethereum);
  // request access to the user's account
  await provider.send("eth_requestAccounts", []);
  // get signer
  const signer = provider.getSigner();
  // define a hardcoded ABI that exposes (a subset of the) known interface of all HTS tokens
  const abi = ["function associate()"];
  const hederaTokenSolidityAddress = '0x000000000000000000000000000000000008bcc1';
  // create contract instance using token solidity address, hardcoded ABI, and signer
  const contract = new ethers.Contract(hederaTokenSolidityAddress, abi, signer);

  try {
    // call the associate function
    const transactionResult = await contract.associate({
      gasLimit: 800_000
    });
    return transactionResult.hash;
  } catch (error) {
    console.warn(error.message ? error.message : error);
    return null;
  }
};
associateToken();
