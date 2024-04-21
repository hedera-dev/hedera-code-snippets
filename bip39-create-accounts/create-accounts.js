#!/usr/bin/env node

import path from 'node:path';

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

// TOO read these in as CLI params
const NUM_ACCOUNTS = 2;
const AMOUNT_PER_ACCOUNT = 100;
const HD_PATH = "m/44'/60'/0'/0";
const BIP39_SEED_PHRASE = 'brand inmate syrup license harvest duck resource gloom chaos memory twist cake';

// ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

// configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

//entrypoint for execution of this example (called at the bottom of the file)
async function main() {
    console.log('Operator Account ID:', operatorId.toString());

    const hdNodeRoot = ethersHdNode.fromMnemonic(BIP39_SEED_PHRASE);
    const privateKeys = [];
    for (let accountIdx = 0; accountIdx < NUM_ACCOUNTS; accountIdx++) {
        const accountHdPath = `${HD_PATH}/${accountIdx}`;
        const hdNodeX = hdNodeRoot.derivePath(accountHdPath);

        // convert private key from ethersjs format to hedera sdk format
        const privateKeyX = PrivateKey.fromStringECDSA(hdNodeX.privateKey);
        privateKeys.push(privateKeyX);
        console.log(`EVM account #${accountIdx} generated.`);
        console.log(`#${accountIdx}     HD path: ${accountHdPath}`);
        console.log(`#${accountIdx} Private key: ${privateKeyX.toStringDer()}`);
        console.log(`#${accountIdx}  Public key: ${privateKeyX.publicKey.toStringDer()}`);
        console.log(`#${accountIdx} EVM address: ${privateKeyX.publicKey.toEvmAddress()}`);
    }

    let multiTransferTx = new TransferTransaction()
        .addHbarTransfer(operatorId, (0 - AMOUNT_PER_ACCOUNT) * NUM_ACCOUNTS);
    privateKeys.forEach((privateKeyX) => {
        const evmAddressX = privateKeyX.publicKey.toEvmAddress();

        // TransferTransaction's interface allows multiple operations until frozen
        multiTransferTx = multiTransferTx.addHbarTransfer(evmAddressX, AMOUNT_PER_ACCOUNT);
    });
    multiTransferTx = multiTransferTx.freezeWith(client);
    const transferTxSign = await multiTransferTx.sign(operatorKey);
    await transferTxSign.execute(client);
    console.log('Transfer transaction ID', transferTxSign.transactionId.toString());

    await client.close();
}

main();
