# Dissociate an account with an HTS token using JS SDK

Just like an account needs to “opt-in” to a particular token by associationg with it. An account may subsequently issociate itself from the token which it has previously associated itself with if it no longer wishes to interact with that token.

> **Note**
> The account is required to have a zero balance of the token you wish to dissociate. If a token balance is present, you will receive a `TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES` error.

## Code

- First rename the `.env.example` file to `.env`.
- Next update the values of `OPERATOR_ID` and `OPERATOR_KEY`.

> The  `OPERATOR_ID` will be the ED25519 account id and the `OPERATOR_KEY` will be the DER Encoded Private Key. You can grab this information from the [Hedera Portal](https://hubs.ly/Q03Yhbqh0)

- `TokenDissociateTransaction` class is used to build the tranasction to dissociate the provided Hedera account with the provided Hedera token(s).
- `setAccountId()` method sets the account to be dissociate with the provided tokens. Expects an `AccountId`
- `setTokenIds()` method set the tokens to be dissociate with the provided account. Expects a `List <TokenId>`.
- `freezeWith()` method freezes this transaction from further modification to prepare for signing or serialization.

## References

- [Dissociate tokens from an account](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/dissociate-tokens-from-an-account)
