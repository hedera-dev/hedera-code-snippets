# Create new account on Hedera Testnet using Python

This script allows devs to easly create a new account on Hedera Testnet using the Hedera Python SDK.

## Code

After importing the hedera package into our file, a function is created to automatically create the new account. Hedera Python SDK has some standard functions that allow us to interact with the Hedera network. As always, we use the operator class which is our gateway to this chain. Please make sure you create your own operator account on Hedera Portal.

Once your gateway is ready, you can interact with the network. First of all, we generate new keys for the account we are going to create. We do it using a function contained in the hedera package. We have everything ready to create our new account: We submit the transaction using the specific method for new accounts, then through its receipt we get data from the transaction just executed and make sure the transaction was succesfully submitted.

## References

- Hedera Portal: https://portal.hedera.com/register
