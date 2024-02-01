# Connect to Hedera Testnet via EthersJs

This code snippets demonstrates how to connect to Hedera Testnet
using EthersJs (v5).

## Code

Copy the `.env.example` file to `.env`,
then edit it to add the URL for a JSON-RPC endpoint for Hedera Testnet.

To obtain this URL, see the [JSON-RPC connections documentation](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections/).

In the `connect.js` file in this directory,
an instance of `ethers.providers.JsonRpcProvider` is initialised
using the JSON-RPC endpoint.
The CORS HTTP header (`Access-Control-Allow-Origin`)
is set to be maximally permissive.
This is needed for in-browser usage, but not needed for usage in NodeJs.

Subsequently a couple of RPCs are invoked to obtain the block number,
and the HBAR balance of a specified account.
These are simply to verify that the connection works properly.

## References

- [How can I connect to Hedera Testnet using web3.js or ethers.js? (Stackoverflow)](https://stackoverflow.com/a/76181451/194982)
