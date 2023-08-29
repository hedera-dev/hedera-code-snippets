# Multisig Account with Smart Contract as a Key

By default accounts have a single private key,
and that private key alone is allowed to sign transactions on behalf of an account.

On Hedera, accounts natively support the ability to have multiple private keys,
each of which is allowed to sign on behalf of the account.
The account determines how many of its constituent keys need to sign a transaction
for it the transaction to be considered valid.
This is known as the signature threshold.

Individual keys used to authorised transactions on behalf of an account on Hedera may be one of the following:
- EdDSA Ed25519 keys
- ECDSA secp256k1 keys
- Smart Contract identifier

In this code example, we demonstrate the use of one of the elliptic curve keys
in combination with a a smart contract identifier
in a 1-of-2 multisig scenario.
In other words, the account may be operated by signing transactions using *either*
an elliptic curve private key to sign the transaction; *or*
a smart contract invoke a child transaction on behalf of the account.

## Code

**See `.env.example`**

Copy this to `.env`, and fill in the operator account credentials.
You will also need to fill in the ID of an HTS fungible token,
that the operator account has some balance of.

**See `account.sol`**

Hedera Token Service (HTS) is exposed to Hedera Smart Contract Service (HSCS)
via a precompile (system contract) available at address `0x0167`.
This is initialised, along with its interface, in the constructor.

It also has just one function which is responsible for relaying a `transferToken`
call to HTS.

This smart contract is intended to act on behalf of an account,
in lieu of a signature on a transaction in its interactions with HTS,
by adding the smart contract's ID to the account's `KeyList`.

**See `multisig-sc-1-of-2.js`**

Run this command to compile the Solidity source code into EVM bytecode.

```shell
solcjs --bin --abi ./account.sol
```

This script starts off by uploading the EVM bytecode to Hedera File Service (HFS),
and subsequently deploying as a smart contract on HSCS.

The smart contract ID is obtained after deployment.

A `KeyList` is constructed using a randomly generated EdDSA key and the smart contract ID.

Then a new account is created and funded with HBAR using the same process as the
"Multisig Account" code snippet (linked below), and assigned this `KeyList`.
This new account can now be operated using either the EdDSA key or the smart contract.

Before the new account can do anything with the HTS fungible token,
it will need to be associated with that token,
and then hold some balance of those tokens, so we do so.

Next we invoke a HTS fungible token transfer directly from the account,
signing the transaction with the EdDSA key.

Next we invoke the smart contract, which indirectly invokes
the HTS fungible token transfer through its precompile (system contract).
Notably, this transaction is **unsigned** using any keys.
Instead, the smart contract is acting on behalf of the account itself,
and the transaction authorisation is based on the smart contract being in the account's `KeyList`,
in lieu of any signatures.

## References

- [Hedera code snippets: Multisig Account](../multisig-account/)
- [Hedera docs: Update an account](https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/update-an-account)
- [Hedera docs: Create a key list](https://docs.hedera.com/hedera/sdks-and-apis/sdks/keys/create-a-key-list)
