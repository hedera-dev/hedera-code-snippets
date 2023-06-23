#Import clients 
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

#Create function
def fetchAccountBalance(accountId):
    
    #Get operator AccountID and PvtKey
    OPERATOR_ID = AccountId.fromString('Get yours on Hedera Portal')
    OPERATOR_KEY = PrivateKey.fromString('Get yours on Hedera Portal')

    #Call Client class and use Operator credentials
    client = Client.forTestnet()S
    client.setOperator(OPERATOR_ID, OPERATOR_KEY)

    #Enter the ID of the account whose balance the user wants to know about
    acc_id = AccountId.fromString(accountId)
    
    #Query the balance of the account
    balance = AccountBalanceQuery().setAccountId(acc_id).execute(client).hbars.toString()

    return balance
