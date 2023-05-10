# Obtain "block" number based on timestamp

- Get the timestamp in seconds since UNIX epoch
  that you wish to find the block for, using `date`.
- Make a "list blocks" (`/api/v1/blocks`) API request
  to Hedera mirror nodes, with the following query params:
  - `timestamp=gte:${TIMESTAMP}`:
    This will find all blocks that have been created *after* the specified timestamp.
  - `order=asc`:
    This is to list blocks in order of increasing timestamp.
  - `limit=1`:
    This will restrict the results returned to be only one block.
  - When these query params are used in combination,
    the result will contain only the *first* block
    that occurs *after* the specified timestamp.
- Convert the block number from decimal to (base 10) to hexadecimal (base 16).
- Make an `eth_getBlockByNumber` JSON-RPC request to an instance of
  `hedera-json-rpc-relay` specifying this block number.

## Code

The file `obtain.sh` in this directory demonstrates the above.

## References

- [HIP-415](https://hips.hedera.com/hip/hip-415)
- [How can I obtain a block number programmatically on Hedera? (Stackoverflow)](https://stackoverflow.com/q/76217594/194982)
- [Hedera mirror node API `/api/v1/blocks` (list blocks) Swagger](https://testnet.mirrornode.hedera.com/api/v1/docs/#/blocks/listBlocks)
- [Hedera mirror node API `/api/v1/blocks` (list blocks) docs](https://docs.hedera.com/hedera/sdks-and-apis/rest-api#api-v1-blocks)
