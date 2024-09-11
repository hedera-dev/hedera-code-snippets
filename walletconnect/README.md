# Simple WalletConnect Integration

This super simple WalletConnect integration is perfect for testing and quickly answering questions about wallet integrations. It provides a streamlined setup for developers to:

- Quickly connect to any WalletConnect-compatible wallet with minimal configuration.
- Experiment with wallet interactions for debugging or educational purposes.

Ideal for anyone looking to understand the basics of wallet integrations or troubleshoot specific wallet-related queries fast and efficiently.

Note: This code snipped is a stripped down version of the Hedera Vanilla JS dApp Template.


## How To
Run these commands to run the program:
```
npm install
```
```
npm run dev
```

## Code


See `main.js`

This script demonstrates how to authenticate with WalletConnect. It also holds a TokenAssociateTransaction Function for testing.


See `index.html`

Simple Frontend to authenticate with WalletConnect


#### Example output

In the browser console, after clicking the "Associate" button:
```
Token 0.0.xxx associated successfully.
```



## A note on SDK version

The `TokenUpdateNftsTransaction` will throw a `TypeError` as it doesn't seem to be implemented yet. 
[Github issue](https://github.com/hashgraph/hedera-wallet-connect/issues/265)



## References

- [Hedera Vanilla JS dApp Template](https://github.com/hedera-dev/hedera-vanilla-js-dapp-template)
  This code snipped is an adaption of the Hedera Vanilla JS dApp Template
- [Wallet to backend](https://discord.com/channels/1098212475343732777/1270079078069702828/1270079078069702828)
- [Wallet choice for integration](https://discord.com/channels/1098212475343732777/1272388750902694010/1272388750902694010)
- [Frontend to Backend authentication](https://discord.com/channels/1098212475343732777/1269972514801455246/1270426617843286206)
  Questions on Discord on how to integrate with a wallet
  [Hedera Docs: Create a dApp with WalletConnect](https://docs.hedera.com/hedera/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect)
  Official Hedera tutorial providing a step-by-step guide to creating a simple dApp with WalletConnect
- [Github repo: WalletConnect](https://github.com/hashgraph/hedera-wallet-connect)
  WalletConnect Github repository
- [WalletConnect Docs](https://docs.walletconnect.com/advanced/multichain/rpc-reference/hedera-rpc)
  Official WalletConnect Docs