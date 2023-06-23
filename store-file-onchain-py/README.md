# Store file on Hedera Network using Python

Hedera has an in-built function that allow developers to store and access their small-sized files completely on-chain, with multiple benefits in term of UX and safety. This function is often associated with storage of Smart Contracts Bytecodes.

## Code
The architecture of the code is quite similar to the other snippet: we call the Operator Class as it's useful as gateway to Hedera Network, and throught Operator we are able to access a set of transactions and interactions with Hedera Network. First of all, we create a string that contains the bytes we are going to store on Hedera. 

Using an in-built function of Hedera SDK wrapped in PYthon, we are able to store this string, setting up the max fee we are going to pay for this transaction. To make sure that our transaction was correctly executed, we get the Txn receipt, get the File Id and make sure the content stored is the same contained in the variable. 

## References

- Hedera Portal: https://portal.hedera.com/register
