#!/usr/bin/env node

import crypto from 'node:crypto';
import standardEcies from 'standard-ecies';

import {
    Client,
    AccountId,
    PrivateKey,
    EvmAddress,
    PublicKey,
    TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// use default HCS topic if none is specified
const HCS_TOPIC_ID = process.env.HCS_TOPIC_ID || '0.0.3745107';
const eciesOptions = {
    // use all default options
    curveName: 'secp256k1',
};
let messageCount = 0;

// ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

// configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// entry point for execution of this example (called at the bottom of the file)
async function main() {
    console.log('Operator Account ID:', operatorId.toString());

    const accounts = new Array(5);
    for (let idx = 0; idx < 5; ++idx) {
        const id = process.env[`ACCOUNT_${idx}_ID`];
        const evmAddress = process.env[`ACCOUNT_${idx}_EVMADDRESS`];
        const privateKey = process.env[`ACCOUNT_${idx}_KEY`];
        const publicKey = process.env[`ACCOUNT_${idx}_PUBLICKEY`];
        const account = {
            id: AccountId.fromString(id),
            evmAddress: EvmAddress.fromString(evmAddress),
            publicKey: PublicKey.fromString(publicKey),
            privateKey: PrivateKey.fromStringDer(privateKey),
        };
        accounts[idx] = account;
    }

    const writerAccountIdx = randomInteger(0, 4);
    const readerAccountIdx = randomInteger(0, 4);
    const writerAccount = accounts[writerAccountIdx];
    const readerAccount = accounts[readerAccountIdx];
    const otherAccount = accounts[(readerAccountIdx + 1) % 5]; // guaranteed to not be the reader account

    // generate a new message --> originalMsg
    const originalMsg = generateMessage(readerAccount.privateKey);

    // encrypt originalMsg using readerAccount's public key --> encryptedMsg
    const readerAccountEcdh = crypto.createECDH(eciesOptions.curveName);
    readerAccountEcdh.setPrivateKey(readerAccount.privateKey.toBytesRaw());
    const encryptedMsg = await encrypt(originalMsg, readerAccountEcdh.getPublicKey(), eciesOptions);

    // senderAccount submits encryptedMsg to HCS topic --> hcsWriteMsg
    const hcsReadEncryptedMsgTxt = encryptedMsg.toString('base64url');
    const hcsWriteMsgRaw = JSON.stringify({
        from: writerAccount.id.toString(),
        to: readerAccount.id.toString(),
        msg: hcsReadEncryptedMsgTxt,
    });
    const msgSubmitTx = await new TopicMessageSubmitTransaction({
        topicId: HCS_TOPIC_ID,
        message: hcsWriteMsgRaw,
    }).execute(client);
    const msgSubmitTxReceipt = await msgSubmitTx.getReceipt(client);
    console.log(`${HCS_TOPIC_ID}#${msgSubmitTxReceipt.topicSequenceNumber.toString()}`);

    // readerAccount reads encryptedMsg from HCS topic --> hcsReadMsg
    // Ref: https://testnet.mirrornode.hedera.com/api/v1/docs/#/topics/getTopicMessageByIdAndSequenceNumber
    const mnApiUrl = `https://testnet.mirrornode.hedera.com/api/v1/topics/${HCS_TOPIC_ID}/messages/${msgSubmitTxReceipt.topicSequenceNumber.toString()}`
    console.log(mnApiUrl);
    await new Promise((resolve) => setTimeout(resolve, 6_000));
    const mnApiResponse = await fetch(mnApiUrl);
    const mnApiObject = await mnApiResponse.json();
    const hcsReadMsgRaw = Buffer.from(mnApiObject.message, 'base64');
    const hcsReadMsg = JSON.parse(hcsReadMsgRaw);
    const {
        from: hcsReadFrom,
        to: hcsReadTo,
        msg: hcsReadEncryptedMsg,
    } = hcsReadMsg;
    const hcsReadEncryptedMsgBuf = Buffer.from(hcsReadEncryptedMsg, 'base64url');

    // decrypt hcsReadMsg using readerAccount's private key --> decryptedMsg
    const decryptedMsg = await decrypt(hcsReadEncryptedMsgBuf, readerAccountEcdh, eciesOptions);

    // compare decryptedMsg to originalMsg
    console.log({
        originalMsg,
        encryptedMsg,
        hcsWriteMsgRaw,
        hcsReadMsgRaw,
        decryptedMsg,
    });

    // decrypt hcsReadMsg using readerAccount's private key --> FAILURE expected
    const otherAccountEcdh = crypto.createECDH(eciesOptions.curveName);
    otherAccountEcdh.setPrivateKey(otherAccount.privateKey.toBytesRaw());
    let decryptedMsgByOther;
    try {
        decryptedMsgByOther = await decrypt(hcsReadEncryptedMsgBuf, otherAccountEcdh, eciesOptions);
        console.log({
            decryptedMsgByOther,
        });
    } catch (ex) {
        console.log('Decryption by other account failed (expected).');
    }

    await client.close();
}

main();

function generateMessage() {
    messageCount += 1;
    return `ABC message #${messageCount} - ${(new Date().toISOString())}`;
}

async function encrypt(clearMsg, publicKey) {
    const clearMsgBuf = Buffer.from(clearMsg, 'utf8');
    return standardEcies.encrypt(publicKey, clearMsgBuf, eciesOptions);
}

async function decrypt(encryptedMsg, privateKey) {
     const decryptedMsgBuf = standardEcies.decrypt(privateKey, encryptedMsg, eciesOptions);
     return decryptedMsgBuf.toString('utf8');
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
