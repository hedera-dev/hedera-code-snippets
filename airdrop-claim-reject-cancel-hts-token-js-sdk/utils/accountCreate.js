import { AccountCreateTransaction } from "@hashgraph/sdk";

async function accountCreateFcn(pvKey, iBal, maxAutoAssociations, client) {
	const response = await new AccountCreateTransaction()
		.setKey(pvKey.publicKey)
		.setInitialBalance(iBal)
		.setMaxAutomaticTokenAssociations(maxAutoAssociations)
		.execute(client);
	const receipt = await response.getReceipt(client);
	return [receipt.status, receipt.accountId];
}
export default accountCreateFcn;
