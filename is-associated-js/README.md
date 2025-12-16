# Check if an account is associated with an HTS token using JS SDK

Associating an account with a Hedera Native token is unique to Hedera and is required for someone to send an HTS token to a wallet. Needing to associate protects a wallet holder from recieving unwanted tokens.

Using the mirror nodes is the recommended way to check if an account is currently associated with an HTS token. It’s important to note when you associate with a token it will show you have a 0 balance of that token. Once you receive that token your balance will go up as expected.

## Code

- First rename the `.env.example` file to `.env`.
- Next update the values of `OPERATOR_ID` and `OPERATOR_KEY`.

> The  `OPERATOR_ID` will be the ED25519 account ID and the `OPERATOR_KEY` will be the DER Encoded Private Key. You can grab this information from the [Hedera Portal](https://hubs.ly/Q03Yhbqh0)

- `hederaAccountId` The account you want to verify association for.
- `hederaTokenId` The token ID used to check if `hederaAccountId` is associated with it.

## References

- [Hedera Mirror Node REST API Swagger docs](https://testnet.mirrornode.hedera.com/api/v1/docs/#/)
