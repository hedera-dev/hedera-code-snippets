#Import module and classes
from hedera import PrivateKey
from hedera import FileId, FileContentsQuery
import os
from hedera import (
    Client,
    Hbar,
    PrivateKey,
    AccountCreateTransaction,
    AccountId,
    AccountBalanceQuery,
    FileCreateTransaction,
    FileContentsQuery,
    Client
    )

#create function to generate account
def generate_account():

    #Store the operator credentials
    OPERATOR_ID = AccountId.fromString('Get yours on Hedera Portal')
    OPERATOR_KEY = PrivateKey.fromString('Get yours on Hedera Portal')

    #Create client class using Operator credentials
    client = Client.forTestnet()
    client.setOperator(OPERATOR_ID, OPERATOR_KEY)

    #generate keys of the account with Hedera SDK Keys generator
    newKey = PrivateKey.generate()
    newPublicKey = newKey.getPublicKey()

    #Execute Transaction of account creation
    resp = (AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(Hbar.fromTinybars(1000))
            .execute(client))

    #Get Receipt of previous transaction
    receipt = resp.getReceipt(client)

    #Get transaction ID of previous transaction
    tx_id = receipt.transactionId.toString()

    #Get keysof newly created account from Transaction receipt
    account_id = receipt.accountId.toString()
    account_key = receipt.key.toString()

    return account_id, account_key
