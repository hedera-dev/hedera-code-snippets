import {
    Client,
    AccountId,
    PrivateKey,
    KeyList,
    TopicCreateTransaction,
    Logger,
    TopicMessageSubmitTransaction,
    PublicKey,
    LogLevel,
    EvmAddress,
    Status,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

// Configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromStringDer(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setLogger(new Logger(LogLevel.Warn));

async function main() {
    console.log('Operator Account ID:', operatorId.toString());

    // Read in first 5 accounts from the `.env` file
    // You may generate these accounts programmatically using `../bip39-create-accounts/`
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

    // Create `hcsWriteKey` as a 1-of-5 multisig (`KeyList` containing 5 public keys, with a threshold of 1),
    // intended for use as a HCS Topic's submit key.
    const publicKeys = accounts.map((account) => {
        return account.publicKey;
    });
    const hcsWriteKey = new KeyList(publicKeys, 1);

    let hcsTopicCreateTxResponse = await new TopicCreateTransaction()
        .setSubmitKey(hcsWriteKey)
        .execute(client);
    // Only these particular accounts (that comprise the submit key)
    // are allowed to write to the topic.
    // This means that any 1 of the 5 accounts in `hcsWriteKey` are allowed to write.
    let hcsTopicCreateReceipt = await hcsTopicCreateTxResponse.getReceipt(client);
    let hcsTopicId = hcsTopicCreateReceipt.topicId;

    await new Promise((resolve) => setTimeout(resolve, 6_000));

    console.log('hcsTopicId', hcsTopicId.toString());
    console.log('hcsTopicHashScanUrl', `https://hashscan.io/testnet/topic/${hcsTopicId.toString()}`);

    // Attempt to write using an account that is *not* part of the HCS topic's submit key.
    // Even though this account *created* the topic, it is not allowed to write messages to it,
    // as it is not in the submit key for the topic.
    await submitHcsMessage(
        hcsTopicId,
        `hcsTopicWrite1Tx, signed by ${operatorId.toString()} (not in 1-of-5 ThresholdKey used as HCS submit key)`,
        operatorKey,
    );

    // Attempt to write using 2 accounts that *are* part of the HCS topic's submit key (selected at random).
    const randomAccount1Idx = randomInteger(0, 4);
    const randomAccount2Idx = randomInteger(0, 4);
    console.log([randomAccount1Idx, randomAccount2Idx]);
    await submitHcsMessage(
        hcsTopicId,
        `hcsTopicWrite2Tx, signed by ${operatorId.toString()} (account #${randomAccount1Idx} in 1-of-5 ThresholdKey used as HCS submit key)`,
        accounts[randomAccount1Idx].privateKey,
    );
    await submitHcsMessage(
        hcsTopicId,
        `hcsTopicWrite3Tx, signed by ${operatorId.toString()} (account #${randomAccount2Idx} in 1-of-5 ThresholdKey used as HCS submit key)`,
        accounts[randomAccount2Idx].privateKey,
    );

    await client.close();
}

main();

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function submitHcsMessage(
    hcsTopicId,
    messageStr,
    privateKey,
) {
    try {
        // Use the "manual transaction signing" flow (`freezeWith`, then `sign`, then `execute`).
        // This enables the transaction to be signed by a different account's private key.
        // (By default, the "operator account" initialised with the client will sign the transaction instead).
        const tx = await new TopicMessageSubmitTransaction({
            topicId: hcsTopicId,
            message: messageStr,
          })
          .freezeWith(client)
          .sign(privateKey);
        const txResponse = await tx.execute(client);
        const txReceipt = await txResponse.getReceipt(client);
        console.log('submitHcsMessage status:', txReceipt.status.toString());
        console.log('submitHcsMessage succeeded for', hcsTopicId.toString(), messageStr);
    } catch (ex) {
        console.error('submitHcsMessage failed for', hcsTopicId.toString(), messageStr);
        if (ex.toString().includes(Status.InvalidSignature.toString())) {
            console.log('Invalid Signature');
        } else {
            console.log(ex);
        }
    }
}
