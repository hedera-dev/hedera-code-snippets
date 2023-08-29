import {
    Client,
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    AccountBalanceQuery,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

// configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// entry point for execution of this example (called at the bottom of the file)
async function main() {
    console.log('Operator Account ID', operatorId.toString());

    const ftCreateTx = await new TokenCreateTransaction()
        .setTokenName("snippetft")
        .setTokenSymbol("SNIPPET")
        .setDecimals(2)
        .setInitialSupply(1_000_000)
        .setTreasuryAccountId(operatorId)
        .setAdminKey(operatorKey)
        .setFreezeDefault(false)
        .freezeWith(client);
    const ftCreateTxSigned = await ftCreateTx.sign(operatorKey);
    const ftCreateTxSubmitted = await ftCreateTxSigned.execute(client);
    const ftCreateTxRecord = await ftCreateTxSubmitted.getRecord(client);
    console.log('ftCreateTxRecord', transactionHashscanUrl(ftCreateTxRecord));

    const ftId = ftCreateTxRecord.receipt.tokenId;
    console.log('ftId', ftId.toString());

    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(operatorId);
    const balanceQueryResponse = await balanceQuery.execute(client);
    const operatorFtBalance = balanceQueryResponse.tokens.get(ftId);
    console.log('operatorFtBalance', operatorFtBalance);

    process.exit(0);
}

function transactionHashscanUrl(txRecord) {
    const txId = txRecord.transactionId.toString();
    return `https://hashscan.io/testnet/transaction/${txId}`;
}

main();
