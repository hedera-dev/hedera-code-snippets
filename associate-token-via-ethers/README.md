# Associate Token via Ethers

Associate an account with the provided HTS token via ethers.js & MetaMask.


Associating an account with a Hedera Native token is unique to Hedera and is required for someone to send an HTS token to a wallet. Needing to associate protects a wallet holder from recieving unwanted tokens.

You are able to treat HTS tokens as if they were ERC20/ERC721 tokens. This allows us to call the associate function directly on the HTS token.

## Code
The file `index.js` provides the code necessary to switch to the Hedera Testnet Network and associate an account with a Hedera native token via ethers.js and MetaMask. 

Use `switchToHederaNetwork()` to change to the Hedera Testnet network to complete the association call.
- Use `wallet_switchEthereumChain` to switch to the Hedera Testnet network.
- Use `wallet_addEthereumChain`to add the Hedera Testnet network to MetaMask in the event it has not been previously added.
  - Use `chainId`0x128 in hexadecimal numbers to add the Hedera Testnet Network
  - Use `nativeCurrency` to describe the native currency of the chain
    - Use `name` HBAR
    - Use `symbol` HBAR
    - Use `decimals` 18 a non-negative integar 
  - Use `rpcUrls` an array of RPC URLS for the custom network. Use `https://testnet.hashio.io/api` or for alternatives visit [How to Connect to Hedera Networks Over RPC](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections)

Use `associateToken()` to Associate an account with the provided HTS token solidity address
- Use `['function associate()']` as a hardcoded ABI that exposes (a subset of the) known interface of all HTS tokens.
- Use `ethers.Contract` to initialise an instance using the address and ABI.
- Use `gasLimit` to override ethers default gas limit to be 800_000.
- Invoke `associate` on the token instance, which you can interact with a "standard" EVM smart contract from this point onward.

> **Note**
> Run the page within a local web server. If using Visual Studio Code you can install the Live Server extension and open the HTMl file with Live Server.


## References

- [HIP-719: Associate and Dissociate Tokens via Facade Contract](https://hips.hedera.com/hip/hip-719)
- [How to Connect to Hedera Networks Over RPC](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections)