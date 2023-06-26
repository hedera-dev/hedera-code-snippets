#Import library and modules
import os
from hedera import (
    Hbar,
    FileCreateTransaction,
    ContractCreateTransaction,
    FileContentsQuery,
    AccountId,
    PrivateKey,
    Client
    )

#create function to deploy contract
def deployContract():

    #Get operator AccountID and PvtKey
    OPERATOR_ID = AccountId.fromString('Get yours on Hedera Portal')
    OPERATOR_KEY = PrivateKey.fromString('Get yours on Hedera Portal')

    #Create client class using Operator credentials. In this case we also setup max txn fee and max query payment since the transaction we are going to execute could have an higher gas limit and could be more expensive than other ones. 
    client = Client.forTestnet()
    client.setOperator(OPERATOR_ID, OPERATOR_KEY)
    client.setMaxTransactionFee(Hbar(100))
    client.setMaxQueryPayment(Hbar(10))

    #bytecode of the Smart contract compiled
    byteCode = '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506101cb806100606000396000f3fe608060405260043610610046576000357c01000000000000000000000000000000000000000000000000000000009004806341c0e1b51461004b578063cfae321714610062575b600080fd5b34801561005757600080fd5b506100606100f2565b005b34801561006e57600080fd5b50610077610162565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100b757808201518184015260208101905061009c565b50505050905090810190601f1680156100e45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610160573373ffffffffffffffffffffffffffffffffffffffff16ff5b565b60606040805190810160405280600d81526020017f48656c6c6f2c20776f726c64210000000000000000000000000000000000000081525090509056fea165627a7a72305820ae96fb3af7cde9c0abfe365272441894ab717f816f07f41f07b1cbede54e256e0029'.encode()

    #create Transaction to store on Hedera the file that will contain SC bytecode and execute it
    tnx = FileCreateTransaction()
    resp = tnx.setKeys(OPERATOR_KEY.getPublicKey()).setContents(byteCode).setMaxTransactionFee(Hbar(2)).execute(client)
    receipt = resp.getReceipt(client)

    #Get receipt of transaction executed and query the bytecode from the Query class to ensure the transaction was correctly executed and Bytecode was correctly stored.
    bytecode_tx_id = receipt.transactionId.toString()
    fileId = receipt.fileId
    query = FileContentsQuery()
    bytecode = query.setFileId(fileId).execute(client).toStringUtf8()

    #Create the transaction to deploy the smart contract on Hedera Testnet, then get Txn ID and Contract Id from this transaction receipt 
    tran = (ContractCreateTransaction()
            .setGas(1000000)
            .setBytecodeFileId(fileId)
            .setAdminKey(OPERATOR_KEY)
            .execute(client))

    receipt = tran.getReceipt(client)
    contractId = receipt.contractId
    
    contract_tx_id = receipt.transactionId.toString()
    contract_id = contractId.toString()
    
