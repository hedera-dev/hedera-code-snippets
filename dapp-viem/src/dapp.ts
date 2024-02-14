import {
    createWalletClient,
    custom,
    publicActions,
    type Address,
    type SendTransactionErrorType,
} from 'viem';
import {
    hedera as hederaMainnet,
    hederaTestnet,
    hederaPreviewnet,
} from 'viem/chains';

// NOTE this declare is done to avoid the TS type check error
// for `window.ethereum` not being present.
declare global {
    interface Window {
      ethereum?: any;
    }
}
let injectedWeb3;
if (!window.ethereum) {
    throw new Error('No injected web3 instance found (window.ethereum).');
} else {
    injectedWeb3 = window.ethereum;
}

// NOTE that RPC URL used will be the one set in the ibjected web3 provider (e.g. Metamask)
const web3Client = createWalletClient({
  chain: hederaTestnet,
  transport: custom(injectedWeb3, {
    retryDelay: 1000,
  }),
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

    const [balance, nonce] = await Promise.all([
        web3Client.getBalance({
            address: addresses[0],
        }),
        web3Client.getTransactionCount({
            address: addresses[0],
            blockTag: 'pending',
        })
    ]);
    console.log('balance', balance);
    console.log('nonce', nonce);

    const transferAmountInput = document.querySelector('#transferAmount') as HTMLInputElement;
    const transferToInput = document.querySelector('#transferTo') as HTMLInputElement;

    document.querySelector('#addChainMainnet')?.addEventListener('click', async function () {
        web3Client.addChain({
            chain: hederaMainnet,
        });
    });
    document.querySelector('#addChainTestnet')?.addEventListener('click', async function () {
        web3Client.addChain({
            chain: hederaTestnet,
        });
    });
    document.querySelector('#addChainPreviewnet')?.addEventListener('click', async function () {
        web3Client.addChain({
            chain: hederaPreviewnet,
        });
    });

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
