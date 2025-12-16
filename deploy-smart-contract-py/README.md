# Deploy Smart Contract on Hedera Testnet using Python

This code snippet aims to show users how to easily deploy a new smart contract on Hedera network with Hedera Python SDK. Using a set of standard transactions, developers can easly and safely interact with Hedera network.

This code snippet was contributed by [astrid-net](https://github.com/astrid-net).

## Code

After importing the `hedera` package into our file, the `deployContract` function uses it to deploy a smart contract. Hedera Python SDK has some standard functions that allow us to interact with the Hedera network. We use the operator keys to initialise `client`, and use that to sign and submit transactionsto the Hedera network. You can use any Hedera account as an operator; if you do not yet have one, you can create your own operator account on Hedera Portal.

We take the compiled bytecode output from `solc` (the Solidity compiler),
and save that in `byteCode`.
This bytecode is is then stored as a file using `FileCreateTransaction`,
and we obtain the `fileId` from the transaction receipt.
Subsequently the file is deployed as a smart contract using `ContractCreateTransaction`,
by specifying the same `fileId`.

## References

- [Hedera Portal](https://hubs.ly/Q03Yhbqh0)
- Deploy Smart Contract Doc: https://hedera.com/blog/how-to-deploy-smart-contracts-on-hedera-part-1-a-simple-getter-and-setter-contract
