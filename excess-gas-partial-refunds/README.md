# Throttling through partial excess gas refunds

The way that gas refunds work when excess gas is sent to a transaction
work in a different manner on Hedera compared to other EVM-compatible networks.

- In Ethereum, `gasUsed = gasConsumed`;
therefore `gasLimit` is not used as an input in determining the value of `gasConsumed`.
- In Hedera, on the other hand, `gasUsed = max(gasConsumed, gasLimit * 0.8)`;
therefore the `gasLimit` is used as an input in determining the value of `gasConsumed`.

This is done to throttle over-reservation of gas,
by penalising that behaviour.
The full explanation for this is in HIP-185.

Therefore, this incentivises the users submitting transactions to
specify the "correct" amount of gas.
Since the exact value of gas consumed cannot be known ahead of time,
the recommended/ usual way to accomplish this is by making an `eth_estimateGas` RPC request.

- When doing this on Hedera, however, the value returned is way too large
- In fact, it turns out that the RPC relay returns static values instead of performing calculations
- This shortcoming has been detailed in HIP-584, and has an upcoming implementation

## Code

In the `expend_gas.sol` file in this directory,
we have the smart contract used for demo purposes by the script.
This has been deployed at Hedera Testnet at `0x9C58D0159495F7a8853A24574f2B8F348a72424c`,
and this is what the script interacts with.

In the `gas-refunds.js` file in this directory,
we have a script that uses ethers.js to interact with the smart contract.
It invoked the same function 3 times in a row,
with the exact same arguments.
In fact, the only difference is the `gasLimit` value.

- 1st time: (equal to) `gasLimit` is 100% of the value of `gasEstimate`.
- 2nd time: (small excess) `gasLimit` is 110% of the value of `gasEstimate`.
- 2nd time: (tiny fraction) `gasLimit` is 6.4% of the value of `gasEstimate`.

The difference in the `gasUsed` values between the 1st time and the 2nd time (small excess scenario)
demonstrates the implementation of HIP-185 in play.

The difference in the `gasUsed` values between the 1st time and the 3rd time (tiny fraction scenario)
demonstrates the current lack of implementation for HIP-584.

## References

- [HIP-185](https://hips.hedera.com/hip/hip-185)
- [HIP-584](https://hips.hedera.com/hip/hip-584)
- [Large discrepancy in `gasUsed` values in near-identical transactions on Hedera - why? (Stackoverflow)](https://stackoverflow.com/q/76250641/194982)
- [Why does `eth_estimateGas` on Hedera return an unexpectedly high value? (Stackoverflow)](https://stackoverflow.com/q/76251324/194982)
- [Current implementation of `estimateGas` RPC Relay (github)](https://github.com/hashgraph/hedera-json-rpc-relay/blob/ffb51611/packages/relay/src/lib/eth.ts#L436-L464)
- [Upcoming implementation of `estimateGas` RPC Relay (github)](https://github.com/hashgraph/hedera-mirror-node/issues/4463)
- [Deployed instance of the `ExpendSomeGasDemo` smart contract (Hashscan)](https://hashscan.io/testnet/contract/0.0.4616849)
