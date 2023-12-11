#!/usr/bin/env node

import {
    AccountId,
    PrivateKey,
    EntityIdHelper,
} from "@hashgraph/sdk";
import dotenv from 'dotenv';

dotenv.config();

function convert(hederaNativeAddress) {
    const { shard, realm, num } =
        EntityIdHelper.fromString(hederaNativeAddress);
    return EntityIdHelper.toSolidityAddress([shard, realm, num]);
}

async function main() {
    // ensure required environment variables are available
    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
        throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
    }
    
    // configure client using environment variables
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorPrivateKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
    const operatorPublicKey = operatorPrivateKey.publicKey;

    // Now work backwards, and derive operatorId from operatorPublicKey
    const operatorIdAlias = operatorPublicKey.toAccountId(0, 0);

    const accountInfoFetchUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${operatorPublicKey}&balance=false&limit=1&order=desc`;
    const accountInfoResponse = await fetch(accountInfoFetchUrl, { method: "GET" });
    const accountInfo = await accountInfoResponse.json();
    const operatorIdDerived = accountInfo?.accounts[0]?.account;

    console.log(`       operatorId: ${operatorId}`);
    console.log(`  operatorIdAlias: ${operatorIdAlias}`);
    console.log(`operatorIdDerived: ${operatorIdDerived}`);
}

main();
