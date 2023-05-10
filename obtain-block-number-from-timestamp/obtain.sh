#!/bin/bash

TIMESTAMP=$(date -u -j -f "%F %T" "2023-05-10 08:27:52" "+%s")
echo "Timestamp                 : ${TIMESTAMP}"

curl -s "https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=asc&timestamp=gte:${TIMESTAMP}" | jq

BLOCKNUM=$( curl -s "https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=asc&timestamp=gte:${TIMESTAMP}" | jq ".blocks[].number" )
echo "Block number (decimal)    : ${BLOCKNUM}"

curl -s "https://testnet.mirrornode.hedera.com/api/v1/blocks?limit=1&order=asc&block.number=eq:${BLOCKNUM}" | jq

BLOCKNUMHEX=$( printf "0x%x\n" ${BLOCKNUM} )
echo "Block number (hexadecimal): ${BLOCKNUMHEX}"

curl -s -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":"2","method":"eth_getBlockByNumber","params":["'"${BLOCKNUMHEX}"'", false]}' http://localhost:7546 | jq ".result"
