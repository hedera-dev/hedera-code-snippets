# HCS Topic Permissioned Write

All messages submitted to a HCS topic may be read by anyone,
as the data is publicly visible.

However, the creator of a HCS topic can set its initial configuration
such that only a particular key can write to it.
If that key is a `SimpleKey`, only a single account may write to it,
and all other accounts may not do so.
If that key is a `ThresholdKey`, multiple accounts
(whose `Simple Key`s are used to compose the `ThresholdKey`)
may write to the HCS topic,
and any other accounts may not do so.

This code snippets demonstrates the use of the latter,
with a 1-of-5 `ThresholdKey`.

## Instructions

In the `.env` file (copy from `.env.example`), you will see several entries of this format.

To save yourself from the tedium of creating multiple accounts manually,
you may wish to use the `bip39-create-accounts` code snippet from this repo.
To do so, while in this directory, run the following command:

```shell
node ../bip39-create-accounts/create-accounts.js
```

This will generate several accounts,
and write/ overwrite the `.env` file in this directory with the following format
for each account generated:

```shell
ACCOUNT_0_ID="CREATE_AN_ID"
ACCOUNT_0_EVMADDRESS="CREATE_AN_EVMADDRESS"
ACCOUNT_0_KEY="CREATE_AN_KEY"
```

## Code

- 5 accounts are read in from the `.env` file
- `hcsWriteKey` is initialised as a `KeyList` which includes 5 public keys, and a *threshold* of 1
  - This configuration can be referred to as a 1-of-5 multisig
  - This means that a single private key, which corresponds to one of these 5 public keys,
    can sign a transaction and have that transaction pass the authorisation requirements of the `hcsWriteKey`
- A `TopicCreateTransaction` is used which sets a *Submit Key* as `hcsWriteKey`
  - This means that this topic does not allow any account to submit messages to it
  - Instead, in this case *only* `hcsWriteKey`-authorised accounts may submit messages to the topic
- Subsequently the script attempts to use `operatorKey`
  to sign a `TopicMessageSubmitTransaction` and submit to this topic
  - This transaction is rejected, as the operator account is not in `hcsWriteKey`
  - Thus the message **is not** allowed to be written to the topic
- Subsequently the script attempts to use 2 accounts selected at random (from the `.env` file)
  to sign a `TopicMessageSubmitTransaction` and submit to this topic
  - These transactions are accepted, as their public keys are in `hcsWriteKey`,
    and able to pass the 1-of-5 requirement.
  - Thus the message **is** allowed to be written to the topic

## References

- Hedera docs - Submit message to private topic: https://docs.hedera.com/hedera/tutorials/consensus/submit-message-to-private-topic
- Hedera docs - Create a key list (outdated): https://docs.hedera.com/hedera/sdks-and-apis/deprecated/sdks/keys/create-a-key-list
- Hedera docs - Create a threshold key (outdated): https://docs.hedera.com/hedera/sdks-and-apis/deprecated/sdks/keys/create-a-threshold-key
- Hedera docs - Manually sign a transaction: https://docs.hedera.com/hedera/sdks-and-apis/sdks/transactions/manually-sign-a-transaction
