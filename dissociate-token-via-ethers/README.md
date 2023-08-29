# Dissociate Token via Ethers

Disassociate an account with the provided HTS token via ethers.js.


You are able to treat HTS tokens as if they were ERC20/ERC721 tokens. This allows us to call the dissociate function directly on the HTS token.


Disassociating an account with a Hedera Native token is unique to Hedera. Once disassociating is successful, no token related operation can be performed to that account.


> **Note**
> The account is required to have a zero balance of the token you wish to disassociate. If a token balance is present, you will receive a `TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES` error.


## Code
The file `index.js` provides a code snippet to dissociate an account with a Hedera native token via ethers.js. 

### How to use
Add this code snippet into an already existing project that establishes a connection to an evm wallet (i.e. MetaMask). The wallet user will need to sign the transaction and if successful, their account is disassociated with the token.

## References

- [HIP-719: Associate and Dissociate Tokens via Facade Contract](https://hips.hedera.com/hip/hip-719)