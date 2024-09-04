const WalletConnectProvider = require("@walletconnect/web3-provider").default;
const { Client, AccountId, TransferTransaction, TokenAssociateTransaction } = require("@hashgraph/sdk");
require("dotenv").config();

// Hedera Client Configuration
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = process.env.OPERATOR_KEY;
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// WalletConnect provider setup
async function setupWalletConnect() {
    const provider = new WalletConnectProvider({
        infuraId: "YOUR_INFURA_ID",  // Optional, for Ethereum if needed
        bridge: "https://bridge.walletconnect.org"
    });
    // Enable session
    await provider.enable();
    console.log("WalletConnect session enabled.");

    // Connect Hedera Client
    client.setOperator(AccountId.fromString(provider.accounts[0]), operatorKey);
}

// Perform token transfer
async function performTransfer(tokenId, amount, receiverId) {
    const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, operatorId, -amount)
        .addTokenTransfer(tokenId, receiverId, amount)
        .freezeWith(client);

    const signTx = await transaction.sign(operatorKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log("Transfer status: ", receipt.status.toString());
}

// Token association example
async function associateToken(accountId, tokenId) {
    const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client);

    const signTx = await transaction.sign(operatorKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log("Token association status: ", receipt.status.toString());
}

(async () => {
    // Initialize WalletConnect
    await setupWalletConnect();

    // Example token transfer (replace with actual token ID, receiver ID, and amount)
    const tokenId = "0.0.12345";  // Replace with actual token ID
    const receiverId = AccountId.fromString("0.0.54321");  // Replace with actual receiver
    const amount = 10;  // Example amount

    // Perform token transfer
    await performTransfer(tokenId, amount, receiverId);

    // Example token association (replace with actual account ID and token ID)
    const accountId = AccountId.fromString("0.0.54321");  // Replace with actual account ID
    await associateToken(accountId, tokenId);
})();
