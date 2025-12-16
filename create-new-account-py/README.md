# Create new account on Hedera Testnet using Python

This script allows devs to easly create a new account on Hedera Testnet using the Hedera Python SDK.

This code snippet was contributed by [astrid-net](https://github.com/astrid-net).

## Code

After importing the `hedera` package into our file, the `generate_account` function uses it to automatically create the new account. Hedera Python SDK has some standard functions that allow us to interact with the Hedera network. We use the operator keys to initialise `client`, and use that to sign and submit transactionsto the Hedera network. You can use any Hedera account as an operator; if you do not yet have one, you can create your own operator account on Hedera Portal.

Firstly, we generate new keys for the account we are going to create. We do so using the `AccountCreateTransaction` function from the `hedera` package. After we submit this transaction, we obtain its transaction receipt (as `receipt`), and then get the `account_id`, and `account_key` of the newly created account.

## References

- [Hedera Portal](https://hubs.ly/Q03Yhbqh0)
