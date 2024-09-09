# HTS Fungible Token with Metadata and File Upload to IPFS

Create a Hedera Token Service (HTS) fungible token with metadata and upload related metadata files to IPFS using the Pinata SDK.

## Context

Metadata is commonly associated with non-fungible tokens (NFTs), where off-ledger storage of metadata such as artwork helps reduce on-ledger storage costs. However, metadata is also essential for fungible tokens (FTs), as it allows for storing additional information about a token beyond what is stored on the ledger.

Previously, there was a difference in how metadata was handled for NFTs and FTs on Hedera. While NFTs have a dedicated metadata field that points to a JSON metadata file, FTs originally lacked this feature and had to use the more generic memo field to store such pointers. However, this has since been resolved, and FTs now also have a optional metadata field, making the handling of metadata more consistent across token types.

It’s important to note that while both token types now support metadata, they adhere to different schemas. NFTs follow the [HIP-412](https://hips.hedera.com/hip/hip-412) schema, whereas FTs use the [HIP-405](https://hips.hedera.com/hip/hip-405) schema. This difference ensures that each token type has the appropriate metadata structure suited to its use case.

### Fungible Token Metadata JSON Schema (HIP-405)

The JSON metadata for a fungible token includes the following information:


 - `description` - human readable description of the token and corresponding project
- `smallestUnitName` - the name of the smallest unit of the token
- `smallestUnitSymbol` - the symbol of the smallest unit of the token
- `creator` - the entity that created the token
- `creatorDID` - the decentralized identifier of the creator
- `admin` - if the token has an admin key, the entity that manages that key
- `lightLogo` - a logo for the token designed for light backgrounds. svg is recommended.
- `lightLogoType` - if the lightLogo is specified, its mime type
- `darkLogo` - a logo for the token designed for dark backgrounds. svg is recommended.
- `darkLogoType` - if the darkLogo is specified, its mime type
- `website` address - the address at which additional information on the token or corresponding project
- `discussion` - the address at which the project’s community holds discussion
- `whitepaper` address - the address at which the project’s whitepaper can be found
- `properties` - container for arbitrary token attributes not specifically listed above


See `metadata-example.json` or `metadata-schema.txt`.


## Code

See `.env.example`.

Copy the `.env.example` file to `.env`, and fill in the required details, including your operator account credentials and Pinata JWT token. You will also need to fill in any necessary details for the metadata, if the upload script is not used.

See `upload-metadata.js`

This script uploads the token's metadata JSON to IPFS via the Pinata SDK. By uploading the token’s metadata to IPFS, we ensure that it is stored in a decentralized manner. The resulting IPFS hash (CID) is then used as part of the metadata in the token creation process. The resulting CID is saved to your .env file.

Run this command to upload metadata to IPFS:

```shell
node upload-metadata.js
```

See `create-fungible-token-with-metadata.js`

This script demonstrates how to create the fungible token while linking the metadata that was previously uploaded to IPFS. The metadata is attached to the token in the form of an IPFS URI, ensuring that token holders or users of the token can access the decentralized metadata.

Run this command to create the token with metadata:

```shell
node create-fungible-token-with-metadata.js
```

See `update-fungible-token-metadata.js`

This script demonstrates how to update the metadata fungible token on the Hedera Testnet using the Hedera SDK. It updates metadata reference stored on IPFS. The metadata contains a reference to an updated IPFS file containing additional metadata, such as the token creator, logo, whitepaper etc.

Run this command to update the token metadata:

```shell
node update-fungible-token-metadata.js
```


#### Example output

`upload-metadata.js`:

```bash
- Uploading JSON metadata to IPFS...
Uploaded JSON successfully: bafkreigdmoccfta7fic3xt5imohlmra...
IPFS_CID updated in .env file.
```

`create-fungible-toke-with-metadata.js`:

```bash
- Created new metadataKey: 302e020100300506032b65...
METADATA_KEY updated in .env file.
- Created token with ID: 0.0.4813...

TOKEN_ID updated in .env file.
```

`update-fungible-toke-with-metadata.js`:

```bash
Token metadata before update: <Buffer 69 70 66 73 ... >
Status of token update transaction: SUCCESS
Token updated metadata: <Buffer 69 70 66 73 63 ...>
```


## A note on SDK version

The `TokenCreateTransaction` will throw a `TypeError` when used with `setMetadata` if an older version of the SDK is used.


## References

- [Discord: Unable to set the metadata when creating a new fungible token](https://discord.com/channels/373889138199494658/768621337865486347/1278604790670299136)
  Question on Discord about metadata during the creation of a fungible token on Hedera.
- Fungible Token script adapted from original implementation in:
  [Hedera Docs: Create and Transfer your first Fungible Token](https://docs.hedera.com/hedera/tutorials/token/create-and-transfer-your-first-fungible-token)
  Official Hedera documentation providing a step-by-step guide to creating and transferring fungible tokens.
- [Github repo: Hedera Example HTS NFT](https://github.com/ed-marquez/hedera-example-hts-nft-blog-p1-p2-p3/blob/main/uploadJsonToIpfs.jss)
  Original uploadJsonToIpfs.js script by Ed Marquez
- [HIP-405](https://hips.hedera.com/hip/hip-405)
- [HIP-412](https://hips.hedera.com/hip/hip-412)
