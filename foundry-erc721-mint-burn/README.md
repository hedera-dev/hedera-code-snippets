# ERC721 Example with Foundry

This repository demonstrates how to write, test, deploy, and verify an ERC721 smart contract on the [Hedera](https://hedera.com/) network using [Foundry](https://book.getfoundry.sh/).

## Features

- ERC721 token contract using OpenZeppelin
- Ownership and minting logic
- Comprehensive tests with Foundry
- Automated deployment scripts
- Smart contract verification on [HashScan](https://hashscan.io/)
- Step-by-step developer documentation

---

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A Hedera testnet account and ECDSA private key ([guide](https://portal.hedera.com))

### Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/hedera-dev/hedera-code-snippets.git
cd foundry-erc721-mint-burn
forge install
```

### Configure Environment

Copy `.env.example` file in the project root and modify with your own credentials:

```bash
cp .env.example .env
```

```
HEDERA_RPC_URL=https://testnet.hashio.io/api
HEDERA_PRIVATE_KEY=0x-your-private-key
```

---

## Usage

### Build Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy to Hedera Testnet

```bash
forge script script/MyToken.s.sol --rpc-url testnet --broadcast
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
# Make sure to update the file by replacing with 
# your own contract address
forge script script/MintMyToken.s.sol --rpc-url testnet --broadcast
```

### Burn NFT

Burn the NFT from your address (owner must call this):

```bash
# Make sure to update the file by replacing with 
# your own contract address
forge script script/BurnMyToken.s.sol --rpc-url testnet --broadcast
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
