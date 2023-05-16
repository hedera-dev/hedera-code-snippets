import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';

async function main() {
    // provider
    const web3Provider = new ethers.providers.JsonRpcProvider({
        url: 'http://localhost:7546/',
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });

    // wallet init
    const seedPhrase = await fs.readFile(
        path.join('.', 'seedphrase.txt'),
        'utf8',
    );
    const localWallet = ethers.Wallet.fromMnemonic(
        seedPhrase, `m/44'/60'/0'/0/0`);
    const wallet = localWallet.connect(web3Provider);
    console.log('address', await wallet.getAddress()); 
    console.log('balance', (await wallet.getBalance()).toBigInt()); 
    
    // smart contract init on existing deployed location
    const expendGasScAddress = '0x9C58D0159495F7a8853A24574f2B8F348a72424c';
    const expendGasScAbi = new ethers.utils.Interface([
        'function updateState(uint256 newState) public returns (uint256 updatedState)'
    ]);
    const expendGasSc = new ethers.Contract(expendGasScAddress, expendGasScAbi, wallet);

    // invoke with 100% of estimated amount of gas
    await sendTxWithEstimateGasMultiple(expendGasSc, ' exact', 10000n); // 
    
    // invoke with 110% of estimated amount of gas
    await sendTxWithEstimateGasMultiple(expendGasSc, 'excess', 11000n); // 110%

    // invoke with 6.4% of estimated amount of gasd amount of gas
    await sendTxWithEstimateGasMultiple(expendGasSc, '  tiny', 640n); // 6.4% 
}

async function sendTxWithEstimateGasMultiple(expendGasSc, name, basisPoints) {
    const prefix = `(${name})`;
    const estimatedGas = (await expendGasSc.estimateGas.updateState(1_000_000_123n)).toBigInt();
    console.log(prefix, 'estimated gas', estimatedGas);
    const gasLimit = estimatedGas * basisPoints / 10000n;
    console.log(prefix, '    gas limit', gasLimit);
    const txResponse = await (await expendGasSc
        .updateState(
            1_000_000_123n,
            { gasLimit },
        ))
        .wait();
    const gasUsed = txResponse.gasUsed.toBigInt();
    console.log(prefix, '     gas used', gasUsed);
}

main();
