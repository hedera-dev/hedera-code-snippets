# ERC20 Example with Foundry

This repository demonstrates how to write, test, deploy, and verify an ERC20 smart contract on the [Hedera](https://hedera.com/) network using [Foundry](https://book.getfoundry.sh/).

## Features

- ERC20 token contract using OpenZeppelin
- Ownership and minting logic
- Comprehensive tests with Foundry
- Automated deployment scripts
- Smart contract verification on [HashScan](https://hashscan.io/)
- Step-by-step developer documentation

---

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A Hedera testnet account and ECDSA private key ([guide](https://hubs.ly/Q03Yhbqh0))

### Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/hedera-dev/hedera-code-snippets.git
cd foundry-erc20
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
forge script script/HederaToken.s.sol:HederaTokenScript --rpc-url testnet --broadcast
```

**After deployment:**

- **CONTRACT_ADDRESS**: The address printed as `HederaToken deployed to: ...`
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

### Check ERC20 Balance

```bash
cast call $CONTRACT_ADDRESS "balanceOf(address)" $MY_ADDRESS --rpc-url $RPC_URL
```

### Transfer Tokens

Create a new recipient address (for demo):

```bash
export RECIPIENT_ADDRESS=$(cast wallet address $(openssl rand -hex 32))
```

Send 100 tokens:

```bash
cast send $CONTRACT_ADDRESS "transfer(address,uint256)" $RECIPIENT_ADDRESS 100e18 \
    --private-key $OPERATOR_KEY \
    --rpc-url $HEDERA_RPC_URL
```

### Mint Tokens (Owner only)

Mint 500 tokens to any address (owner must call this):

```bash
cast send $CONTRACT_ADDRESS "mint(address,uint256)" $RECIPIENT_ADDRESS 500e18 \
    --private-key $OPERATOR_KEY \
    --rpc-url $HEDERA_RPC_URL
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
src/HederaToken.sol         # ERC20 contract source
script/HederaToken.s.sol # Deployment script
test/HederaToken.t.sol      # Test suite
foundry.toml                # Foundry config
.env                        # Environment variables
```

---

## Resources

- [Hedera documentation](https://docs.hedera.com/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [HashScan](https://hashscan.io/)
