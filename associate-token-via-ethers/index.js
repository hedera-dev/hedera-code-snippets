import ethers from 'ethers';
import { TokenId,} from '@hashgraph/sdk';

/* Associate an account with the provided HTS token ID by 
  treating HTS tokens as if they were ERC20/ERC721 tokens. 
  This allows us to call the associate function directly on the HTS token.
*/
async function associateToken() {
  // set up your ethers provider
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  // request access to the user's account
  await provider.send("eth_requestAccounts", []);
  // get signer
  const signer = provider.getSigner();
  // define contract interface
  const abi = ["function associate()"];
  const hederaTokenID = '0.0.572609';
  // when working with HTS token Ids, convert the HTS tokenID into it’s solidity address with a ‘0x’ prefix
  const tokenSolidityAddress = '0x' + TokenId.fromString(hederaTokenID).tokenSolidityAddress();
  // create contract instance using token solidity address, abi, and signer
  const contract = new ethers.Contract(tokenSolidityAddress, abi, signer);

  try {
    // call the associate function
    const transactionResult = await contract.associate();
    return transactionResult.hash;
  } catch (error) {
    console.warn(error.message ? error.message : error);
    return null;
  } 
};