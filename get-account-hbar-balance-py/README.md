# Read Account HBAR balance using Python

Reading account balances is usually a struggle for developers, especially for tokens. It is relatively easy for the native coin balance, as there is a built-in function for that. The process is much more complex for tokens: Developers need to fetch balance of an account from each smart contract of each token, requiring lot of computational resources and time. Hedera has a built-in function that allows devs to quickly and efficiently fetch token balances from accounts.

## Code

The architecture of the code is quite similar to the other snippets: We call the Operator class as it's useful as gateway to Hedera networks, and through Operator we are able to access a set of transactions and interactions with Hedera networks. There's an built-in function that allows devs to directly access the Account balances. This returns a dictonary, that allow us to obtain HBAR and other tokens balances of the given Account ID.

## References

- Hedera Portal: https://portal.hedera.com/register
- Hedera Docs: https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/get-account-balance
