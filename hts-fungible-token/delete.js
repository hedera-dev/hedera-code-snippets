import {
    Client,
    AccountId,
    PrivateKey,
    TokenDeleteTransaction,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ensure required environment variables are available
if (!process.env.OPERATOR_ID ||
    !process.env.OPERATOR_KEY ||
    !process.env.HTS_FT_ID) {
        throw new Error('Must set required keys in .env');
}

// configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// entry point for execution of this example (called at the bottom of the file)
async function main() {
    const ftDeleteTx = await new TokenDeleteTransaction()
        .setTokenId(process.env.HTS_FT_ID)
        .freezeWith(client);
    const ftDeleteTxSigned = await ftDeleteTx.sign(operatorKey);
    const ftDeleteTxSubmitted = await ftDeleteTxSigned.execute(client);
    const ftDeleteTxRecord = await ftDeleteTxSubmitted.getRecord(client);
    console.log('ftDeleteTxRecord', transactionHashscanUrl(ftDeleteTxRecord));

    process.exit(0);
}

function transactionHashscanUrl(txRecord) {
    const txId = txRecord.transactionId.toString();
    return `https://hashscan.io/testnet/transaction/${txId}`;
}

main();
