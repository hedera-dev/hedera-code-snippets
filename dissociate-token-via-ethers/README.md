# Dissociate Token via Ethers

Dissociate an account with the provided HTS token via ethers.js.


You are able to treat HTS tokens as if they were ERC20/ERC721 tokens. This allows us to call the dissociate function directly on the HTS token.


Dissociating an account with a Hedera Native token is unique to Hedera. Once dissociating is successful, no token related operation can be performed to that account.


> **Note**
> The account is required to have a zero balance of the token you wish to dissociate. If a token balance is present, you will receive a `TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES` error.


## Code
The file `index.js` provides the code necessary to switch to the Hedera Testnet Network and dissociate an account with a Hedera native token via ethers.js and MetaMask. 

Use `switchToHederaNetwork()` to change to the Hedera Testnet network to complete the association call.
- Use `wallet_switchEthereumChain` to switch to the Hedera Testnet network.
- Use `wallet_addEthereumChain`to add the Hedera Testnet network to MetaMask in the event it has not been previously added.
  - Use `chainId` 0x128 in hexadecimal numbers to add the Hedera Testnet Network
  - Use `nativeCurrency` to describe the native currency of the chain
    - Use `name` HBAR
    - Use `symbol` HBAR
    - Use `decimals` 18 a non-negative integar 
  - Use `rpcUrls` an array of RPC URLS for the custom network. Use `https://testnet.hashio.io/api` or for alternatives visit [How to Connect to Hedera Networks Over RPC](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections)

Use `dissociateToken()` to dissociate an account with the provided HTS token solidity address
- Use `['function dissociate()']` as a hardcoded ABI that exposes (a subset of the) known interface of all HTS tokens.
- Use `ethers.Contract` to initialise an instance using the address and ABI.
- Use `gasLimit` to override ethers default gas limit to be 800_000.
- Invoke `dissociate` on the token instance, which you can interact with a "standard" EVM smart contract from this point onward.

> **Note**
> Run the page within a local web server. If using Visual Studio Code you can install the Live Server extension and open the HTMl file with Live Server.


## References

- [HIP-719: Associate and Dissociate Tokens via Facade Contract](https://hips.hedera.com/hip/hip-719)
- [How to Connect to Hedera Networks Over RPC](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections)