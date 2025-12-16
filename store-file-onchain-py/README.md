# Store file on Hedera Network using Python

Hedera has an built-in function that allow developers to store and access their small-sized files completely on-chain, with multiple benefits in term of UX and safety. This function is often associated with storage of smart contract bytecodes.

This code snippet was contributed by [astrid-net](https://github.com/astrid-net).

## Code

After importing the `hedera` package into our file, the `createFile` function uses it retrieve the balance of an account. Hedera Python SDK has some standard functions that allow us to interact with the Hedera network. We use the operator keys to initialise `client`, and use that to sign and submit transactionsto the Hedera network. You can use any Hedera account as an operator; if you do not yet have one, you can create your own operator account on Hedera Portal.

We save the text context of the file in `f_content`.
This bytecode is is then stored as a file using `FileCreateTransaction`,
and we obtain the `fileId` from the transaction receipt.
Subsequently we use `FileContentsQuery` retrieve the contents of the file again,
by specifying the same `fileId`.

## References

- [Hedera Portal](https://hubs.ly/Q03Yhbqh0)
