# Associate Token via Ethers

Associate an account with the provided HTS token via ethers.js.


Associating an account with a Hedera Native token is unique to Hedera and is required for someone to send an HTS token to a wallet. Needing to associate protects a wallet holder from recieving unwanted tokens.

You are able to treat HTS tokens as if they were ERC20/ERC721 tokens. This allows us to call the associate function directly on the HTS token.

## Code
The file `index.js` provides a code snippet to associate an account with a Hedera native token via ethers.js. 

- Use `tokenSolidityAddress` to obtain the EVM address of the HTS token
- Use `['function associate()']` as a hardcoded ABI that exposes (a subset of the) known interface of all HTS tokens
- Use `ethers.Contract` to initialise an instance using the address and ABI
- Invoke `associate` on the token instance, which you can interact with like a "standard" EVM smart contract from this point onward



### How to use
Add this code snippet into an already existing project that establishes a connection to an evm wallet (i.e. MetaMask). The wallet user will need to sign the transaction and if successful, their account is associated with the token.

## References

- [HIP-719: Associate and Dissociate Tokens via Facade Contract](https://hips.hedera.com/hip/hip-719)