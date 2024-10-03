require("dotenv").config();
const { Client, PrivateKey, ContractCreateTransaction, FileCreateTransaction, FileAppendTransaction } = require("@hashgraph/sdk");

async function main() {
    // Setup env
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    // Initialize client
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    // The bytecode for the contract
    const bytecode = process.env.BYTECODE; 
    const CHUNK_SIZE = 4096;
    const bytecodeChunks = bytecode.match(new RegExp(".{1," + CHUNK_SIZE + "}", "g"));

    let fileCreateTx = new FileCreateTransaction().setKeys([operatorKey]);
    let response = await fileCreateTx.execute(client);
    let fileReceipt = await response.getReceipt(client);
    let bytecodeFileId = fileReceipt.fileId;

    console.log("Smart contract bytecode file ID:", bytecodeFileId.toString());

    for (let i = 0; i < bytecodeChunks.length; i++) {
        let fileAppendTx = await new FileAppendTransaction()
            .setFileId(bytecodeFileId)
            .setContents(bytecodeChunks[i])
            .execute(client);
        await fileAppendTx.getReceipt(client);
    }

    // Deploy contract 
    const contractTx = await new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(2000000)  
        .setAdminKey(operatorKey)
        .execute(client);

    const contractReceipt = await contractTx.getReceipt(client);
    const contractId = contractReceipt.contractId;

    console.log("The smart contract ID is:", contractId.toString());
}

main().catch((err) => {
    console.error(err);
});
