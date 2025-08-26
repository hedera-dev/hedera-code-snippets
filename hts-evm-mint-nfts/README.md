# HTS x EVM - NFTs on Hedera

This repository demonstrates how to create and manage NFTs on the Hedera network using smart contracts that leverage both the Hedera Token Service (HTS) and EVM capabilities. The project is structured as a three-part series, each focusing on different aspects of NFT management.

## Project Overview

The repository contains three main smart contracts with corresponding test suites:

1. **Part 1: Basic NFT Minting (`1-MintNFT.sol`)**
   - Demonstrates basic NFT creation and minting
   - Shows how to interact with Hedera Token Service
   - Basic token management operations

2. **Part 2: KYC and NFT Updates (`2-KYCandUpdateNFT.sol`)**
   - Implements KYC (Know Your Customer) functionality
   - Shows how to update NFT metadata and properties
   - Demonstrates token management with KYC requirements

3. **Part 3: Advanced Token Controls (`3-PauseFreezeWipeDelete.sol`)**
   - Implements token pause functionality
   - Demonstrates account freeze capabilities
   - Shows how to wipe tokens from accounts
   - Handles token deletion

## Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- A Hedera ECDSA testnet account with test HBAR

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hedera-dev/hts-evm-hybrid-mint-nfts.git
   cd hts-evm-hybrid-mint-nfts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Fill in the following ECDSA private key variables in `.env`:
     - `PRIVATE_KEY`: Your Hedera account's private key
     - `PRIVATE_KEY_2`: Secondary account private key for testing

## Project Structure

```
├── contracts/
│   ├── 1-MintNFT.sol
│   ├── 2-KYCandUpdateNFT.sol
│   ├── 3-PauseFreezeWipeDelete.sol
│   └── hedera/
│       ├── HederaTokenService.sol
│       ├── IHederaTokenService.sol
│       ├── KeyHelper.sol
│       └── HederaResponseCodes.sol
├── test/
│   ├── 1-MintNFT.ts
│   ├── 2-KYCandUpdateNFT.ts
│   └── 3-PauseFreezeWipeDelete.ts
```

## Running Tests

Each part of the series has its own test suite. You can run them individually or all at once.

Run all tests:
```bash
npx hardhat test
```

Run specific test suites:
```bash
# Part 1: Basic NFT Minting
npx hardhat test test/1-MintNFT.ts

# Part 2: KYC and NFT Updates
npx hardhat test test/2-KYCandUpdateNFT.ts

# Part 3: Advanced Token Controls
npx hardhat test test/3-PauseFreezeWipeDelete.ts
```

To see gas usage reports, prefix any test command with `REPORT_GAS=true`:
```bash
REPORT_GAS=true npx hardhat test
```

## Development

This project uses Hardhat as the development environment. Common Hardhat tasks are available:

```bash
npx hardhat help
npx hardhat compile
npx hardhat clean
npx hardhat node
```

## Dependencies

- `@hashgraph/sdk`: Hedera JavaScript SDK
- `@openzeppelin/contracts`: Smart contract library
- `@nomicfoundation/hardhat-toolbox`: Hardhat development tools
- `hardhat`: Ethereum development environment
- `dotenv`: Environment variable management




------------------
npm i -D "github:hashgraph/hedera-smart-contracts"
