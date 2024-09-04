const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
} = require('@hashgraph/sdk');


const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
const metadataKey = PrivateKey.generate();
console.log(`- Created new metadataKey: ${metadataKey} \n`);

// Update the .env file with METADATA_KEY – comment out if not needed
updateEnvFile('METADATA_KEY', metadataKey.toString());


// Function to create fungible token 
async function createFungibleToken() {
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

    // Update the .env file with TOKEN_ID – comment out if not needed
    updateEnvFile('TOKEN_ID', tokenId.toString());
}


createFungibleToken();







// ------------------------------------------------------------
// Helper Functions 
// ------------------------------------------------------------

// Helper function to read .env file
function readEnvFile() {
    if (fs.existsSync('.env')) {
        return fs.readFileSync('.env', 'utf8');
    }
    return '';
}

// Helper function to update or add a key in the .env file
function updateEnvFile(key, value) {
    let envFileContent = readEnvFile();
    const keyString = `${key}=${value}\n`;

    if (envFileContent.includes(`${key}=`)) {
        // Replace the existing key value
        const updatedEnvContent = envFileContent.replace(new RegExp(`${key}=.*`), keyString.trim() + '\n');
        fs.writeFileSync('.env', updatedEnvContent, 'utf8');
        console.log(`${key} updated in .env file.`);
    } else {
        // Append the new key if it doesn't exist
        fs.appendFileSync('.env', '\n' + keyString, 'utf8');
        console.log(`${key} added to .env file.`);
    }
}
