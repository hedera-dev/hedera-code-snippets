# Update NFT Metadata Using the Supply Key in Treasury Account

This feature allows you to update an NFT's metadata while it's still in the treasury account, using the supply key. Once the NFT is transferred out, its metadata becomes immutable, ensuring security and consistency.


This code snippet demonstrates creating an NFT collection, minting an NFT, and updating the NFT's metadata using the supply key.

## How to use this code snippet

1. Rename `.env.example` file to `.env`
2. Update the values `OPERATOR_ID` and `OPERATOR_KEY` with your credentials
3. In your terminal, run `npm i` 
4. Execute the script with `node index.js`

#### Example output
```bash
The NFT collection ID is 0.0.8362
The NFT serial number is 1
The NFT metadata is: 1
The transaction ID of the token metadata update transaction is 0.0.1297@1724344914.081631556
The NFT metadata update transaction was SUCCESS
The NFT meta data is: 3
```


## Code Overview

`TokenMintTransaction` mints the NFT with initial metadata. Metadata must be stored on a decentralized or centralized service like IPFS or Arweave, complying with JSON schema V2.

[Learn more about how to structure your token metadata](https://docs.hedera.com/hedera/tutorials/token/structure-your-token-metadata-using-json-schema-v2)

`TokenUpdateNftsTransaction` updates the metadata of an NFT while it is in the treasury account using the supply key.