import { ethers } from 'ethers';
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

const web3Provider = new ethers.providers.JsonRpcProvider({
    url: rpcUrlHederatestnet,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
});

async function main() {
    web3Provider.getBlockNumber()
        .then((blockNumber) => {
            console.log('block number', blockNumber);
        })
        .catch(console.error);

    web3Provider.getBalance(
        // Replace this with any account address in EVM address format
        '0x7394111093687e9710b7a7aeba3ba0f417c54474')
        .then((balance) => {
            console.log('balance', balance.toBigInt());
        })
        .catch(console.error);
}

main();
