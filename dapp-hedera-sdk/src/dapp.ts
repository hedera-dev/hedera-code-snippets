import * as HederaSdk from '@hashgraph/sdk';

console.log('Hello Future!');

const accountId = HederaSdk.AccountId.fromEvmAddress(
    0, 0, '0x607e20c1008fd750d2db11176f61c1dd93fa8c43');
console.log(accountId.toString());

const privateKey = HederaSdk.PrivateKey.generateECDSA();
const publicKey = privateKey.publicKey;
const evmAddress = publicKey.toEvmAddress();
console.log({
    privateKey: privateKey.toString(),
    publicKey: publicKey.toStringRaw(),
    evmAddress: `0x${evmAddress}`,
});
