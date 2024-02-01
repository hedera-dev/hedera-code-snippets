import { createPublicClient, http, defineChain } from 'viem';
import dotenv from 'dotenv';

dotenv.config();

/*
Set up a JSON-RPC endpoint for this project to connect to Hedera Testnet.
Ref: https://docs.hedera.com/hedera/tutorials/more-tutorials/json-rpc-connections/

Then set that as the value of `RPC_URL` in the `.env` file.
*/
const rpcUrlHederatestnet = process.env.RPC_URL;
if (!rpcUrlHederatestnet || !rpcUrlHederatestnet.startsWith('http')) {
  throw new Error(
    'Missing or invalid value in RPC_URL env var',
  );
}

const hederaTestnetChain = defineChain({
    id: 0x128,
    name: 'HederaTestnet',
    nativeCurrency: {
        symbol: 'ℏ',
        name: 'HBAR',
        decimals:  18,
    },
    rpcUrls: {
        default: {
            http: [rpcUrlHederatestnet],
        },
    },
    blockExplorers: {
        default: {
            name: 'Hashscan',
            url: 'https://hashscan.io/testnet'
        },
    },
    contracts: {},
});
 
const web3Client = createPublicClient({
  chain: hederaTestnetChain,
  transport: http(),
});

async function main() {
    const blockNumber = await web3Client.getBlockNumber();
    console.log('block number', blockNumber);

    const balance = await web3Client.getBalance({
        address: '0x7394111093687e9710b7a7aeba3ba0f417c54474',
    });
    console.log('balance', balance);
}

main();
