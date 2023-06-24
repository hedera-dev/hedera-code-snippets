# Store file on Hedera Network using Python

Hedera has an built-in function that allow developers to store and access their small-sized files completely on-chain, with multiple benefits in term of UX and safety. This function is often associated with storage of smart contract bytecodes.

This code snippet was contributed by [astrid-net](https://github.com/astrid-net).

## Code

The architecture of the code is quite similar to the other snippets: We call the Operator class as it's useful as gateway to Hedera networks, and through Operator we are able to access a set of transactions and interactions with Hedera networks. First of all, we create a string that contains the bytes we are going to store on Hedera. 

Using a built-in function of Hedera Python SDK, we are able to store this string, setting up the max fee we are going to pay for this transaction. To make sure that our transaction was correctly executed, we get the Txn receipt, get the FileId and make sure the content stored is the same contained in the variable. 

## References

- Hedera Portal: https://portal.hedera.com/register
