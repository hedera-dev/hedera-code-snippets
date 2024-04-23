# BIP39 Create Accounts

This code snippet demonstrates how to generate
multiple ECDSA accounts on Hedera
using a BIP-39 seed phrase.
It outputs a `.env` file in the current working directory (`cwd`)
intended for use in this or other code snippets/ tutorials/ workshops.

Run the following command:

```shell
node ./create-accounts.js
```

This will generate multiple EVM addresses from a BIP39 seed phrase,
and then prompt you with the following:

```text
Do you wish to overwrite "/Users/user/code/hedera/hedera-code-snippets/bip39-create-accounts/.env"? (y/N):
```

If you answer `y`:

```text
OK, .env file written to "/Users/user/code/hedera/hedera-code-snippets/bip39-create-accounts/.env".`
```

If you answer otherwise:

```text
'OK, .env file contents output to console instead.
```

## Code

- `@ethersproject/hdnode` is imported as `ethersHdNode`
- `ethersHdNode.fromMnemonic` is used to parse the BIP39 seed phrase and the derivation path
- `TransferTransaction` is imported from the Hedera SDK
- A single transfer transaction that transfers HBAR (`addHbarTransfer`) from the operator account
  to each of the generated EVM addresses is signed by the operator account and submitted to the network
- A `.env` file is constructed as a string based on the outcome
  of `ethersHdNode.fromMnemonic` and `TransferTransaction`
- `node:readline` is used to prompt whether to allow the `.env` file to be overwritten

## References

- Stackoverflow: How can I use Hedera JS SDK to generate a set of ECDSA key-pairs based on a BIP-39 seed phrase and a custom derivation path? - https://stackoverflow.com/q/76002731/194982
- Adapted from original implementation in:
  - Hedera Docs: Hedera Smart Contracts Workshop - Setup - Step B4: Fund several Hedera EVM accounts - https://docs.hedera.com/hedera/tutorials/smart-contracts/hscs-workshop/setup#step-b4-fund-several-hedera-evm-accounts
  - Github demo repo: https://github.com/hedera-dev/hedera-smart-contracts-workshop/blob/main/intro/generate-evm-accounts.js
