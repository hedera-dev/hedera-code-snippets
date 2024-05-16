# HCS Encrypted Messages

All data stored on a public DLT such as Hedera is readable by anyone with an Internet connection.
While Hedera does not provide any built in means to provide private data,
there is nothing stopping you from performing BYO end-to-end encryption.

This code snippet demonstrates how to use ECDSA secp256k1 `PrivateKey` objects from the Hedera SDK
in combination with `ECDH` from `node:crypto` and `standard-ecies` to BYO end-to-end encryption.
The encrypted messages are written to, and read from, a HCS topic.
However, only the intended recipient account is able to decrypt those messages.

This code snippet requires multiple accounts to be configured in the `.env` file.
Suggested: Use [`bip39-create-accounts`](../bip39-create-accounts) to generate a set of accounts in your `.env` file.

## Code

- `crypto.createECDH('secp256k1')` is used to intialise an ECDSA secp256k1 elliptic curve.
  This will be used for cryptographic operations, such as deriving a public key from a private key.
- The function, `encrypt(clearMsg, publicKey)`, takes a clear text message an encrypts it such that
  only the private key corresponding to the public key passed in may decrypt it.
- The function, `decrypt(encryptedMsg, privateKey)`, takes an encrypted message and decrypts it using
  a private key - which needs to correspond to the public key used in the `encrypt` function.
- The Hedera SDK's `TopicMessageSubmitTransaction` is used to write messages to a HCS Topic.
- The Hedera Mirror Node's `getTopicMessageByIdAndSequenceNumber` API is used to read messages from a HCS topic.
- The script invokes `encrypt` on a clear text message using the public key of a "reader account",
  then writes the encrypted version of the message to the HCS topic.
- The encrypted message is subsequently read by the "reader account",
  which **is** the intended recipient,
  and uses its private key to **successfully decrypt** the message stored on HCS.
- The encrypted message is subsequently also read by the "other account",
  which **is not** the intended recipient,
  and uses its private key to **unsuccessfully decrypt** the message stored on HCS.

## References

- Stackoverflow - How do I use `PrivateKey` and `PublicKey` from Hedera SDK to encrypt and decrypt data? : https://stackoverflow.com/a/78381680/194982
- Hedera Mirror Node API - `getTopicMessageByIdAndSequenceNumber` (interative docs) : https://testnet.mirrornode.hedera.com/api/v1/docs/#/topics/getTopicMessageByIdAndSequenceNumber
- Hedera Javascript SDK docs: `TopicMessageSubmitTransaction` : https://hashgraph.github.io/hedera-sdk-js/classes/index.TopicMessageSubmitTransaction.html
- Github - `standard-ecies` usage docs: https://github.com/bin-y/standard-ecies/blob/master/README.md#usage
