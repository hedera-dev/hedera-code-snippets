#Create new account on Hedera Testnet with PYthon 

This script allows devs to easly create a new account on Hedera Testnet using Python Wrapper for Hedera SDK.

## Code

After importing the hedera package into our file, a function is created to automatically create the New Account. Python Wrapper for Hedera SDKs has some standard functions that allow us to interact with Hedera Chain. As always, we call the operator class, i.e. our gateway to this chain. Please make sure you create your own operator account on Hedera Portal.

Once you gateway is ready, you can finally interact with the chain. First of all, we generate new keys for the account we are going to create. We do it using a function contained into hedera package. We have everything ready to create our new account: we submit the transaction using the specific method for new accounts, then through its receipt we get data from the transaction just executed and make sure the transaction was succesfully submitted.

## References

- Hedera Portal: https://portal.hedera.com/register
