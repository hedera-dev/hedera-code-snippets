
# Unlimited Max Auto Associations JS SDK

The `max_auto_associations` property defines the number of token associations an account can automatically manage:
* **0**: No automatic associations are allowed
* **A Positive Number**: Allows up to that many automatic associations (Ex. 5 allows up to 5 automatic associations)

You can now set `max_auto_assocations` to `–1` for unlimited automatic associations when creating accounts using the JavaScript SDK.

```JavaScript
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .setMaxAutomaticTokenAssociations(-1)
    .execute(client);
```


> [!IMPORTANT]  
> Accounts created with `CryptoCreate` will still default to 0.

``` JavaScript
   const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);
```

> [!NOTE]  
> Auto-created accounts default to -1. Learn more about auto created accounts [here](https://docs.hedera.com/hedera/core-concepts/accounts/auto-account-creation).



# How to set up this code snippet
1. Rename the `.env.example` to `.env`
2. Update `.env` file with your account credentials

# How to run this code snippet
`npm i` to install dependencies

`node index.js`