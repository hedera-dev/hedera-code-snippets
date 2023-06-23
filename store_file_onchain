#Import library and modules
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

#create function
def createFile():
    

    #Get operator AccountID and PvtKey
    OPERATOR_ID = AccountId.fromString('Get yours on Hedera Portal')
    OPERATOR_KEY = PrivateKey.fromString('Get yours on Hedera Portal')

    #Create client class using Operator credentials
    client = Client.forTestnet()
    client.setOperator(OPERATOR_ID, OPERATOR_KEY)


    #Create a string that contains data to store on Hedera Testnet
    f_content = 'This is my test for new file'

    #create Transaction to store on Hedera the file and execute it
    tnx = FileCreateTransaction()
    resp = tnx.setKeys(OPERATOR_KEY.getPublicKey()).setContents(f_content).setMaxTransactionFee(Hbar(2)).execute(client)

    #Get receipt of transaction executed
    receipt = resp.getReceipt(client)

    #Get transaction ID
    tx_id = receipt.transactionId.toString()
    
    #Get file ID from receipt  and call the class to query the content of the file
    fileId = receipt.fileId
    query = FileContentsQuery()

    #Retreive file content through its IDusing the Query class
    fileContent = query.setFileId(fileId).execute(client).toStringUtf8()
