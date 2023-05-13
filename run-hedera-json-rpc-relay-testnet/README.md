# Run Hedera JSON RPC Relay connected to Hedera Testnet

Perform the following steps to install, configure, and run
an instance of `hedera-json-rpc-relay` on your `localhost`.

(1)
Clone `hedera-json-rpc-relay` from with git:

```shell
git clone git@github.com:hashgraph/hedera-json-rpc-relay.git
```

(2)
`cd` into the `hedera-json-rpc-relay`, and in there create a `.env` file,
with the following contents:

```dotenv
HEDERA_NETWORK=testnet
OPERATOR_ID_MAIN=YOUR_OPERATOR_ID
OPERATOR_KEY_MAIN=YOUR_OPERATOR_KEY
CHAIN_ID=0x128
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/
```

(3)
Replace `YOUR_OPERATOR_ID` with a Hedera-native address (`S.R.N` format),
and `YOUR_OPERATOR_KEY` with the ED22519 private key corresponding to this address
(DER encoded private key).
You can obtain these from the Hedera Portal.

(4)
Install dependencies.

```shell
npm install
```

(5)
Run the server.

```shell
npm run start
```

(6)
You can now use `http://localhost:7546` as your JSON-RPC endpoint URL.
Note that interacting with this is interacting with the Hedera Testnet,
as under the hood, the server that you are running on `localhost`
is communicating with, and translating the messages from/to JSON-RPC:
- Hedera Mirror Nodes over REST APIs
- Hedera Consensus Nodes over gRPC

## Code

In the `rpc-requests.sh` file in this directory,
there will be several `curl` commands to perform JSON-RPC requests to
the RPC relay server that you have running on `localhost`.

(1)
RPC for `net_version`.

Should respond with a result of `0x128`,
which is `296` in decimcal, and equal to the chain ID of Hedera Testnet.
This verifies that our server has connected to the intended network.

(2)
RPC for `eth_blockNumber`

This gets the latest block number on the network.
The `result` property in the reponse is in hexadecimal,
and we pipe it through `tr` and `bc` to convert to its equivalent decimal value.

(3)
RPC for `eth_getBalance`

This gets the balance of the account,
whose address is specified in `ADDRESS_EVM` -
update this value to that of your own wallet.
The `result` property in the reponse is in hexadecimal,
and again, we pipe it through `tr` and `bc` to convert to its equivalent decimal value.

Note that unlike within Solidity, in the RPC layer,
the smallest unit is Weibars (10^-18 HBAR),
and not Tinybars (10^-8 HBAR).

## References

- [HIP-482](https://hips.hedera.com/hip/hip-482)
- [`hedera-json-rpc-relay` (Github)](https://github.com/hashgraph/hedera-json-rpc-relay/)
- [`hedera-json-rpc-relay` configuration (Github)](https://github.com/hashgraph/hedera-json-rpc-relay/blob/main/docs/configuration.md)
- [When running "hedera-json-rpc-relay", how to configure a connection to Hedera Testnet? (Stackoverflow)](https://stackoverflow.com/q/76069712/194982)
- [How can I connect to Hedera Testnet over RPC? ​(Stackoverflow)](https://stackoverflow.com/q/76153239/194982)
- [Hedera Portal](https://portal.hedera.com/)
- [Latest blocks (Hashscan)](https://hashscan.io/testnet/blocks)
