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

    const metadata = {
		description: "TEST Tokens ($TEST) to test functionality.",
        creator: "some tester",
        lightLogo: "ipfs://QmQc7si95gL1gsMqhD8R2sNeRLodG8od53Jn2rfczatovg",
        lightLogoType: "image/svg",
        website: "https://hips.hedera.com/hip/hip-405",
        whitepaper: "https://files.hedera.com/hh_whitepaper_v2.2-20230918.pdf"
    };

    try {
        // Upload JSON to IPFS via Pinata
		const upload = await pinata.upload.json(metadata).addMetadata({
			name: `metadata.json`,
		});

        const ipfsHash = upload.IpfsHash;  
        console.log(`Uploaded JSON successfully: ${ipfsHash}`);

        // Write the IPFS CID to the .env file – comment out if not needed
        updateEnvFile("IPFS_CID", ipfsHash);
    } catch (error) {
        console.error(`Error uploading JSON:`, error);
    }
}





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

uploadJsonToIpfs();
