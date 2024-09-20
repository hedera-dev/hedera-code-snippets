import { Client, PrivateKey, AccountInfoQuery, Hbar, AccountCreateTransaction } from "@hashgraph/sdk";
import dotenv from 'dotenv';

// Configure the environment variables
dotenv.config();

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
  throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);


/*
 * Accounts created with CryptoCreate (AccountCreateTransaction) 
 * will have a default max_auto_associations of 0, meaning
 * no automatic assocations are allowed
 */
async function createAccountWithDefaultAutoAssociation() {
  //Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const txnReceipt = await newAccount.getReceipt(client);
  const newAccountId = txnReceipt.accountId;

  // Get Account Info using a query
  const query = new AccountInfoQuery()
    .setAccountId(newAccountId);

  //Sign with client operator private key and submit the query to a Hedera network
  const accountInfo = await query.execute(client);

  // grab the max autto associations number
  const maxAutoAssociations = accountInfo.maxAutomaticTokenAssociations;

  //Log the account ID
  console.log(`New account created with ID: ${newAccountId}`);
  console.log(`Default max auto associations for account ${newAccountId} is: ${maxAutoAssociations}`);
}

/*
 * Set max_auto_associations to -1 when creating accounts
 * with CryptoCreate (AccountCreateTransaction) to allow unlimited  
 * automatic assocations
 */
async function createAccountWithMaxAutoAssocUnlimited() {
  //Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  // Create a new account with 1,000 tinybar starting balance and set the max_auto_assocations to -1
  // to allow unlimited automatic asocations
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .setMaxAutomaticTokenAssociations(-1)
    .execute(client);

  // Get the new account ID
  const txnReceipt = await newAccount.getReceipt(client);
  const newAccountId = txnReceipt.accountId;

  // Get Account Info using a query
  const query = new AccountInfoQuery()
    .setAccountId(newAccountId);

  //Sign with client operator private key and submit the query to a Hedera network
  const accountInfo = await query.execute(client);

  // grab the max autto associations number
  const maxAutoAssociations = accountInfo.maxAutomaticTokenAssociations;

  //Log the account ID
  console.log(`New account created with ID: ${newAccountId}`);
  console.log(`Max auto associations for account ${newAccountId} is set to ${maxAutoAssociations}`);
}

await createAccountWithDefaultAutoAssociation();
console.log('\n');
await createAccountWithMaxAutoAssocUnlimited();

client.close();