# DApp built with Viem connected to Hedera Testnet

This code snippet demonstrates how to build a minimal DApp using Viem
that connects to Hedera Testnet.

## Running the DApp

Ensure that you have Metamask installed, with network config,
and some accounts, on Hedera Testnet already set up.

Ensure that you have [Bun](https://bun.sh) installed -
this is used for TS to JS transpilation and bundling.

```shell
# transpile, bundle, and copy static assets
npm run build

# run http server
npm run serve

```

Then visit `http://127.0.0.1:8111/` in your browser.

## Code

The `dapp.ts` file in this directory contains all the application code.

A network config for `hederaTestnetChain` is defined manually here.
Change the value of `rpcUrls.default.http` to match what you have configured in Metamask.

Subsequently `web3Client` obejct is created,
which is a combination of `viem.walletClient` and `viem.publicClient`.

This `web3Client` is used to query multiple read-only JSON-RPCs;
and is also used to `sendTransaction` (when the "Transfer!" button is clicked),
which transferred the specified amount of HBAR to the specified "to" recipient address.

## References

- [How can I connect to Hedera Testnet using web3.js or ethers.js? (Stackoverflow)](https://stackoverflow.com/a/77912632/194982)
