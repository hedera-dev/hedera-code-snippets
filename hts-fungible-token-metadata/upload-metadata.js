const { PinataSDK } = require("pinata");
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

		const upload = await pinata.upload.json(metadata).addMetadata({
			name: `metadata.json`,
		});

        console.log(`Uploaded JSON successfully:`, upload);
    } catch (error) {
        console.error(`Error uploading JSON:`, error);
    }
}

uploadJsonToIpfs();
