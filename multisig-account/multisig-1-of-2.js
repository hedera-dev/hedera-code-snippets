import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    TransferTransaction,
    TransactionRecordQuery,
    KeyList,
    AccountUpdateTransaction,
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

//entrypoint for execution of this example (called at the bottom of the file)
async function main() {
    console.log('Operator Account ID:', operatorId.toString());

    // generate a new ED25519 key
    const edKey = PrivateKey.generateED25519();

    // generate a new ECDSA key
    const ecKey = PrivateKey.generateECDSA();

    // create a `KeyList` that represents a 1 of 2 multisig threshold
    const multisigPublicKeys = [edKey.publicKey, ecKey.publicKey];
    const multisigKeyList = new KeyList(multisigPublicKeys, 1);
    console.log('multisigKeyList:', multisigKeyList.toString());

    // use one of the keys to generate an account alias
    const accountAlias = edKey.publicKey.toAccountId(0, 0);

    // create new account from account alias using a `TransferTransaction`
    const createAccountTx = new TransferTransaction()
        .addHbarTransfer(operatorId, new Hbar(-70))
        .addHbarTransfer(accountAlias, new Hbar(70))
        .freezeWith(client);
    const createAccountTxSigned = await createAccountTx.sign(operatorKey);
    const createAccountTxSubmitted = await createAccountTxSigned.execute(client);
    const createAccountTxRecord = await createAccountTxSubmitted.getRecord(client);
    const createAccountTxRecordWithChildren = await new TransactionRecordQuery()
        .setTransactionId(createAccountTxRecord.transactionId)
        .setIncludeChildren(true)
        .execute(client);
    const multisigAccountId =
        createAccountTxRecordWithChildren?.children[0]?.receipt?.accountId;
    console.log('multisigAccountId:', multisigAccountId.toString());

    // Update account to use this `KeyList`, via an `AccountUpdateTransaction`.
    // This replaces the single signature with a the 1 of 2 multisig
    const makeMultisigTx = new AccountUpdateTransaction()
        .setAccountId(multisigAccountId)
        .setKey(multisigKeyList)
        .freezeWith(client);
    const makeMultisigTxSignedByOneKey = await makeMultisigTx.sign(edKey);
    const makeMultisigTxSignedByAllKeys = await makeMultisigTxSignedByOneKey.sign(ecKey);
    const makeMultisigTxSubmitted = await makeMultisigTxSignedByAllKeys.execute(client);
    const makeMultisigTxRecord = await makeMultisigTxSubmitted.getRecord(client);
    console.log('makeMultisigTxRecord', transactionHashscanUrl(makeMultisigTxRecord));

    // Sign a `TransferTransaction` using both the ED25519 key and ECDSA key,
    // then attempt to execute it
    const transfer2of2Tx = new TransferTransaction()
        .addHbarTransfer(multisigAccountId, new Hbar(-12))
        .addHbarTransfer(operatorId, new Hbar(12))
        .freezeWith(client);
    const transfer2of2TxSignedPartial = await transfer2of2Tx.sign(edKey);
    const transfer2of2TxSignedFull = await transfer2of2TxSignedPartial.sign(ecKey);
    const transfer2of2TxSubmitted = await transfer2of2TxSignedFull.execute(client);
    const transfer2of2TxRecord = await transfer2of2TxSubmitted.getRecord(client);
    console.log('transfer2of2TxRecord', transactionHashscanUrl(transfer2of2TxRecord));

    // Sign a  `TransferTransaction` using the ED25519 key only,
    // then attempt to execute it
    const transfer1of2EdTx = new TransferTransaction()
        .addHbarTransfer(multisigAccountId, new Hbar(-23))
        .addHbarTransfer(operatorId, new Hbar(23))
        .freezeWith(client);
    const transfer1of2EdTxSigned = await transfer1of2EdTx.sign(edKey);
    const transfer1of2EdTxSubmitted = await transfer1of2EdTxSigned.execute(client);
    const transfer1of2EdTxRecord = await transfer1of2EdTxSubmitted.getRecord(client);
    console.log('transfer1of2EdTxRecord', transactionHashscanUrl(transfer1of2EdTxRecord));

    // Sign a `TransferTransaction` using the ECDSA key only,
    // then attempt to execute it
    const transfer1of2EcTx = new TransferTransaction()
        .addHbarTransfer(multisigAccountId, new Hbar(-34))
        .addHbarTransfer(operatorId, new Hbar(34))
        .freezeWith(client);
    const transfer1of2EcTxSigned = await transfer1of2EcTx.sign(ecKey);
    const transfer1of2EcTxSubmitted = await transfer1of2EcTxSigned.execute(client);
    const transfer1of2EcTxRecord = await transfer1of2EcTxSubmitted.getRecord(client);
    console.log('transfer1of2EcTxRecord', transactionHashscanUrl(transfer1of2EcTxRecord));

    process.exit(0);
}

function transactionHashscanUrl(txRecord) {
    const txId = txRecord.transactionId.toString();
    return `https://hashscan.io/testnet/transaction/${txId}`;
}

main();
