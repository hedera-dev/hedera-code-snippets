#!/usr/bin/env node

import { CronJob } from 'cron';
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

    const cronJob = CronJob.from({
        // once every 5 seconds
        cronTime: '*/5 * * * * *',

        // job to execute each cycle
        onTick: cronTask,

        // job to execute when job is terminated
        onComplete: cronComplete,

        // whether to start the job immediately
        start: true,

        // time based on
        timeZone: 'Asia/Singapore'
    });

    // start the cron job
    cronJob.start();

    await new Promise((resolve) => setTimeout(resolve, 60_000));

    // stop the cron job
    cronJob.stop();

    await client.close();
}

main();

async function cronTask() {
    console.log(new Date().toISOString(), 'cronTask TODO impl me');
}
async function cronComplete() {
    console.log(new Date().toISOString(), 'cronComplete TODO impl me');
}
