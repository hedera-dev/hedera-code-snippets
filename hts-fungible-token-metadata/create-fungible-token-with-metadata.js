const dotenv = require('dotenv');
dotenv.config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
} = require('@hashgraph/sdk');

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const metadataKey = PrivateKey.generate();

async function createFungibleToken() {
	//CREATE FUNGIBLE TOKEN (STABLECOIN)
	let tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("Test")
        .setTokenSymbol("TEST")
        .setMetadata(Buffer.from("ipfs://bafkreigdmoccfta7fic3xt5imohlmrav5xxbstbo744ygjqlh7dhcgroou"))
        .setTokenType(TokenType.FungibleCommon) 
        .setDecimals(3)
        .setInitialSupply(10000)
        .setTreasuryAccountId(operatorId)
        .setMetadataKey(metadataKey)
        .freezeWith(client);

	let tokenCreateSign = await tokenCreateTx.sign(operatorKey);
	let tokenCreateSubmit = await tokenCreateSign.execute(client);
	let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
	let tokenId = tokenCreateRx.tokenId;
	console.log(`- Created token with ID: ${tokenId} \n`);

}
createFungibleToken();