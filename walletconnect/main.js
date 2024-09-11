import {
  AccountId,
  TokenAssociateTransaction,
  TokenId,
} from "@hashgraph/sdk";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";

// Global state for wallet connection
let accountId = '';
let isConnected = false;

// Network configuration
const NETWORK_CONFIG = {
  testnet: {
    network: "testnet",
    jsonRpcUrl: "https://testnet.hedera.validationcloud.io/v1/GYSdi5Rlhc-NmoBLSVJGsqVQDOL6C4lCCQbyHc3NvsM",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
    chainId: "0x128",
  },
};

const walletConnectProjectId = "377d75bb6f86a2ffd427d032ff6ea7d3";
const currentNetworkConfig = NETWORK_CONFIG.testnet;
const hederaNetwork = currentNetworkConfig.network;
const metadata = {
  name: "Hedera Vanilla JS",
  description: "Simple Hedera WalletConnect Integration",
  url: window.location.origin,
  icons: [window.location.origin + "/logo192.png"],
};

// Initialize WalletConnect
const dappConnector = new DAppConnector(
  metadata,
  hederaNetwork,
  walletConnectProjectId,
  Object.values(HederaJsonRpcMethod),
  [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  [HederaChainId.Testnet]
);

// Ensure WalletConnect is initialized only once
let walletConnectInitPromise = undefined;
const initializeWalletConnect = async () => {
  if (walletConnectInitPromise === undefined) {
    walletConnectInitPromise = dappConnector.init();
  }
  await walletConnectInitPromise;
};

// Sync WalletConnect state
function syncWalletconnectState() {
  const account = dappConnector.signers[0]?.getAccountId()?.toString();
  if (account) {
    accountId = account;
    isConnected = true;
    updateAccountIdDisplay(accountId);
  } else {
    accountId = '';
    isConnected = false;
    updateAccountIdDisplay("No account connected");
  }
}

// Open WalletConnect modal
const openWalletConnectModal = async () => {
  try {
    await initializeWalletConnect();
    if (!isConnected) {
      await dappConnector.openModal().then(() => {
        syncWalletconnectState();
      });
    } else {
      console.log("Already connected.");
    }
  } catch (error) {
    console.error("Failed to open WalletConnect modal", error);
  }
};

// Disconnect Wallet
const disconnectWallet = async () => {
  if (isConnected) {
    try {
      await dappConnector.disconnectAll();
      isConnected = false;
      syncWalletconnectState();
      console.log('Disconnected from wallet');
    } catch (error) {
      console.error("Failed to disconnect wallet", error);
    }
  } else {
    console.log("No active session to disconnect from.");
  }
};

// Update Account ID in DOM
function updateAccountIdDisplay(accountId) {
  const accountIdElement = document.getElementById("accountId");
  const disconnectButton = document.getElementById("disconnectButton");

  // Ensure the elements exist before trying to update them
  if (accountIdElement && disconnectButton) {
    if (accountId && accountId !== "No account connected") {
      accountIdElement.innerHTML = accountId;
      disconnectButton.innerHTML = `Connected - Click Button to disconnect`;
    } else {
      accountIdElement.innerHTML = "No account connected";
      disconnectButton.innerHTML = "Connect to WalletConnect";
    }
  } else {
    console.error("DOM elements for accountId or disconnectButton not found.");
  }
}

// Clear session on page load
const clearSessionOnLoad = () => {
  if (isConnected) {
    dappConnector.disconnectAll();
    isConnected = false;
    updateAccountIdDisplay("No account connected");
  }
}

// **Token association**: Define the function before attaching the event listener
async function handleTokenAssociation() {
  const tokenId = document.getElementById('associateTokenId').value;
  if (!tokenId) {
    console.error('Token ID is required.');
    return;
  }

  try {
    const associateTokenTransaction = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)]);

    const signer = dappConnector.signers[0];

    // Freeze and execute with the signer
    await associateTokenTransaction.freezeWithSigner(signer);
    const txResult = await associateTokenTransaction.executeWithSigner(signer);
    console.log(`Token ${tokenId} associated successfully.`);
  } catch (error) {
    console.error(`Failed to associate token: ${error.message}`);
  }
}

// **Ensure the DOM is fully loaded before attaching event listeners**
document.addEventListener('DOMContentLoaded', async () => {
  await initializeWalletConnect();

  // Clear session on load
  clearSessionOnLoad();

  // Ensure the buttons exist before adding event listeners
  const disconnectButton = document.getElementById('disconnectButton');
  const associateButton = document.getElementById('associateButton');

  if (disconnectButton) {
    disconnectButton.addEventListener('click', () => {
      if (isConnected) {
        disconnectWallet();
      } else {
        openWalletConnectModal();
      }
    });
  }

  // Attach the token association event listener
  if (associateButton) {
    associateButton.addEventListener('click', handleTokenAssociation);
  }
});
