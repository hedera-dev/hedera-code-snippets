import { TokenCreateTransaction, TokenMintTransaction, TransferTransaction } from "@hashgraph/sdk";
import * as queries from "./queries.js";

export async function createHtsTokenFcn(tkName, tkSymbol, trId, tkType, sType, iSupply, maxSupply, listOfKeys, trPvKey, client) {
	const tokenCreateTx = await new TokenCreateTransaction()
		.setTokenName(tkName)
		.setTokenSymbol(tkSymbol)
		.setTreasuryAccountId(trId)
		.setTokenType(tkType)
		.setSupplyType(sType)
		.setDecimals(0)
		.setInitialSupply(iSupply)
		.setMaxSupply(maxSupply)
		// .setCustomFees([customFee])
		.setAdminKey(listOfKeys[0].publicKey)
		.setSupplyKey(listOfKeys[1].publicKey)
		.setPauseKey(listOfKeys[2].publicKey)
		.setFreezeKey(listOfKeys[3].publicKey)
		.setWipeKey(listOfKeys[4].publicKey)
		// .setKycKey(listOfKeys[5].publicKey)
		.setFeeScheduleKey(listOfKeys[6].publicKey)
		.setMetadataKey(listOfKeys[7].publicKey)
		.freezeWith(client)
		.sign(trPvKey);
	const tokenCreateSign = await tokenCreateTx.sign(listOfKeys[0]);
	const tokenCreateSubmit = await tokenCreateSign.execute(client);
	const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
	const tokenId = tokenCreateRx.tokenId;

	const tokenInfo = await queries.tokenQueryFcn(tokenId, client);

	return [tokenId, tokenInfo, tokenCreateSubmit.transactionId];
}

export async function transferFtFcn(tId, senderId, receiverId, amount, senderKey, client) {
	const tokenTransferTx = new TransferTransaction()
		.addTokenTransfer(tId, senderId, amount * -1)
		.addTokenTransfer(tId, receiverId, amount)
		.freezeWith(client);
	const tokenTransferSign = await tokenTransferTx.sign(senderKey);
	const tokenTransferSubmit = await tokenTransferSign.execute(client);
	const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

	return [tokenTransferRx, tokenTransferTx];
}

export async function mintNftSerialsFcn(supplyKey, client) {
	// // MINT NEW BATCH OF NFTs
	const CID = [
		Buffer.from("ipfs://QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn"),
		Buffer.from("ipfs://QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9"),
		Buffer.from("ipfs://QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T"),
		Buffer.from("ipfs://Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5"),
		Buffer.from("ipfs://QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw"),
	];
	const mintTx = new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
		.freezeWith(client);
	const mintTxSign = await mintTx.sign(supplyKey);
	const mintTxSubmit = await mintTxSign.execute(client);
	const mintRx = await mintTxSubmit.getReceipt(client);
	const tokenInfo = await queries.tokenQueryFcn(tokenId, client);

	return [tokenId, tokenInfo];
}
