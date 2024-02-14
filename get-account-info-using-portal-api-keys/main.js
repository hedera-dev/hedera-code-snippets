import fetchPortalAccountInfoFcn from "./fetchPortalAccountInfoFcn.js";
import { Client, AccountBalanceQuery } from "@hashgraph/sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

const portalApiKey = process.env.HEDERA_PORTAL_API_KEY;
const operatorPublicKey = process.env.OPERATOR_PBKEY;
const authorizationHeader = `Bearer ${portalApiKey}`;

async function main() {
	let url;
	let network;
	let accountId;
	let privateKey;
	let keyType;

	//
	// ====================================
	// 1. GET SINGLE ACCOUNT INFO BY PUBLIC KEY
	// ====================================
	url = `https:/portal.hedera.com/api/account/${operatorPublicKey}`;

	const singleAccountInfo = await fetchPortalAccountInfoFcn(url, authorizationHeader);
	// console.log(JSON.stringify(singleAccountInfo, null, 2));

	// 1.1 Get the account ID and private key for the account
	network = singleAccountInfo.network;
	accountId = `${singleAccountInfo.realm}.${singleAccountInfo.shard}.${singleAccountInfo.accountNum}`;
	privateKey = singleAccountInfo.privateKey;
	keyType = singleAccountInfo.keyType;
	console.log(`- Obtained account ID: ${accountId} from ${network} with key type: ${keyType}`);

	// 1.2 Create a client for the Hedera network and check the balance of the account
	const client = Client.forNetwork(network).setOperator(accountId, privateKey);
	const accountBalanceCheck = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
	console.log(`- Balance of account ${accountId} is: ${accountBalanceCheck.hbars.toString()} \n`);

	//
	// ====================================
	// 2. GET ALL ACCOUNTS INFO
	// ====================================
	url = `https:/portal.hedera.com/api/account`;

	const allAccountsInfo = await fetchPortalAccountInfoFcn(url, authorizationHeader);
	// console.log(JSON.stringify(allAccountsInfo, null, 2));

	// 2.1 Get the account ID and private key for the 4th account in the array
	network = allAccountsInfo.accounts[3].network;
	accountId = `${allAccountsInfo.accounts[3].realm}.${allAccountsInfo.accounts[3].shard}.${allAccountsInfo.accounts[3].accountNum}`;
	privateKey = allAccountsInfo.accounts[3].privateKey;
	keyType = allAccountsInfo.accounts[3].keyType;
	console.log(`- Obtained account ID: ${accountId} from ${network} with key type: ${keyType}`);

	// 2.2 Update the client to work with the new account info and check the balance of the account
	client.setNetwork(network);
	client.setOperator(accountId, privateKey);
	const accountBalanceCheck1 = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
	console.log(`- Balance of account ${accountId} is: ${accountBalanceCheck1.hbars.toString()} \n`);

	client.close();
}

main();
