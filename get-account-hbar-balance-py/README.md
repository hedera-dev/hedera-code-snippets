# Read Account HBAR balance using Python 

Reading account balances on Chains has always been struggling for developer, especially for tokens. Ethereum has a built-in function that allows developers to retreive the Ether balance. The process is quite more complex for tokens: developers need to fetch balance of user from each smart contract of each token, requiring lot of computational resources and time. Hedera has an in-built function that allows devs to fastly and efficiently fetch balance from accounts.

## Code
The architecture of the code is quite similar to the other snippet: we call the Operator Class as it's useful as gateway to Hedera Network, and throught Operator we are able to access a set of transactions and interactions with Hedera Network. There's an in-built function that allows devs to directly access the Account balances. This returns a dictonary, that allow us to obtain HBAR and other tokens balances of the given Account ID.


## References

- Hedera Portal: https://portal.hedera.com/register
- Hedera Docs: https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/get-account-balance
