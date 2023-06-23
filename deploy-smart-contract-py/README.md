# Deploy Smart Contract on Hedera Testnet using Python

This code snippet aims to show users how easy and immediate is to deploy a new Smart Contract on Hedera Network with Python Wrapper for Hedera SDK. Using a set of standard transactions, developers can easly and safely interact with Hedera Network using the SDK.

## Code

The architecture of the code is quite similar to the other snippet: we call the Operator Class as it's useful as gateway to Hedera Network, and throught Operator we are able to access a set of transactions and interactions with Hedera Network. In this case, we start from the Bytecode of a smart Contract. Once we write a new one using Solidity, we compile it. The output of this process is the Bytecode of the smart contract. 

The Bytecode is safely stored on the chain using a specific transaction that allows devs to store small-sized files on Hedera Chain, obtaining from the Transaction receipt the FileID. 

This FileID help us to retreive the Bytecode from the network, ensuring it has been successfully stored. Once we make sure everything is correct, we create the transaction required to deploy the smart contract using the operator keys, the ByteCode of the file (inputting the fileId) and parameters to keep control of the gas fees paid.

## References

- Hedera Portal: https://portal.hedera.com/register
- Deploy Smart Contract Doc: https://hedera.com/blog/how-to-deploy-smart-contracts-on-hedera-part-1-a-simple-getter-and-setter-contract
