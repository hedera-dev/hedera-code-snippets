# Run tests by forking Hedera mainnet locally with Foundry

This repository demonstrates how to write, test, deploy, and verify an ERC721 smart contract on the [Hedera](https://hedera.com/) network using [Foundry](https://book.getfoundry.sh/). It also includes details on how to fork the hedera mainnet/testnet network locally for local testing.

## Features

- ERC721 token contract using OpenZeppelin
- Ownership and minting logic
- Comprehensive tests with Foundry
- Automated deployment scripts
- Fork Hedera network using [Hedera Forking Library](https://github.com/hashgraph/hedera-forking)
- Smart contract verification on [HashScan](https://hashscan.io/)
- Step-by-step developer documentation

---

## Getting Started

### Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/hedera-dev/hedera-code-snippets.git
cd foundry-mainnet-fork-tutorial
forge install
```

### Configure Environment

Copy `.env.example` file in the project root and modify with your own credentials:

```bash
cp .env.example .env
```

---

## Usage

### Build Contracts

```bash
forge build
```

### Deploy to Hedera Mainnet

```bash
forge script script/MyToken.s.sol --rpc-url mainnet --broadcast
```

**After deployment:**

- **CONTRACT_ADDRESS**: The address printed as `Token deployed to: ...`
- Save this for contract interaction and verification.

```bash
export CONTRACT_ADDRESS=<your-contract-address>
```

---

## Interacting With Your Contract

First, load your `.env` file:

```bash
source .env
```

Let's also save our address for future use:

```bash
export MY_ADDRESS=$(cast wallet address $HEDERA_PRIVATE_KEY)
```

### Mint NFT (Owner only)

Mint 1 NFT to any address (owner must call this):

```bash
forge script script/MintMyToken.s.sol --rpc-url mainnet --broadcast
```

### Burn NFT

Burn the NFT from your address (owner must call this):

```bash
forge script script/BurnMyToken.s.sol --rpc-url mainnet --broadcast
```

---

### Verify on HashScan

```bash
forge verify-contract $CONTRACT_ADDRESS src/HederaToken.sol:HederaToken \
    --chain-id 296 \
    --verifier sourcify \
    --verifier-url "https://server-verify.hashscan.io/" \
    --constructor-args $(cast abi-encode "constructor(address)" $MY_ADDRESS)
```

### Run Tests on the forked network

You may need to update the contract address on `test/MyToken.t.sol` to your own deployed contract on mainnet.

```bash
forge test --fork-url https://mainnet.hashio.io/api
```

We can also pin a specific block for reproducibility:

```bash
forge test --fork-url https://mainnet.hashio.io/api --fork-block-number 84800456
```

We are using block number 84800456 for this testing because the contract from above(i.e. `0x07F6D65f9454EA2dff99bF8C2C1De918Fcd27416` was deployed on block `84800456`). We could also use any block number above this but we cannot use a block number below this number because the contract had not been deployed then.

---

## File Structure

```
src/MyToken.sol         # ERC721 contract source
script/DeployMyToken.s.sol # Deployment script
script/MintMyToken.s.sol   # Minting script
script/BurnMyToken.s.sol.  # Burning script
test/MyToken.t.sol      # Test suite
foundry.toml                # Foundry config
.env                        # Environment variables
```

---

## Resources

- [Hedera documentation](https://docs.hedera.com/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [HashScan](https://hashscan.io/)
