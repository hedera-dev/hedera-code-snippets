# HTS x EVM - NFTs on Hedera

This repo demonstrates how to create and manage NFTs on the Hedera network using smart contracts that leverage both the Hedera Token Service (HTS) and EVM capabilities. The project is structured as a three-part series, each focusing on different aspects of NFT management.

## Project Overview

The repository contains three main smart contracts with corresponding test suites:

1. **Part 1: Basic NFT Minting (`MyHTSToken.sol`)**

   - Demonstrates basic NFT creation and minting
   - Shows how to interact with Hedera Token Service
   - Basic token management operations

2. **Part 2: KYC and NFT Updates (`MyHTSTokenKYC.sol`)**

   - Implements KYC (Know Your Customer) functionality
   - Shows how to update NFT metadata and properties
   - Demonstrates token management with KYC requirements

3. **Part 3: Advanced Token Controls (`MyHTSTokenPFWD.sol`)**
   - Implements token pause functionality
   - Demonstrates account freeze capabilities
   - Shows how to wipe tokens from accounts
   - Handles token deletion

---

# Hedera HTS NFT Samples (Hardhat 3 + Ethers v6)

This repository contains three end-to-end examples of creating and operating Hedera HTS NFTs via smart contracts and the Hedera JSON-RPC Relay:

- MyHTSToken (basic HTS NFT wrapper)
- MyHTSTokenKYC (HTS NFT wrapper with KYC key management)
- MyHTSTokenPFWD (HTS NFT wrapper with Pause/Freeze/Wipe/Admin keys)

Each example includes:

- Solidity contracts
- Foundry-style unit tests (Solidity) that validate precompile-agnostic logic
- Hardhat + Mocha integration tests (TypeScript) that run on Hedera testnet
- Simple deploy/mint/burn scripts (TypeScript)

## Table of Contents

1. [Setup](#setup)
2. [Part 1: MyHTSToken (basic)](#part-1-myhtstoken-basic)
3. [Part 2: MyHTSTokenKYC (with-kyc-key)](#part-2-myhtstokenkyc-with-kyc-key)
4. [Part 3: MyHTSTokenPFWD (pausefreeze-wipeadmin)](#part-3-myhtstokenpfwd-pausefreeze-wipeadmin)
5. [Running tests](#running-tests)
6. [Notes and tips](#notes-and-tips)

---

## Setup

Configure Hardhat Keystore variables and install dependencies.

```bash
# 1) Configure Hardhat keystore variables (no .env required)
npx hardhat keystore set HEDERA_RPC_URL
npx hardhat keystore set HEDERA_PRIVATE_KEY

# Recommended values:
# - HEDERA_RPC_URL: https://testnet.hashio.io/api
# - HEDERA_PRIVATE_KEY: HEX-encoded ECDSA private key from the Hedera Portal

# 2) Install dependencies
npm install
```

Build contracts any time with:

```bash
npx hardhat build
```

---

## Part 1: MyHTSToken (basic)

Minimal HTS NFT wrapper supporting mint and burn.

- Contract: `contracts/MyHTSToken.sol`
- Solidity tests: `test/MyHTSToken.t.sol`
- Mocha tests: `test/MyHTSToken.ts`
- Scripts: `scripts/deploy.ts`, `scripts/mint.ts`, `scripts/burn.ts`

Commands:

```bash
# Build
npx hardhat build

# Run all tests
npx hardhat test

# Run only Solidity or only Mocha tests
npx hardhat test solidity
npx hardhat test mocha test/MyHTSToken.ts
```

Deploy, mint, burn:

```bash
# Deploy the wrapper and create the HTS collection
npx hardhat run scripts/deploy.ts --network testnet

# Mint an NFT with metadata to your signer (ensure association)
npx hardhat run scripts/mint.ts --network testnet

# Approve (if needed) and burn the NFT
npx hardhat run scripts/burn.ts --network testnet
```

---

## Part 2: MyHTSTokenKYC (with KYC key)

Wrapper that owns the KYC key and enforces KYC for minting.

- Contract: `contracts/MyHTSTokenKYC.sol`
- Solidity tests: `test/MyHTSTokenKYC.t.sol`
- Mocha tests: `test/MyHTSTokenKYC.ts`
- Scripts: `scripts/deployKYC.ts`, `scripts/mintNFTKYC.ts`, `scripts/burnNFTKYC.ts`

Commands:

```bash
# Build
npx hardhat build

# Run tests
npx hardhat test
# Or specifically:
npx hardhat test mocha test/MyHTSTokenKYC.ts
npx hardhat test solidity
```

Run scripts:

```bash
# Deploy the KYC wrapper and create the HTS collection
npx hardhat run scripts/deployKYC.ts --network testnet

# Associate the signer, grant KYC via wrapper, then mint
npx hardhat run scripts/mintNFTKYC.ts --network testnet

# Approve (if needed) and burn via wrapper
npx hardhat run scripts/burnNFTKYC.ts --network testnet
```

Tip: After updating the KYC key (e.g., rotating to the signer’s compressed public key), the wrapper will no longer be able to grant KYC.

---

## Part 3: MyHTSTokenPFWD (Pause/Freeze/Wipe/Admin)

Wrapper that forwards multiple administrative capabilities: pause/unpause, freeze/unfreeze, wipe, delete.

- Contract: `contracts/MyHTSTokenPFWD.sol`
- Solidity tests: `test/MyHTSTokenPFWD.t.sol`
- Mocha tests: `test/MyHTSTokenPFWD.ts`
- Scripts: `scripts/deployPFWD.ts`, `scripts/mintNFTPFWD.ts`, `scripts/burnNFTPFWD.ts`

Commands:

```bash
# Build
npx hardhat build

# Run tests
npx hardhat test
# Or specifically:
npx hardhat test mocha test/MyHTSTokenPFWD.ts
npx hardhat test solidity
```

Run scripts:

```bash
# Deploy the PFWD wrapper and create the HTS collection
npx hardhat run scripts/deployPFWD.ts --network testnet

# Associate the signer (via token.associate()) and mint
npx hardhat run scripts/mintNFTPFWD.ts --network testnet

# Approve (if needed) and burn via wrapper
npx hardhat run scripts/burnNFTPFWD.ts --network testnet
```

---

## Running tests

All tests:

```bash
npx hardhat test
```

Run only Solidity or TypeScript test sets:

```bash
# Foundry-style Solidity tests (don’t call HTS precompiles)
npx hardhat test solidity

# TypeScript integration tests (execute on Hedera testnet)
npx hardhat test mocha
```

Run a single test file:

```bash
# Basic wrapper
npx hardhat test mocha test/MyHTSToken.ts

# KYC wrapper
npx hardhat test mocha test/MyHTSTokenKYC.ts

# PFWD wrapper
npx hardhat test mocha test/MyHTSTokenPFWD.ts
```

You’ll be prompted for your keystore password when connecting:

```
[hardhat-keystore] Enter the password: ************
```

---

## Notes and tips

- Association: Accounts must associate with the HTS token before receiving NFTs. Scripts/tests call `token.associate()` on-chain via ethers. If already associated, some nodes may revert—this is expected and is safely ignored in scripts/tests.
- Metadata size: HTS limits token metadata to 100 bytes. Scripts/tests enforce this when minting with metadata.
- Precompiles locally: HTS precompiles are not available on a local EVM. Solidity tests avoid calling `createNFTCollection`; use the TypeScript tests/scripts against Hedera testnet to exercise full flows.
- Approvals: Burn flows approve the wrapper for the specific token ID (or use operator approval) so the wrapper can pull to treasury and burn.
- Keys and security: In the KYC/PFWD examples, the wrapper initially holds specialized keys (KYC/Pause/Freeze/Wipe/Admin). Rotating a key (e.g., KYC) removes the wrapper’s authority for that action by design.

Happy building on Hedera!
