# Associate an account with an HTS token using JS SDK

On Hedera, HTS allows you to create fungible tokens which behave similarly to ERC20 tokens, but they aren’t an exact match. One of the key differences is that an account needs to explicitly “opt-in” to a particular token in order to interact with it. This is called “token association”.


## Code

* First rename the `.env.example` file to `.env`.
* Next update the values of `OPERATOR_ID` and `OPERATOR_KEY`. 

 > The  `OPERATOR_ID` will be the ED25519 account id and the `OPERATOR_KEY` will be the DER Encoded Private Key. You can grab this information from https://portal.hedera.com/login
* `TokenAssociateTransaction` class is used to build the tranasction to associate the provided Hedera account with the provided Hedera token(s.
* `setAccountId()` method sets the account to be associated with the provided tokens. Expects an `AccountId`
* `setTokenIds()` method set the tokens to be associated with the provided account. Expects a `List <TokenId>`.
* `freezeWith()` method freezes this transaction from further modification to prepare for signing or serialization.


## References

- [Associate tokens to an account](https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/associate-tokens-to-an-account)