# Get Account Info Using Hedera Portal API Keys

This script shows how to retrieve account information using the Hedera Portal API Keys (Personal Access Tokens). The script obtains the account information from the portal programmatically and checks balances using the Hedera SDK.

Developers can use this functionality to automate and manage multiple Hedera accounts programmatically, which can be useful for continous integration (CI) pipelines. This can also be used to more easily obtain account info after Testnet resets. Keep in mind that cryptographic keys from the Hedera Portal do not change after reset - only account IDs change.

## Code

**fetchPortalAccountInfo.js**: Function to obtain the information of portal account(s). Takes a URL and authorization header as inputs.

**main.js**: It begins by importing necessary modules and setting up environment variables for secure access. The script's core, an asynchronous `main` function, first fetches details of a specific account using the operator's public key and API key, including the network, account ID, private key, and key type, and logs this information. It then creates a Hedera client with these details to check the account's balance. Subsequently, it retrieves information for all accounts associated with the API key, focusing on the fourth account's details for a similar balance check.

## References

- [How to Create a Personal Access Token (API Key) on the Hedera Portal](https://docs.hedera.com/hedera/tutorials/more-tutorials/how-to-create-a-personal-access-token-api-key-on-the-hedera-portal)
- [Introducing a New Testnet Faucet and Hedera Portal Changes](https://hedera.com/blog/introducing-a-new-testnet-faucet-and-hedera-portal-changes)
