# Convert public key to account ID (`S.R.N` format)

## Code

The `convert.js` file in this directory demonstrates how to do the above.

- It reads in the account ID and private key from a `.env` file
- It derives a public key from the private key
- Next it queries a Mirror Node API with the public key
- Finally it parses the Miror Node API response to extract the account ID

Try it out:

```shell
node ./convert.js
```

This should produce the following output:

```text
       operatorId: 0.0.1186
  operatorIdAlias: 0.0.302a300506032b657003210030a028ee7fd716c438de818a8831ed2235d0f85e430ab036dbfac173eb50aef9
operatorIdDerived: 0.0.1186
```

## References

- [HIP-583](https://hips.hedera.com/hip/hip-583)
- [Mirror Node API docs](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [Mirror Node API swagger](https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts)
