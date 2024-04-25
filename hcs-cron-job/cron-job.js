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

const topicId = '0.0.3745107';
const limitPerTask = 10;
const limitConsecutiveQueries = 3;
let lastSequenceNumber = 0;
let lastTimeStamp = '0.000000000';

async function cronTask() {
    console.log(new Date().toISOString(), 'cronTask');

    let consecutiveQueries = limitConsecutiveQueries;
    do {
        consecutiveQueries -= 1;

        // Perform a Mirror Node API request
        const mnApiQueryStr =
            `timestamp=gt%3A${lastTimeStamp}&limit=${limitPerTask}&encoding=base64&order=asc`;
        const mnApiUrl =
            `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?${mnApiQueryStr}`;
        const mnApiResponse = await fetch(mnApiUrl);
        const mnApiObject = await mnApiResponse.json();
        if (mnApiObject.messages.length < 1) {
            console.log(`No new messages detected in ${topicId}`);
            break;
        }

        // Iterate over any newly received messages
        mnApiObject.messages.forEach((msg) => {
            const sequenceNumber = msg.sequence_number;
            const timestamp = msg.consensus_timestamp;
            const parsedMessage = Buffer.from(msg.message, 'base64').toString();

            // Keep track of sequence number and timestamp of last retrieved message in topic
            // for subsequent requests
            if (sequenceNumber > lastSequenceNumber) {
                lastSequenceNumber = sequenceNumber;
                lastTimeStamp = timestamp;
            }

            // Process message
            processMessage(parsedMessage, sequenceNumber, timestamp);
        });

        const nextLinks = mnApiObject.links && mnApiObject.links.next;
        console.log('nextLinks', nextLinks);
        if (!nextLinks) {
            break;
        }
    } while (consecutiveQueries > 0)
}

async function cronComplete() {
    console.log(new Date().toISOString(), 'cronComplete');
}

async function processMessage(parsedMessage, sequenceNumber, timestamp) {
    console.log(`#${sequenceNumber} - ${parsedMessage}`);
}
