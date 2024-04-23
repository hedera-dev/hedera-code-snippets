# HCS Encrypted Messages

All data stored on a public DLT such as Hedera is readable by anyone with an Internet connection.
While Hedera does not provide any built in means to provide private data,
there is nothing stopping you from performing BYO end-to-end encryption.

This code snippet demonstrates how to use ECDSA secp256k1 `PrivateKey` objects from the Hedera SDK
in combination with `ECDH` from `node:crypto` and `standard-ecies` to BYO end-to-end encryption.
The encrypted messages are written to, and read from, a HCS topic.
However, only the intended recipient account is able to decrypt those messages.

## Code

(Point out specific files in the code snippet, and explain their implementation, and how it works)

## References

- (Links to relevant HIPs, Stackoverflow questions, documentation, etc)
