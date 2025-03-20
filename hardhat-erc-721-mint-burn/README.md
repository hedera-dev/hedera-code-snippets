# How to use this example?

0. .env file

Provide your **[HEX ENCODED PRIVATE KEY](https://portal.hedera.com/)** for your **ECDSA account** in the .env file and provide a JSON RPC URL. You can use the [Hashio JSON RPC for testnet](https://www.hashgraph.com/hashio/).

1. Install dependencies:

```bash
npm install
```

2. Compile the contract:

```bash
npx hardhat compile
```

3. Run the "deploy.js" script:

```bash
npx hardhat run scripts/deploy.js --network testnet
```

4. Mint a token

```bash
npx hardhat run scripts/mint.js --network testnet
```

5. Burn a token

```bash
npx hardhat run scripts/burn.js --network testnet
```

That's it! You have deployed an ERC-721 contract, minted a token, and burned a token.