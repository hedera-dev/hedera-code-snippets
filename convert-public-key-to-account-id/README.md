# Convert public key to long account ID format

## Code

The `convert.js` file in this directory demonstrates how to do the above.

Try it out:

```shell
node ./convert.js
```

This performs the conversion using 2 distinct methods:

For the first method, which queries the Mirror Node APIs,
this should produce the following output:

- It reads in the account ID and private key from a `.env` file
- It derives a public key from the private key
- Next it queries a Mirror Node API with the public key
- Finally it parses the Mirror Node API response to extract the account ID

```text
** Method 1: Use Mirror Node API
         operatorId: 0.0.1186
accountInfoFetchUrl: https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=302a300506032b657003210030a028ee7fd716c438de818a8831ed2235d0f85e430ab036dbfac173eb50aef9&balance=false&limit=1&order=desc
  operatorIdDerived: CIQDBIBI5Z75OFWEHDPIDCUIGHWSENOQ7BPEGCVQG3N7VQLT5NIK56I
```

For the second method, which performs the conversion locally
using the process described in HIP-32,
this should produce the following output:

- It uses the same public key obtained in Method 1
- Next it prepends `0x1220` to it to mimic protobuf serialisation
- Finally applies a IETF RFC 4648 `base32url` conversion, as specified in HIP-32

```text
** Method 2: Use IETF RFC 4648 base32 URL, as defined in HIP-32
             operatorId: 0.0.1186
operatorPublicKeyRawStr: 30a028ee7fd716c438de818a8831ed2235d0f85e430ab036dbfac173eb50aef9
         protoBufPrefix: 1220
   operatorIdDerivedRaw: CIQDBIBI5Z75OFWEHDPIDCUIGHWSENOQ7BPEGCVQG3N7VQLT5NIK56I
```

## References

- [HIP-32: Auto Account Creation](https://hips.hedera.com/hip/hip-32)
- [IETF RFC 4648 `base32url`](https://datatracker.ietf.org/doc/html/rfc4648#section-6)
- [HIP-583: Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)
- [Mirror Node API docs](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)
- [Mirror Node API swagger](https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listAccounts)
- [Stackoverflow: How can I convert a Hedera Account ID Alias (hexadecimal) into a Hedera Account ID Alias (characters only)?](https://stackoverflow.com/q/77657721/194982)
