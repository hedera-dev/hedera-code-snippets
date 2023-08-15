# Multisig Account

By default accounts have a single private key,
and that private key alone is allowed to sign transactions on behalf of an account.

On Hedera, accounts natively support the ability to have multiple private keys,
each of which is allowed to sign on behalf of the account.
The account determines how many of its constituent keys need to sign a transaction
for it the transaction to be considered valid.
This is known as the signature threshold.

## Code

See `multisig-1-of-2.js`.

We start with tasks that can be done without network interactions:

- First, we generate a new ED25519 key, and a new ECDSA key.
  These are private keys, and they will be used to create a 1-of-2 multisig account.
- Next, we create a `KeyList` that represents a 1 of 2 multisig threshold.
- This will involve the public keys corresponding to the private keys generated earlier,
  plus a number that represents a threshold value,
  meaning the minimum number of keys requeired to sign a transaction from this account.
  - Sample output: `multisigKeyList: {"threshold":1,"keys":"302a300506032b65700321001b053c356e89b2605e4d4ec3b3dc5c07f017d328b09c55a28f032b8fb6e62e38,302d300706052b8104000a03220002531497e8dc7c4431d5d4614a5df36396240508417180717156d3b1b4a8292466"}`
- Next, we use one of the keys to generate an account alias.
  - Sample output: `multisigAccountId: 0.0.486842`

Next, we create the account on network,
which has just one private key by default,
and update it to have 2 private keys with a 1-of-2 threshold:

- The account alias does not exist on network yet,
  and only exists on your computer.
- To convert the acount alias into an account,
  we can use any transaction that with the alias,
  after which that account will exist on network.
- Once we have an account that is on the network,
  we can update it via an `AccountUpdateTransaction`
- We use this to set the `KeyList` created earlier
  - Sample output: `makeMultisigTxRecord https://hashscan.io/testnet/transaction/0.0.1186@1692088071.802179548`

Finally, let's test that it works by signing several transactions:

- If we sign any transaction using both the private keys,
  that transaction succeeds
  - Sample output: `transfer2of2TxRecord https://hashscan.io/testnet/transaction/0.0.1186@1692088076.634619385`
- If we sign any transaction using only the ED25519 private key,
  that transaction still succeeds, because the 1-of-2 threshold is met
  - Sample output: `transfer1of2EdTxRecord https://hashscan.io/testnet/transaction/0.0.1186@1692088078.754599385`
- If we sign any transaction using only the ECDSA private key,
  that transaction still succeeds, because the 1-of-2 threshold is met
  - Sample output: `transfer1of2EcTxRecord https://hashscan.io/testnet/transaction/0.0.1186@1692088081.286349376`

## References

- [Hedera docs: Update an account](https://docs.hedera.com/hedera/sdks-and-apis/sdks/cryptocurrency/update-an-account)
- [Hedera docs: Create a key list](https://docs.hedera.com/hedera/sdks-and-apis/sdks/keys/create-a-key-list)
