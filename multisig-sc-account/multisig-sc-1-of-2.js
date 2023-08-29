import fs from 'node:fs/promises';
import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    TransferTransaction,
    TransactionRecordQuery,
    KeyList,
    AccountUpdateTransaction,
    TokenId,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    TokenAssociateTransaction,
    ContractExecuteTransaction,
    EntityIdHelper,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Ensure required environment variables are available
if (!process.env.OPERATOR_ID ||
    !process.env.OPERATOR_KEY ||
    !process.env.HTS_FT_ID) {
    throw new Error('Must set required keys in .env');
}

// Configure client using environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Configure fungible token using environment variables 
const htsFtId = TokenId.fromString(process.env.HTS_FT_ID);

// Entry point for execution of this example (called at the bottom of the file)
async function main() {
    console.log('Operator Account ID', operatorId.toString());

    // Upload EVM bytecode to Hedera File Service (HFS)
    const evmBytecode = await fs.readFile(
        './account_sol_Account.bin', { encoding: 'utf8' });
    const fileCreateTx = new FileCreateTransaction()
        .setContents(evmBytecode.toString())
        .freezeWith(client);;
    const fileCreateTxSigned = await fileCreateTx.sign(operatorKey);
    const fileCreateTxSubmitted = await fileCreateTxSigned.execute(client);
    const fileCreateTxRecord = await fileCreateTxSubmitted.getRecord(client);
    const fileId = fileCreateTxRecord.receipt.fileId;
    console.log('fileId', fileId.toString());

    // Deploy Uploaded Contract (File) to Hedera Smart Contract Service (HSCS)
    const scDeployTx = new ContractCreateTransaction()
        .setBytecodeFileId(fileId)
        .setGas(400_000)
        .freezeWith(client);
    const scDeployTxSigned = await scDeployTx.sign(operatorKey);
    const scDeployTxSubmitted = await scDeployTxSigned.execute(client);
    const scDeployTxRecord = await scDeployTxSubmitted.getRecord(client);

    // Obtain the ID of the deployed smart contract
    const scId = scDeployTxRecord.receipt.contractId;
    console.log('scId', scId.toString());

    // Generate a new EdDSA key
    // const ecKey = PrivateKey.generateED25519();
    // Generate a new ECDSA key
    const ecKey = PrivateKey.generateECDSA();

    // Create a `KeyList` that represents a 1 of 2 multisig threshold
    // where one of the keys is the smart contract ID, and the other is the ECDSA key
    const multisigPublicKeys = [scId, ecKey.publicKey];
    const multisigKeyList = new KeyList(multisigPublicKeys, 1);
    console.log('multisigKeyList', multisigKeyList.toString());

    // Use the ECDSA key to generate an account alias
    const accountAlias = ecKey.publicKey.toAccountId(0, 0);

    // Create new account from account alias using a `TransferTransaction`
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
    
    // Extract Account ID / EVM Address from Submitted Transaction 
    const multisigAccountId =
        createAccountTxRecordWithChildren?.children[0]?.receipt?.accountId;
    const multisigAccountEvmAddress =
        createAccountTxRecordWithChildren?.children[0]?.evmAddress;
    console.log('multisigAccountId', multisigAccountId.toString());
    console.log('multisigAccountEvmAddress', multisigAccountEvmAddress.toString());
    console.log('toLongZeroEvmAddress(multisigAccountId)', toLongZeroEvmAddress(multisigAccountId));
    console.log('multisigAccountId.toSolidityAddress()', multisigAccountId.toSolidityAddress());

    // Update account to use this `KeyList`, via an `AccountUpdateTransaction`.
    // This replaces the single signature with a the 1 of 2 multisig
    const makeMultisigTx = new AccountUpdateTransaction()
        .setAccountId(multisigAccountId)
        .setKey(multisigKeyList)
        .freezeWith(client);
    const makeMultisigTxSignedByAllKeys = await makeMultisigTx.sign(ecKey);
    const makeMultisigTxSubmitted = await makeMultisigTxSignedByAllKeys.execute(client);
    const makeMultisigTxRecord = await makeMultisigTxSubmitted.getRecord(client);
    console.log('makeMultisigTxRecord', transactionHashscanUrl(makeMultisigTxRecord));

    // associate HTS FT token with multisig account
    const associateFtTx = new TokenAssociateTransaction()
        .setAccountId(multisigAccountId)
        .setTokenIds([htsFtId])
        .freezeWith(client);
    const associateFtTxSigned = await associateFtTx.sign(ecKey);
    const associateFtTxSubmitted = await associateFtTxSigned.execute(client);
    const associateFtTxRecord = await associateFtTxSubmitted.getRecord(client);
    console.log('associateFtTxRecord', transactionHashscanUrl(associateFtTxRecord));

    // Transfer an initial balance of HTS FT tokens to the multisig account
    const transferFtFromOperatorTx = new TransferTransaction()
        .addTokenTransfer(htsFtId, operatorId, -100)
        .addTokenTransfer(htsFtId, multisigAccountId, 100)
        .freezeWith(client);
    const transferFtFromOperatorTxSigned = await transferFtFromOperatorTx.sign(operatorKey);
    const transferFtFromOperatorTxSubmitted = await transferFtFromOperatorTxSigned.execute(client);
    const transferFtFromOperatorTxRecord = await transferFtFromOperatorTxSubmitted.getRecord(client);
    console.log('transferFtFromOperatorTxRecord', transactionHashscanUrl(transferFtFromOperatorTxRecord));

    // Sign a `TransferTransaction` using the ECDSA key only,
    // then attempt to execute it
    const transfer1of2EcTx = new TransferTransaction()
        .addTokenTransfer(htsFtId, operatorId, -12)
        .addTokenTransfer(htsFtId, multisigAccountId, 12)
        .freezeWith(client);
    const transfer1of2EcTxSigned = await transfer1of2EcTx.sign(ecKey);
    const transfer1of2EcTxSubmitted = await transfer1of2EcTxSigned.execute(client);
    const transfer1of2EcTxRecord = await transfer1of2EcTxSubmitted.getRecord(client);
    console.log('transfer1of2EcTxRecord', transactionHashscanUrl(transfer1of2EcTxRecord));

    // Invoke `Account.performPrecompileOperation` function on the smart contract whose ID is
    // of the `KeyList` of the multisig account
    /*
    function performPrecompileOperation(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external {
        int64 responseCode = hederaTokenService.transferToken(token, sender, recipient, amount);
        require(responseCode == 22, "transfer error");
    }
    */
    const scPerformPrecompileTx = new ContractExecuteTransaction()
        .setContractId(scId)
        .setGas(400_000)
        .setFunction(
            'performPrecompileOperation',
            new ContractFunctionParameters()
                .addAddress(toLongZeroEvmAddress(htsFtId))
                .addAddress(multisigAccountEvmAddress.toString())
                .addAddress(toLongZeroEvmAddress(operatorId))
                .addInt64(23),
        )
        .freezeWith(client);
    // NOTE that this transaction is intentionally **unsigned**.
    // This is to verify that the smart contract is also part of `KeyList` of the multisig account
    // does indeed fulfil its role in being able to authenticate the precompile transaction in lieu of a signature.
    const scPerformPrecompileTxSubmitted = await scPerformPrecompileTx.execute(client);
    const scPerformPrecompileTxRecord = await scPerformPrecompileTxSubmitted.getRecord(client);
    console.log('scPerformPrecompileTxRecord', transactionHashscanUrl(scPerformPrecompileTxRecord));

    process.exit(0);
}

function transactionHashscanUrl(txRecord) {
    const txId = txRecord.transactionId.toString();
    return `https://hashscan.io/testnet/transaction/${txId}`;
}

function toLongZeroEvmAddress(entityId) {
    const { shard, realm, num } =
        EntityIdHelper.fromString(entityId);
    const longZeroEvmAdress = EntityIdHelper.toSolidityAddress([shard, realm, num]);
    return longZeroEvmAdress;
}

main();
