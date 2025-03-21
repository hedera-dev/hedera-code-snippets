# How to use this example?

## Table of Contents
1. [Setup](#setup)
2. [Tutorial Part 1: Deploy an ERC-721 contract - Mint and Burn a token](#tutorial-part-1-deploy-an-erc-721-contract---mint-and-burn-a-token)
3. [Tutorial Part 2: Access Control, Token URI, pause, and transfer](#tutorial-part-2-access-control-token-uri-pause-and-transfer)

# Setup

### 1. Dotenv file

Provide your **[HEX ENCODED PRIVATE KEY](https://portal.hedera.com/)** for your **ECDSA account** in the .env file and provide a JSON RPC URL. You can use the [Hashio JSON RPC for testnet](https://www.hashgraph.com/hashio/).

```dotenv
OPERATOR_KEY=
RPC_URL=https://testnet.hashio.io/api
```

### 2. Install dependencies:

```bash
npm install
```

# Tutorial Part 1: Deploy an ERC-721 contract - Mint and Burn a token

### 1. Compile the contract:

```bash
npx hardhat compile
```

### 2. Run the "deploy.js" script:

```bash
npx hardhat run scripts/deploy.js --network testnet
```

### 3. Mint a token

```bash
npx hardhat run scripts/mint.js --network testnet
```

### 4. Burn a token

```bash
npx hardhat run scripts/burn.js --network testnet
```

That's it! You have deployed an ERC-721 contract, minted a token, and burned a token.

# Tutorial Part 2: Access Control, Token URI, pause, and transfer

### 1. Recompile the contract:

```bash
npx hardhat compile
```

### 2. Run the "deploy-advanced.js" script:

```bash
npx hardhat run scripts/deploy-advanced.js --network testnet
```

> Don't forget to copy the contract address and replace this address in the other `...-advanced.js` scripts.

### 3. Mint a token with Token URI set

```bash
npx hardhat run scripts/mint-advanced.js --network testnet
```

### 4. Pause the contract

```bash
npx hardhat run scripts/pause-advanced.js --network testnet
```

### 5. Unpause and transfer a token

```bash
npx hardhat run scripts/transfer-advanced.js --network testnet
```

That's it! You have deployed an ERC-721 contract with access control, token URI, pause, and transfer functionality.