import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { hederaTestnetChain } from './hederaTestnet.js'
import { myContract } from './contract.js'

const { CONTRACT_ADDRESS } = process.env
if (!CONTRACT_ADDRESS) {
  throw new Error('Missing CONTRACT_ADDRESS in .env')
}

const publicClient = createPublicClient({
  chain: hederaTestnetChain,
  transport: http(),
})

async function main() {
  try {
    const message = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: myContract.abi,
      functionName: 'get_message',
    })
    console.log('Current contract message:', message)
  } catch (err) {
    console.error('Error reading contract:', err)
  }
}

main().catch(err => {
  console.error('Script error:', err)
  process.exit(1)
})
