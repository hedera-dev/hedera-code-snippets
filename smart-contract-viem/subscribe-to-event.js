import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { hederaTestnet } from 'viem/chains';
import { myContract } from './contract.js'

const { CONTRACT_ADDRESS } = process.env
if (!CONTRACT_ADDRESS) {
  throw new Error('Missing CONTRACT_ADDRESS in .env')
}

const publicClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
})

async function main() {
  const unwatch = publicClient.watchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: myContract.abi,
    eventName: 'ContractClosed',
    onLogs: (logs) => {
      console.log('New event logs:', logs)
    },
    onError: (err) => {
      console.error('Error while watching events:', err)
    },
  })

  console.log(`Watching for "ContractClosed" events on ${CONTRACT_ADDRESS} ...`)

  setTimeout(() => {
    unwatch()
    console.log('Stopped watching.')
    process.exit(0)
  }, 60_000)
}

main().catch((err) => {
  console.error('Script error:', err)
  process.exit(1)
})
