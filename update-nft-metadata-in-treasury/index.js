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
    console.log("The NFT collection ID is " + tokenId);

    return tokenId;
}

async function mintTokenWithMetadata(tokenId) {
    // Metadata to mint the NFT with
    // Note: You need to store your token metadata using a storage service, 
    // either centralized or decentralized, like IPFS or Arweave, because the token metadata JSON schema V2 requires it.
    const metadata = new Uint8Array([1]);

    // Mint an NFT and set the metadata
    const mintNft = new TokenMintTransaction()
        .setMetadata(metadata)
        .setTokenId(tokenId)
        .freezeWith(client);

    const signTx2 = mintNft.sign(supplyKey);
    const submitTx2 = (await signTx2).execute(client);

    const tokenMintReceipt = (await submitTx2).getReceipt(client);
    const nftSerial = (await tokenMintReceipt).serials;
    console.log("The NFT serial number is " + nftSerial);

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
}

const nftCollectionID = await createNftCollection();
const nftSerialNumber = await mintTokenWithMetadata(nftCollectionID);
void await updateNftMetadataWithinTreasury(nftCollectionID, nftSerialNumber);

client.close();