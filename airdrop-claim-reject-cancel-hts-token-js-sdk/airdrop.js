console.clear();
import dotenv from "dotenv";
dotenv.config();

import {
	Client,
	PrivateKey,
	AccountId,
	Hbar,
	TokenType,
	TokenSupplyType,
	TokenAirdropTransaction,
	TokenClaimAirdropTransaction,
	TokenCancelAirdropTransaction,
	TokenRejectTransaction,
	AccountBalanceQuery,
} from "@hashgraph/sdk";

import accountCreateFcn from "./utils/accountCreate.js";
import * as htsTokens from "./utils/tokenOperations.js";
import * as queries from "./utils/queries.js";

async function main() {
	// CONFIGURE ACCOUNTS AND CLIENT, AND GENERATE NEEDED KEYS
	const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
	const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY_HEX);
	const network = process.env.NETWORK;

	const client = Client.forNetwork(network).setOperator(operatorId, operatorKey);
	client.setDefaultMaxTransactionFee(new Hbar(50));
	client.setDefaultMaxQueryPayment(new Hbar(1));

	// CREATE NEW HEDERA ACCOUNTS TO REPRESENT OTHER USERS
	const initBalance = new Hbar(1);
	const noAutoAssociations = 0;
	const fiveAutoAssociations = 5;
	const infAutoAssociations = -1;

	const treasuryKey = PrivateKey.generateECDSA();
	const [treasuryStatus, treasuryId] = await accountCreateFcn(treasuryKey, initBalance, noAutoAssociations, client);
	console.log(`- Treasury's account: https://hashscan.io/${network}/account/${treasuryId}`);

	const aliceKey = PrivateKey.generateECDSA();
	const [aliceStatus, aliceId] = await accountCreateFcn(aliceKey, initBalance, infAutoAssociations, client);
	console.log(`- Alice's account: https://hashscan.io/${network}/account/${aliceId}`);

	const bobKey = PrivateKey.generateECDSA();
	const [bobStatus, bobId] = await accountCreateFcn(bobKey, initBalance, noAutoAssociations, client);
	console.log(`- Bob's account: https://hashscan.io/${network}/account/${bobId}`);

	const carolKey = PrivateKey.generateECDSA();
	const [carolStatus, carolId] = await accountCreateFcn(carolKey, initBalance, fiveAutoAssociations, client);
	console.log(`- Carol's account: https://hashscan.io/${network}/account/${carolId}`);

	const daveKey = PrivateKey.generateECDSA();
	const [daveStatus, daveId] = await accountCreateFcn(daveKey, initBalance, noAutoAssociations, client);
	console.log(`- Dave's account: https://hashscan.io/${network}/account/${daveId}`);

	// GENERATE KEYS TO MANAGE FUNCTIONAL ASPECTS OF THE TOKEN
	const adminKey = PrivateKey.generateECDSA();
	const supplyKey = PrivateKey.generateECDSA();
	const pauseKey = PrivateKey.generateECDSA();
	const freezeKey = PrivateKey.generateECDSA();
	const wipeKey = PrivateKey.generateECDSA();
	const kycKey = PrivateKey.generateECDSA();
	const feeScheduleKey = PrivateKey.generateECDSA();
	const metadataKey = PrivateKey.generateECDSA();
	const keys = [adminKey, supplyKey, pauseKey, freezeKey, wipeKey, kycKey, feeScheduleKey, metadataKey];

	// CREATE A FUNGIBLE TOKEN (FT)
	const [tokenId, tokenInfo, txId] = await htsTokens.createHtsTokenFcn(
		"Airdrop Token", // Token Name
		"AT", // Token Symbol
		treasuryId, // Treasury Account ID
		TokenType.FungibleCommon, // Token Type
		TokenSupplyType.Finite, // Supply Type
		1000, // Initial Supply
		1000, // Max Supply
		keys, // Keys array
		treasuryKey, // Treasury Private Key
		client // Client
	);

	console.log(`\n- Created FT with Token ID: ${tokenId}`);
	console.log(`- See: https://hashscan.io/${network}/token/${tokenId.toString()}`);
	console.log(`- See: https://hashscan.io/${network}/transaction/${txId}`);

	// AIRDROP HTS TOKENS TO MULTIPLE ACCOUNTS
	const airdropTx = new TokenAirdropTransaction()
		.addTokenTransfer(tokenId, treasuryId, -1)
		.addTokenTransfer(tokenId, aliceId, 1)
		.addTokenTransfer(tokenId, treasuryId, -2)
		.addTokenTransfer(tokenId, bobId, 2)
		.addTokenTransfer(tokenId, treasuryId, -3)
		.addTokenTransfer(tokenId, carolId, 3)
		.addTokenTransfer(tokenId, treasuryId, -4)
		.addTokenTransfer(tokenId, daveId, 4)
		.freezeWith(client);

	const airdropTxSign = await airdropTx.sign(treasuryKey);
	const airdropTxSubmit = await airdropTxSign.execute(client);
	const airdropRec = await airdropTxSubmit.getRecord(client);
	console.log(`\n- Treasury TokenAirdropTransaction status: ${airdropRec.receipt.status.toString()}`);
	console.log(`- See: https://hashscan.io/${network}/transaction/${airdropTxSubmit.transactionId}`);

	const bobAirdropId = airdropRec.newPendingAirdrops[0].airdropId;
	const daveAirdropId = airdropRec.newPendingAirdrops[1].airdropId;

	// BOB CLAIMS THE AIRDROP
	const bobClaimTx = new TokenClaimAirdropTransaction().addPendingAirdropId(bobAirdropId).freezeWith(client);
	const bobClaimTxSign = await bobClaimTx.sign(bobKey);
	const bobClaimTxSubmit = await bobClaimTxSign.execute(client);
	const bobClaimRx = await bobClaimTxSubmit.getReceipt(client);
	console.log(`\n- Bob TokenClaimAirdropTransaction status: ${bobClaimRx.status.toString()}`);
	console.log(`- See: https://hashscan.io/${network}/transaction/${bobClaimTxSubmit.transactionId}`);

	// BALANCE CHECK AFTER AIRDROP
	console.log(`\n- Alice balance check after performing the airdrop`);
	await queries.balanceCheckerFcn(aliceId, tokenId, client);
	console.log(`\n- Bob balance check after claiming the airdrop`);
	await queries.balanceCheckerFcn(bobId, tokenId, client);
	console.log(`\n- Carol balance check after performing the airdrop`);
	await queries.balanceCheckerFcn(carolId, tokenId, client);
	console.log(`\n- Dave balance check after performing the airdrop`);
	await queries.balanceCheckerFcn(daveId, tokenId, client);

	// CAROL REJECTS THE AIRDROP
	const carolRejectTx = new TokenRejectTransaction().setOwnerId(carolId).addTokenId(tokenId).freezeWith(client);
	const carolRejectTxSign = await carolRejectTx.sign(carolKey);
	const carolRejectTxSubmit = await carolRejectTxSign.execute(client);
	const carolRejectRx = await carolRejectTxSubmit.getReceipt(client);
	console.log(`\n- Carol TokenRejectTransaction status: ${carolRejectRx.status.toString()}`);
	console.log(`- See: https://hashscan.io/${network}/transaction/${carolRejectTxSubmit.transactionId}`);

	// BALANCE CHECK AFTER REJECTION
	console.log(`\n- Carol balance check after rejecting the airdrop`);
	await queries.balanceCheckerFcn(carolId, tokenId, client);

	// TREASURY CANCELS THE AIRDROP TO DAVE
	const cancelAirdropTx = new TokenCancelAirdropTransaction().addPendingAirdropId(daveAirdropId).freezeWith(client);
	const cancelAirdropTxSign = await cancelAirdropTx.sign(treasuryKey);
	const cancelAirdropTxSubmit = await cancelAirdropTxSign.execute(client);
	const cancelAirdropRx = await cancelAirdropTxSubmit.getReceipt(client);
	console.log(`\n- Treasury TokenCancelAirdropTransaction status: ${cancelAirdropRx.status.toString()}`);
	console.log(`- See: https://hashscan.io/${network}/transaction/${cancelAirdropTxSubmit.transactionId}`);

	// BALANCE CHECK AFTER CANCELLATION
	console.log(`\n- Dave balance check after canceling the airdrop`);
	await queries.balanceCheckerFcn(daveId, tokenId, client);

	console.log(`\n- THE END ============================================================\n`);
	console.log(`- 👇 Go to:`);
	console.log(`- 🔗 www.hedera.com/discord\n`);

	client.close();
}

main();
