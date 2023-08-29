# HTS fungible token - create, mint, and delete

How to use Hedera Token Service to create and mint a new fungible token.

Also, how to delete the token altogether.

## Code

See `create-and-mint.js`

- `TokenCreateTransaction` is used to create the token
- `.setTreasuryAccountId(operatorId)` tells the token to mint its initial supply to your operator account
- `.setAdminKey(operatorKey)` tells the token that any future "admin" operations,
  such as deleting the token, may only be performed by this key.
    - In this case, it is the same operator account

See `delete.js`

- First update the `.env` file to set the value of `HTS_FT_ID` to the token ID output from `create-and-mint.js` script
- `TokenDeleteTransaction` is used to delete the token
- Notably, the same operator account that matches the value used in `setAdminKey` must be used,
  as deleting a token is an "admin operation"

## References

- Nil
