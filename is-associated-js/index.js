import { Client, AccountId, PrivateKey, Hbar, } from "@hashgraph/sdk";
import dotenv from 'dotenv';

// Configure the environment variables
dotenv.config();

// ensure required environment variables are available
if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
  throw new Error('Must set OPERATOR_ID and OPERATOR_KEY in .env');
}

//Grab the Hedera operator account ID and operator private key from your .env file
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

// configure client using environment variables
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

//Set the default maximum transaction fee (in Hbar)
client.setDefaultMaxTransactionFee(new Hbar(100));

// Check if the account is associated with the Hedera native token
// Returns true if the account has a balance that is 0 or greater for the given token ID, otherwise false
async function isAssociated() {
  const testnetUrl = 'https://testnet.mirrornode.hedera.com';
  const hederaAccountId = '0.0.572377';
  const hederaTokenId = '0.0.572609';
  // fetch the account info
  const accountInfo = await fetch(`${testnetUrl}/api/v1/accounts/${hederaAccountId}`, { method: "GET" });
  // convert the response to json
  const accountInfoJson = await accountInfo.json();
  // grab the associated tokens list from the json
  const associatedTokensList = accountInfoJson.balance.tokens;
  // returns true if the account has the associated token, false otherwise
  return associatedTokensList.some((token) => token.token_id === hederaTokenId);
}

console.log(`The account is associated with the Hedera native token: ${await isAssociated()}`);