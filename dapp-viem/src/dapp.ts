import {
    defineChain,
    createWalletClient,
    custom,
    publicActions,
    type Address,
    type SendTransactionErrorType,
} from 'viem';

// NOTE this is done to avoid the TS type check error for `window.ethereum` not being present.
declare global {
    interface Window {
      ethereum?: any;
    }
}

// NOTE When this PR is merged, can import `hederaTestnet` from `viem/chains` directly instead
// Ref: https://github.com/wevm/viem/pull/1758
const hederaTestnetChain = defineChain({
    id: 0x128,
    name: 'HederaTestnet',
    nativeCurrency: {
        symbol: 'ℏ',
        name: 'HBAR',
        decimals:  18,
    },
    rpcUrls: {
        default: {
            http: ['http://localhost:7546'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Hashscan',
            url: 'https://hashscan.io/testnet'
        },
    },
    contracts: {},
});

let injectedWeb3;
if (!window.ethereum) {
    throw new Error('No injected web3 instance found (window.ethereum).');
} else {
    injectedWeb3 = window.ethereum;
}

const web3Client = createWalletClient({
  chain: hederaTestnetChain,
  transport: custom(injectedWeb3),
}).extend(publicActions);

async function main() {
    const blockNumber = await web3Client.getBlockNumber();
    console.log('block number', blockNumber);

    // NOTE user will be asked to approve/ deny permission upon first time using the DApp
    const addresses = await web3Client.requestAddresses();
    console.log('addresses', addresses);

    if (addresses.length < 1) {
        throw new Error('request addresses returned none');
    }

    const balance = await web3Client.getBalance({
        address: addresses[0],
    });
    console.log('balance', balance);

    const nonce = await web3Client.getTransactionCount({
        address: addresses[0],
        blockTag: 'pending',
    });
    console.log('nonce', nonce);

    const transferAmountInput = document.querySelector('#transferAmount') as HTMLInputElement;
    const transferToInput = document.querySelector('#transferTo') as HTMLInputElement;

    document.querySelector('#transferExecute')?.addEventListener('click', async function() {
        // NOTE allow up to 10 significant figures (out of 18) when converting to `uint256`
        const transferAmount =
            BigInt(Math.floor(transferAmountInput.valueAsNumber * (10 ** 10))) * (10n ** 8n);
        const transferTo =  transferToInput.value as Address;
        console.log({
            action: 'transfer',
            transferAmount,
            transferTo,
        });
        try {
            const txHash = await web3Client.sendTransaction({
                account: addresses[0],
                to: transferTo,
                value: transferAmount,
            });
            console.log(txHash);
        } catch (ex) {
            const error = ex as SendTransactionErrorType;
            console.error(error.message, ex);
        }
    });
}

main();

