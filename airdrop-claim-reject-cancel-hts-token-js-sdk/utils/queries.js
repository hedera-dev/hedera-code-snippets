import { TransactionRecordQuery, TokenInfoQuery, AccountBalanceQuery } from "@hashgraph/sdk";

export async function txRecQueryFcn(txId, client) {
	const recQuery = await new TransactionRecordQuery().setTransactionId(txId).setIncludeChildren(true).execute(client);
	return recQuery;
}

export async function tokenQueryFcn(tkId, client) {
	let info = await new TokenInfoQuery().setTokenId(tkId).execute(client);
	return info;
}

export async function balanceCheckerFcn(acId, tkId, client) {
	let balanceCheckTx = [];
	try {
		balanceCheckTx = await new AccountBalanceQuery().setAccountId(acId).execute(client);
		console.log(
			`- Balance of account ${acId}: ${balanceCheckTx.hbars.toString()} + ${balanceCheckTx.tokens._map.get(tkId.toString())} unit(s) of token ${tkId}`
		);
	} catch {
		balanceCheckTx = await new AccountBalanceQuery().setContractId(acId).execute(client);
		console.log(
			`- Balance of contract ${acId}: ${balanceCheckTx.hbars.toString()} + ${balanceCheckTx.tokens._map.get(
				tkId.toString()
			)} unit(s) of token ${tkId}`
		);
	}
}
