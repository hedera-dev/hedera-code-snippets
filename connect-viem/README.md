# Connect to Hedera Testnet via Viem

This code snippets demonstrates how to connect to Hedera Testnet
using Viem.

## Code

Copy the `.env.example` file to `.env`,
then edit it to add the URL for a JSON-RPC endpoint for Hedera Testnet.

To obtain this URL, see the [JSON-RPC connections documentation](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections/).

In the `connect.js` file in this directory,
an instance of `viem.Chain` is created as `hederaTestnetChain`.
This is essentially configuration for the RPC connection.
The cirtical part within this is `rpcUrls.default.http`,
where the JSON_RPC endpoint value is set.

Subsequently a couple of RPCs are invoked to obtain the block number,
and the HBAR balance of a specified account.
These are simply to verify that the connection works properly.

## Additional Scripts

- **`deploy-contract.js`**  
  Deploy a smart contract via viem

- **`read-contract.js`**  
  Demonstrates how to call a read-only function on a deployed contract (e.g. `get_message`) using Viem’s `readContract`. This uses the JSON-RPC method `eth_call`, which is supported on Hashio.

- **`subscribe-to-event.js`**  
  Illustrates how to listen for contract events/logs in real time using `watchContractEvent`. This periodically checks for new logs matching the given ABI event. Note that your contract must actually emit events for any logs to appear. If the node’s log support is partial, event subscription may be limited in functionality. 

## References

- [How can I connect to Hedera Testnet using web3.js or ethers.js? (Stackoverflow)](https://stackoverflow.com/a/77912632/194982)
