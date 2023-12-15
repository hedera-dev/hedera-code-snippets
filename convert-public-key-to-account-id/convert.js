#!/usr/bin/env node

import {
    AccountId,
    PrivateKey,
    EntityIdHelper,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
import { base32 } from 'rfc4648';

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

    // Method 1: Use Mirror Node API
    // Now work backwards, and derive operatorId from operatorPublicKey
    // const operatorIdAlias = operatorPublicKey.toAccountId(0, 0);

    const accountInfoFetchUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${operatorPublicKey}&balance=false&limit=1&order=desc`;
    const accountInfoResponse = await fetch(accountInfoFetchUrl, { method: "GET" });
    const accountInfo = await accountInfoResponse.json();
    const operatorIdDerived = accountInfo?.accounts[0]?.alias;

    console.log('** Method 1: Use Mirror Node API');
    console.log(`         operatorId: ${operatorId}`);
    console.log(`accountInfoFetchUrl: ${accountInfoFetchUrl}`);
    console.log(`  operatorIdDerived: ${operatorIdDerived}`);

    // Method 2: Use IETF RFC 4648 base32 URL, as defined in HIP-32
    // Ref: https://hips.hedera.com/hip/hip-32
    // Ref: https://datatracker.ietf.org/doc/html/rfc4648#section-6
    const operatorPublicKeyRawStr = operatorPublicKey.toStringRaw();
    const protoBufPrefix = '1220';
    const bufferRaw = Buffer.from(`${protoBufPrefix}${operatorPublicKeyRawStr}`, 'hex');
    const operatorIdDerivedRaw = base32.stringify(bufferRaw, { pad: false });

    console.log('** Method 2: Use IETF RFC 4648 base32 URL, as defined in HIP-32');
    console.log(`             operatorId: ${operatorId}`);
    console.log(`operatorPublicKeyRawStr: ${operatorPublicKeyRawStr}`);
    console.log(`         protoBufPrefix: ${protoBufPrefix}`);
    console.log(`              bufferRaw: ${bufferRaw}`);
    console.log(`   operatorIdDerivedRaw: ${operatorIdDerivedRaw}`);
}

main();
