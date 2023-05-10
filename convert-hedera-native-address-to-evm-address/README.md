# Convert address from Hedera-native (`S.R.N`) format to EVM (`0x...`) format

When the shard (`S`) and realm (`R`) are both `0`,
only need to convert the number (`N`)
from decimal to hexadecimal,
and pad the left with leading zeroes.
This is also known as the **long-zero** address,
due to a large number of leading zeroes.

- Example Hedera-native address (`S.R.N`) format: `0.0.12345`
- Example EVM address (`0x...`) format: `0x0000000000000000000000000000000000003039`

However, if shard (`S`) and realm (`R`) are non-zero,
the conversion process is sliughtly more complex,
and each component needs to be
converted and padded separately,
then concatenated together.

- Example Hedera-native address (`S.R.N`) format: `17.2049.12345`
- Example EVM address (`0x...`) format: `0x0000001100000000000008010000000000003039`

## Code

The `convert.js` file in this directory demonstrates how to do the above.

- It makes use of `EntityIdHelper` from hedera-sdk-js
  to perform the above conversions
- `EntityIdHelper.fromString`
  splits `S.R.N` the string into 3 numbers
- `EntityIdHelper.toSolidityAddress`
  converts, pads, and concatenates the 3 numbers,
  resulting in the final output.

Try it out:

```shell
node ./convert.js
```

This should produce the following output:

```text
    '0.0.12345' --> '0000000000000000000000000000000000003039'
'17.2049.12345' --> '0000001100000000000008010000000000003039'
```

## References

- [HIP-583](https://hips.hedera.com/hip/hip-583)
- [How to convert a Hedera native address into an EVM address?](https://stackoverflow.com/q/76182970/194982)
- [`EntityIdHelper.fromString`](https://github.com/hashgraph/hedera-sdk-js/blob/d761dc49/src/EntityIdHelper.js#L195-L212)
- [`EntityIdHelper.toSolidityAddress`](https://github.com/hashgraph/hedera-sdk-js/blob/d761dc49/src/EntityIdHelper.js#L249-L259)
