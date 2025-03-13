const ethers = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

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
    try {
        const blockNumber = await web3Provider.getBlockNumber()
        console.log('block number', blockNumber);
    } catch (error) {
        console.error('Error getting block number:', error);
    }
    
    try {
        // REPLACE WITH YOUR ADDRESS
        const balance = await web3Provider.getBalance('0x7203b2b56cd700e4df7c2868216e82bcca225423');
        console.log('balance', balance.toBigInt());
    } catch (error) {
        console.error('Error getting balance:', error);
    }
}

main();