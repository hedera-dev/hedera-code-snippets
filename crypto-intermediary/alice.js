console.clear();
require("dotenv").config();
const {
  AccountId,
  TokenCreateTransaction,
  TokenType,
  PrivateKey,
  Client,
  Transaction,
  TransactionId, // <--- New Line
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const BobAccountId = AccountId.fromString(process.env.BOB_OPERATOR_ID);
const BobPrivateKey = PrivateKey.fromString(process.env.BOB_OPERATOR_KEY);
const AliceAccountId = AccountId.fromString(process.env.ALICE_OPERATOR_ID);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();
client.setOperator(BobAccountId, BobPrivateKey);

async function main() {
  // 1. Bob creates the transaction object (e.g. a `TokenCreateTransaction`) 
  // and sets a specific transactionId to designate Alice as the payer account 
  const transaction = new TokenCreateTransaction()
    .setTokenName("New Token 123")
    .setTokenSymbol("NT123")
    .setTokenType(TokenType.FungibleCommon)
    .setInitialSupply(2000)
    .setTreasuryAccountId(BobAccountId)
    .setTransactionId(TransactionId.generate(AliceAccountId)); // <--- New Line

  // 2. Bob freezes and signs the transaction
  const frozenTx = await transaction.freezeWith(client);
  const signedTx = await frozenTx.sign(BobPrivateKey);
  const signedBytes = await signedTx.toBytes();

  // 3. Ouput frozen transaction payload to send to Alice offchain
  console.log("Frozen Transactions: " + JSON.stringify(signedBytes));
}

main();
