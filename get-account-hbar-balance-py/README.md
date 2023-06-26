# Read Account HBAR balance using Python

Reading account balances is usually a struggle for developers, especially for tokens. It is relatively easy for the native coin balance, as there is a built-in function for that. The process is much more complex for tokens: Developers need to fetch balance of an account from each smart contract of each token, requiring lot of computational resources and time. Hedera has a built-in function that allows devs to quickly and efficiently fetch token balances from accounts.

This code snippet was contributed by [astrid-net](https://github.com/astrid-net).

## Code

After importing the `hedera` package into our file, the `fetchAccountBalance` function uses it retrieve the balance of an account. Hedera Python SDK has some standard functions that allow us to interact with the Hedera network. We use the operator keys to initialise `client`, and use that to sign and submit transactionsto the Hedera network. You can use any Hedera account as an operator; if you do not yet have one, you can create your own operator account on Hedera Portal.

We use `AccountBalanceQuery()` to do this, and read the `hbars` property from the response to obtain its balance.

## References

- Hedera Portal: https://portal.hedera.com/register
- Hedera Docs: https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/get-account-balance
