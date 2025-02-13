# Connect to Hedera Testnet via Viem

This code snippets demonstrates how to connect to Hedera Testnet
using Viem.

## Code

Copy the `.env.example` file to `.env`,
then edit it to add the URL for a JSON-RPC endpoint for Hedera Testnet.

To obtain this URL, see the [JSON-RPC connections documentation](https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections/).

In the `hederaTestnet.js` file in this directory, a `hederaTestnetChain` is being created.
This is essentially configuration for the RPC connection.

The `HelloHedera.sol` file in this directory is the test solidity smart contract to be deployed/read from. `contract.js` is the related ABI.

Subsequently a couple of RPCs can be invoked to deploy a contract (`deploy-contract.js`), read from a contract (`read-contract.js`) and subscribe to an event (`subscribe-to-event.js`).

## Scripts

- **`deploy-contract.js`**  
  Deploy a smart contract via viem

- **`read-contract.js`**  
  Demonstrates how to call a read-only function on a deployed contract (e.g. `get_message`) using Viem’s `readContract`. This uses the JSON-RPC method `eth_call`, which is supported on Hashio.

- **`subscribe-to-event.js`**  
  Illustrates how to listen for contract events/logs in real time using `watchContractEvent`. This periodically checks for new logs matching the given ABI event. Note that your contract must actually emit events for any logs to appear. If the node’s log support is partial, event subscription may be limited in functionality. 

## References

- [How can I connect to Hedera Testnet using web3.js or ethers.js? (Stackoverflow)](https://stackoverflow.com/a/77912632/194982)
