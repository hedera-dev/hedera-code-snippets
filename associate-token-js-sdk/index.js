import { Client, AccountId, PrivateKey, Hbar, TokenAssociateTransaction, TokenDissociateTransaction} from "@hashgraph/sdk";
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

async function associateAccountWithToken(accountId, tokenId, privateKey) {
  // Build a tokenAssociateTransaction to associate an account to a token 
  // and freeze the unsigned transaction for signing
  const associateTransaction = await new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId])
    .freezeWith(client);

  // sign using the private key of the account that is being associated to the token
  const associateTransactionSigned = await associateTransaction.sign(PrivateKey.fromString(privateKey));

  // submit the transaction to the Hedera network
  const associateTransactionResponse = await associateTransactionSigned.execute(client);

  // Get the receipt of the transaction
  const receipt = await associateTransactionResponse.getReceipt(client);

  // Get the transaction consensus status
  const associateTransactionStatus = receipt.status;

  console.log(associateTransactionStatus);
}
associateAccountWithToken(accountId, tokenId, privateKey);