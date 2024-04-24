#!/usr/bin/env node

import {
    Client,
    AccountId,
    PrivateKey,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

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

    await client.close();
}

main();
