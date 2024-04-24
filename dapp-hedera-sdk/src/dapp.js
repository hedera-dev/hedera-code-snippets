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

const client = HederaSdk.Client.forTestnet().setOperator('0.0.12345', privateKey);

const topicId = '0.0.3745107';
let topicInfo;
try {
  topicInfo = await new TopicInfoQuery()
    .setTopicId(topicId)
    .execute(client);
} catch (ex) {
  console.log(ex);
  throw new Error('Topic does not exist');
}

const subscription = new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, console.log);

await new HederaSdk.TopicMessageSubmitTransaction({
    topicId,
    message: 'test message',
  }).execute(client);
