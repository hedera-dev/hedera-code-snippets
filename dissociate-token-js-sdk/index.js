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

async function dissociateAccountFromToken(accountId, tokenId) {
  // Dissociate an account from a token and freeze the unsigned transaction for signing
  const dissociateTransaction = await new TokenDissociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId])
    .freezeWith(client);

  // sign using the private key of the account that is dissociating from the token
  const dissociateTransactionSigned = await dissociateTransaction.sign(PrivateKey.fromString(privateKey));

  // submit the transaction to the Hedera network
  const dissociateTransactionResponse = await dissociateTransactionSigned.execute(client);

  // Get the receipt of the transaction
  const receipt = await dissociateTransactionResponse.getReceipt(client);

  // Get the transaction consensus status
  const dissociateTransactionStatus = receipt.status;
  console.log(dissociateTransactionStatus);
}
dissociateAccountFromToken(accountId, tokenId, privateKey);