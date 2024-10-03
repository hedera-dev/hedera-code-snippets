require("dotenv").config();
const { Client, ContractExecuteTransaction, ContractFunctionParameters, PrivateKey, Hbar } = require("@hashgraph/sdk");

async function mintTokensToAddress(contractId, recipientAddress, amount) {
    // Set up the Hedera client
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // Ensure that the recipient address is valid
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
        console.error("Invalid recipient address. Make sure it's an EVM-compatible address.");
        return;
    }

    try {
        // ContractExecuteTransaction to call mintToAddress function
        const mintTx = await new ContractExecuteTransaction()
            .setContractId(contractId) 
            .setGas(100000)  
            .setFunction(
                "mintToAddress",  
                new ContractFunctionParameters()
                    .addAddress(recipientAddress)  
                    .addUint256(amount * 10**18)   // Amount of tokens (multiplied by 10^18 for full tokens)
            )
            .setMaxTransactionFee(new Hbar(2)) 
            .execute(client);

        const receipt = await mintTx.getReceipt(client);

        console.log("Minting transaction status:", receipt.status.toString());
    } catch (err) {
        console.error("Error minting tokens:", err);
    }
}

(async () => {
    const contractId = process.env.CONTRACT_ID;  
    const recipientAddress = process.env.RECIPIENT_ADDRESS;
    const amount = 100;  

    await mintTokensToAddress(contractId, recipientAddress, amount);
})();
