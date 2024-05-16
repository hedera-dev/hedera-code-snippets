# HCS Cron Job

Runs a cron job which reads from a HCS Topic on a specific schedule (cron),
parses any newly added messages,
and conditionally invokes a task based on that message.

Example cron, which runs every 5 seconds:

```text
*/5 * * * * *
```

Note that this accomplishes a similar effect to `TopicMessageQuery#subscribe`
from the Hedera SDK, with some differences:

- Uses the Mirror Node API instead of the HAPIs
  - Note that HAPIs use gRPC Web, which is not supported by `WebClient` in the Hedera Javascript SDK
- Uses configurable `cron` based scheduling
- Uses polling, instead of subscription

This code snippet requires multiple accounts to be configured in the `.env` file.
Suggested: Use [`bip39-create-accounts`](../bip39-create-accounts) to generate a set of accounts in your `.env` file.

## Code

- The `cronTask` function performs most of the work
  - Constructs a Mirror Node API Request that reads messages on the topic, then `fetch`
  - Keeps track of the timestamp of the latest message that it has read from the topic for subsequent requests
    - See `lastSequenceNumber` and `lastTimeStamp`
  - Invokes `processMessage` once per message received, in order of `sequenceNumber`
  - Uses the configuration values from environment variables
    - `CRON_STR` and `MAX_MESSAGE_PER_QUERY` are used to rate limit requests on the Mirror Node
    - `MAX_QUERY_PER_CRON` is used to limit response size on the Mirror Node
    - `MIN_MESSAGE_TIMESTAMP` is used to set a starting point in the queue - use `0.000000000` if you wish to start from the beginning of the queue
- The `processMessage` function is where custom logic for handling the messages should be included
  - In this case, the messages are simply printed to the terminal
  - Replace this with your use case specific requirements

## References

- Crontab - http://crontab.org/
- List Topic Messages - Hedera Mirror Node API interactive docs (Swagger UI) - https://testnet.mirrornode.hedera.com/api/v1/docs/#/topics/listTopicMessagesById
- `TopicMessageQuery#subscribe` API docs - Hedera Javascript SDK - https://hashgraph.github.io/hedera-sdk-js/classes/index.TopicMessageQuery.html#subscribe
- `WebClient` - Hedera Javascript SDK - https://hashgraph.github.io/hedera-sdk-js/classes/browser.Client.html
- How to subscribe to TopicMessageQuery (Hedera SDK) without a Client instance? - Stackoverflow - https://stackoverflow.com/q/78328581/194982
