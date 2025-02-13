import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { hederaTestnet } from './chains/hederaTestnet'
import App from './App'

const { chains, publicClient } = configureChains(
  [hederaTestnet],
  [publicProvider()]
)

const client = createClient({
  autoConnect: true,
  connectors: [
  ],
  publicClient,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
)
