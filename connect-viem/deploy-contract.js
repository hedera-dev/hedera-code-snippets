import 'dotenv/config'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hederaTestnetChain } from './hederaTestnet.js'
import { myContract } from './contract.js'

const { PRIVATE_KEY } = process.env

const publicClient = createPublicClient({
  chain: hederaTestnetChain,
  transport: http(),
})

const walletClient = createWalletClient({
  chain: hederaTestnetChain,
  transport: http(),
  account: privateKeyToAccount(PRIVATE_KEY),
})

async function main() {
  try {
    const txHash = await walletClient.deployContract({
      abi: myContract.abi,
      bytecode: myContract.bytecode,
      args: ['Hello from Hedera!'],
    })
    console.log('Contract deployment TX hash:', txHash)
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    console.log('Receipt:', receipt)
    if (receipt.status === 'success') {
      console.log('Contract deployed at:', receipt.contractAddress)
    } else {
      console.error(`Deployment failed with status: ${receipt.status}`)
    }
  } catch (err) {
    console.error('Error deploying contract:', err)
  }
}

main().catch(err => {
  console.error('Script Error:', err)
  process.exit(1)
})
