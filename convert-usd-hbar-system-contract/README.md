# Convert USD to HBAR using system contract

Pre-compiled functions are executed by the Hedera nodes,
and are typically lower-level constituent parts
of the wider Hedera services.

In the context of smart contracts,
access to these pre-compiled functions
comes in the form of system contracts.
These are assigned an address,
and have an exposed interface (ABI or Solidity `interface`),
however they are **not** actual smart contracts that have been deployed.
Rather they can be thought of as aliases
for those pre-compield functions.

`ExchangeRateSystemContract` is one of these system contracts,
and is used to convert USD to HBAR, or HBAR to US.
This is needed because various Hedera services are priced in USD,
but are paid for in gas (which is denominated in HBAR).
See the schedule of fees for various Hedera services.

Therefore *other* system contracts
(for example, `PrngSystemContract`),
uses this internally to determine the (variable) amount of gas
to charge the transaction when it is invoked.

Note that this exchange rate is not considered to be
accurate or current enough for exchanges or other similar use cases.

## Code

In the `exchange_rate.sol` file in this directory,
there is an interface for the system contract `IExchangeRate`,
and the pre-compiled functions for this are assigned the address `0x168`.

The interface `IExchangeRate` is copied from the specification in HIP-475.
The interface is initialised at the system contract's address
using `IExchangeRate(address(0x168));`.

The `convert` function makes used of the `tinycentsToTinybars` function
that is exposed by the system contract,
and doing some multiplication and division such that
the input value and output values are both specified in cents,
i.e. USD/100 and HBAR/100.

## References

- [HIP-475](https://hips.hedera.com/hip/hip-475)
- [How to get an exchange rate between USD and HBAR for use in Hedera application or smart contract? (Stackoverflow)](https://stackoverflow.com/q/72984870/194982)
- [`ExchangeRateSystemContract` on Hedera Testnet (Hashscan)](https://hashscan.io/testnet/account/0000000000000000000000000000000000000168)
- [Schedule of fees for Hedera Services](https://docs.hedera.com/hedera/networks/mainnet/fees)
- [Convert HBAR to USD (Coinbase)](https://www.coinbase.com/converter/hbar/usd) - Use to illustrate difference with a live exchange rate
