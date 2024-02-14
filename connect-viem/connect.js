import { createPublicClient, http } from 'viem';
import { hederaTestnet } from 'viem/chains';
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
 
const web3Client = createPublicClient({
  chain: hederaTestnet,
  transport: http(rpcUrlHederatestnet, {
    batch: false,
  }),
});

async function main() {
    const [blockNumber, balance] = await Promise.all([
        web3Client.getBlockNumber(),
        web3Client.getBalance({
            address: '0x7394111093687e9710b7a7aeba3ba0f417c54474',
        }),
    ]);
    console.log('block number', blockNumber);
    console.log('balance', balance);
}

main();
