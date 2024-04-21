#!/usr/bin/env node

import {
    Client,
    AccountId,
    PrivateKey,
    TransferTransaction,
} from '@hashgraph/sdk';
import {
    HDNode as ethersHdNode,
} from '@ethersproject/hdnode';

import dotenv from 'dotenv';

dotenv.config();

// TODO read these in as CLI params
const NUM_ACCOUNTS = 6;
const AMOUNT_PER_ACCOUNT = 10;
const HD_PATH = "m/44'/60'/0'/0";
const BIP39_SEED_PHRASE = 'brand inmate syrup license harvest duck resource gloom chaos memory twist cake';

// Ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

// Configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    console.log('Operator Account ID:', operatorId.toString());

    const hdNodeRoot = ethersHdNode.fromMnemonic(BIP39_SEED_PHRASE);
    const accounts = new Array(NUM_ACCOUNTS);
    for (let idx = 0; idx < NUM_ACCOUNTS; idx++) {
        const accountHdPath = `${HD_PATH}/${idx}`;
        const hdNodeX = hdNodeRoot.derivePath(accountHdPath);

        // Convert private key from ethersjs format to hedera sdk format
        const privateKeyX = PrivateKey.fromStringECDSA(hdNodeX.privateKey);
        accounts[idx] = {
            id: '',
            evmAddress: privateKeyX.publicKey.toEvmAddress(),
            hdPath: accountHdPath,
            publicKey: privateKeyX.publicKey.toStringDer(),
            privateKey: privateKeyX.toStringDer(),
        };
        console.log(`EVM account #${idx} generated.`);
        console.log(`#${idx}     HD path: ${accountHdPath}`);
        console.log(`#${idx} Private key: ${privateKeyX.toStringDer()}`);
        console.log(`#${idx}  Public key: ${privateKeyX.publicKey.toStringDer()}`);
        console.log(`#${idx} EVM address: ${privateKeyX.publicKey.toEvmAddress()}`);
    }

    let multiTransferTx = new TransferTransaction()
        .addHbarTransfer(operatorId, (0 - AMOUNT_PER_ACCOUNT) * NUM_ACCOUNTS);
        accounts.forEach((account) => {
            // TransferTransaction's interface allows multiple operations until frozen
            multiTransferTx = multiTransferTx.addHbarTransfer(account.evmAddress, AMOUNT_PER_ACCOUNT);
        });
    multiTransferTx = multiTransferTx.freezeWith(client);
    const transferTxSign = await multiTransferTx.sign(operatorKey);
    const transferTxResponse = await transferTxSign.execute(client);
    const transferTxId = transferTxSign.transactionId.toString();
    console.log('Transfer transaction ID', transferTxId);

    /*const transferTxReceipt =*/ await transferTxResponse.getReceipt(client);
    await new Promise((resolve) => { setTimeout(resolve, 6_000) });

    // Perform a mirror node query to foind the accounts that have received the transfer
    // Ref: https://testnet.mirrornode.hedera.com/api/v1/docs/#/transactions/getTransactionById
    // https://testnet.mirrornode.hedera.com/api/v1/transactions/0.0.1521-1713705558-648902461?nonce=0
    const [idPart1, idPart2] = transferTxId.split('@');
    const transferTxIdMnFormat = `${idPart1}-${idPart2.replace('.', '-')}`;
    const transferTxMnResponse = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/transactions/${transferTxIdMnFormat}?nonce=0`);
    const transferTxMnResult = await transferTxMnResponse.json();
    const transfers = transferTxMnResult.transactions[0].transfers;
    const recipientTransfers = transfers.filter((transfer) => {
        // Expect other receipts as well, who receive the fees paid for processing the transaction
        return (transfer.amount === AMOUNT_PER_ACCOUNT * 100_000_000);
    });
    if (recipientTransfers.length !== NUM_ACCOUNTS) {
        console.warn('WARNING: Unexpected number of recipient transfers:', recipientTransfers.length);
        console.log(transfers);
    }
    for (let idx = 0; idx < NUM_ACCOUNTS; ++idx) {
        accounts[idx].id = recipientTransfers[idx].account;
    }
    const accountsEnvFileFormat = accounts.map((account, idx) => {
        return [
            `ACCOUNT_${idx}_ID="${account.id}"`,
            `ACCOUNT_${idx}_EVMADDRESS="${account.evmAddress}"`,
            `ACCOUNT_${idx}_KEY="${account.privateKey}"`,
            `ACCOUNT_${idx}_PUBLICKEY="${account.publicKey}"`,
        ].join('\n');
    });
    console.log(accountsEnvFileFormat.join('\n'));

    await client.close();
}

main();
