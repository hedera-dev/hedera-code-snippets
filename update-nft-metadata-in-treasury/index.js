import { PrivateKey, Client, TokenCreateTransaction, TokenType, TokenMintTransaction, TokenUpdateNftsTransaction } from "@hashgraph/sdk";
import dotenv from 'dotenv';

// Configure the environment variables
dotenv.config();

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

const client = Client.forPreviewnet().setOperator(operatorId, operatorKey);

//Create a supply key to assign to the token
const supplyKey = PrivateKey.generate();
const supplyPublicKey = supplyKey.publicKey;

async function createNftCollection() {
    //Create an NFT with the supply key
    const token = new TokenCreateTransaction()
        .setTokenType(TokenType.NonFungibleUnique)
        .setTokenName("MusicEvent2024")
        .setTokenSymbol("MEVNT")
        .setTreasuryAccountId(operatorId)
        .setSupplyKey(supplyPublicKey)
        .freezeWith(client);

    const signTx3 = token.sign(supplyKey);
    const submitTx3 = (await signTx3).execute(client);
    const tokenReceipt = (await submitTx3).getReceipt(client);

    // This is the nft collection Id
    const tokenId = (await tokenReceipt).tokenId;
    console.log(`The NFT collection ID is ${tokenId}`);

    return tokenId;
}

async function mintTokenWithMetadata(tokenId) {
    /*
        Metadata should follow the JSON schema V2. 
        This schema requires you to store your token metadata using a storage service.
        View HIP-412 to learn more https://hips.hedera.com/hip/hip-412
    */
    const metadata = new Uint8Array([1]); // This should be a URI string [protocol://resource_location] or CID
    
    // Mint an NFT and set the metadata
    const mintNft = new TokenMintTransaction()
        .setMetadata(metadata)
        .setTokenId(tokenId)
        .freezeWith(client);

    const signTx2 = mintNft.sign(supplyKey);
    const submitTx2 = (await signTx2).execute(client);

    const tokenMintReceipt = (await submitTx2).getReceipt(client);
    const nftSerial = (await tokenMintReceipt).serials;
    console.log(`The NFT serial number is ${nftSerial}`);
    console.log(`The NFT metadata is: ${metadata}`);

    return nftSerial;
}

async function updateNftMetadataWithinTreasury(tokenId, nftSerial) {

    // Metadata to update the NFT with
    const newMetadata = new Uint8Array([3]);

    // Update the NFT metadata while it is in the treasury account and sign with the supply key
    const updateNftMetadata = new TokenUpdateNftsTransaction()
        .setTokenId(tokenId)
        .setSerialNumbers(nftSerial)
        .setMetadata(newMetadata)
        .freezeWith(client);

    console.log(
        "The transaction ID of the token metadata update transaction is " +
        updateNftMetadata.transactionId
    );

    const signTx = updateNftMetadata.sign(supplyKey);

    const submitTx = (await signTx).execute(client);

    const getReceipt = (await submitTx).getReceipt(client);
    const status = (await getReceipt).status;
    console.log("The NFT metadata update transaction was " + status.toString());
    console.log(`The NFT meta data is: ${newMetadata}`);
}

const nftCollectionID = await createNftCollection();
const nftSerialNumber = await mintTokenWithMetadata(nftCollectionID);
void await updateNftMetadataWithinTreasury(nftCollectionID, nftSerialNumber);

client.close();