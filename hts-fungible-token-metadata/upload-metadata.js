const { PinataSDK } = require("pinata");
const fs = require("fs");
require("dotenv").config();

const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_JWT,
	pinataGateway: process.env.PINATA_GATEWAY,
});

async function uploadJsonToIpfs() {
    console.log(`\n=======================================`);
    console.log(`- Uploading JSON metadata to IPFS...`);

    // Load metadata from a file (metadata-example.json) - replace with name of your file if not using the example
    let metadata;
    try {
        const data = fs.readFileSync('metadata-example.json', 'utf8');
        metadata = JSON.parse(data);
    } catch (err) {
        console.error("Error reading metadata file:", err);
        return;
    }

    try {
        // Upload JSON to IPFS via Pinata
		const upload = await pinata.upload.json(metadata).addMetadata({
			name: `metadata.json`,
		});

        const ipfsHash = upload.IpfsHash;  
        console.log(`Uploaded JSON successfully: ${ipfsHash}`);

        // Write the IPFS CID to the .env file
        updateEnvFile("IPFS_CID", ipfsHash);
    } catch (error) {
        console.error(`Error uploading JSON:`, error);
    }
}

uploadJsonToIpfs();



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

