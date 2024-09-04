const dotenv = require('dotenv');
dotenv.config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenInfoQuery,
    TokenUpdateTransaction,
} = require('@hashgraph/sdk');

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function updateTokenMetadata(tokenId, newMetadata, metadataKey) {
    try {
        let tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);
        console.log(`Token metadata before update:`, tokenInfo.metadata);

        // Prepare token update transaction
        const tokenUpdateTx = new TokenUpdateTransaction()
            .setTokenId(tokenId)
            .setMetadata(Buffer.from(newMetadata)) // Convert new metadata to Buffer
            .freezeWith(client);

        // Sign the transaction with metadata key
        const signedTokenUpdateTx = await tokenUpdateTx.sign(metadataKey);

        // Execute the transaction
        const tokenUpdateTxResponse = await signedTokenUpdateTx.execute(client);

        // Get receipt for the update transaction
        const tokenUpdateTxReceipt = await tokenUpdateTxResponse.getReceipt(client);
        console.log(`Status of token update transaction: ${tokenUpdateTxReceipt.status.toString()}`);

        // Get updated token info
        tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);
        console.log(`Token updated metadata:`, tokenInfo.metadata);
    } catch (error) {
        console.error("Error during token metadata update:", error);
    } finally {
        client.close();
    }
}

// Replace with your token ID, new metadata, and the metadata key
const tokenId = process.env.TOKEN_ID; 
const newMetadata = process.env.IPFS_CID;
const metadataKey = PrivateKey.fromString(process.env.METADATA_KEY);

updateTokenMetadata(tokenId, newMetadata, metadataKey);
