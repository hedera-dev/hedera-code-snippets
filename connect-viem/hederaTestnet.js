import 'dotenv/config'
import { defineChain } from 'viem'

const { RPC_URL } = process.env

export const hederaTestnetChain = defineChain({
  id: 0x128,
  name: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'ℏ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hashscan',
      url: 'https://hashscan.io/testnet',
    },
  },
  contracts: {},
  testnet: true,
})
