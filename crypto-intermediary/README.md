# Sample Flow for HBAR Crypto Intermediary

## Background
There are many companies and users who want to take advantage of the powerful capabilities of the Hedera Network - but do not want to hold and manage crypto like HBAR to pay for transactions. In response to this market requirement there are companies looking to setup services as a "Crypto Intermediary" where they enter into an agreement with a company and then act as the payer for transactions in return for fees paid in Fiat. 

## Sample Flow Description

We have two actors. Bob is a company that wants to do transactions on Hedera, but does not want to manage HBAR to fund their transactions. Alice is a company that offers services as a crypto intermediary.
Bob and Alice enter into a service agreement where Bob pays Alice fees in Fiat, and Alice agrees to act as the payer (in HBAR) for Bob's transactions. After entering into the agreement Alice sets up a payer account to fund Bob's transactions and provides infrastructure for Bob to send Alice the transactions for signing and submission.

This sample flow starts with Bob creates a transaction designating Alice as the payer. Bob then signs the transaction and freezes the transaction. Bob then sends over the frozen transaction payload to Alice (using infrastructure provided by Alice). Alice receives the payload, signs the payload, and submits the transaction to the Hedera network for consensus. 
![Crypto intermediary (2)](https://github.com/Reccetech/hedera-code-snippets/assets/24242092/c39889be-bc13-41ca-b719-f271b09277f1)

#### Considerations
In this proposed flow there are a number of business and security considerations
1. The transaction must be submitted to the Hedera network within 3min of Bob signing the transaction unless Bob designates a different timestamp to a point in the future.
2.  Alice in her agreement with Bob takes on responsibility to ensure the transaction is successfully submitted.
3.  Alice would need to provide a mechanism to provide Bob the transactions details, report transaction errors, etc.
4. There is a security risk that a malicious Bob could include transactions that harm Alice (i.e. a crypto transfer that drains an Alice account). To mitigate this risk:
   - Alice should setup a dedicated payer account & associated keys specific to Bob. The funds in that acccount would only be assets that Bob will pay for. Therefore this removes any incentive for Bob to steal from Alice (because Bob would just be stealing from himself).
    - In terms of best practice Alice should still interrogate the payload from Bob before signing.

## Running the sample code

* First rename the `.env.example` file to `.env`.
* Next update the values of Bob & Alice `OPERATOR_ID` and `OPERATOR_KEY`. 
 > The  `OPERATOR_ID` will be the ED25519 account id and the `OPERATOR_KEY` will be the DER Encoded Private Key. You can grab this information from https://portal.hedera.com/login
1. Run the Bob script first
2. Upon success copy the outputted frozen transaction
3. Paste the frozen transaction into the Alice script
4. Run the Alice script to submit the transaction to Hedera testnet

## References

- [Stack Overflow](https://stackoverflow.com/questions/77374328/how-to-create-a-hedera-transaction-signed-by-one-account-but-paid-for-with-anoth?newreg=5ab66f9107194e8487a5df862b0bd8b6)

Special thanks to John Bair for his support in debugging the sample code
