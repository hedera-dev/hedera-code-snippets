#!/bin/bash

echo "net_version"
curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"123",
            "method":"net_version",
            "params":[]
        }' \
    http://localhost:7546 \
    | jq

echo "eth_blockNumber"
BLOCK_HEXADECIMAL=$( curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"124",
            "method":"eth_blockNumber",
            "params":[]
        }' \
    http://localhost:7546 \
    | jq -r ".result" | tr '[:lower:]' '[:upper:]' )
echo ${BLOCK_HEXADECIMAL}
BLOCK=$( echo "ibase=16; ${BLOCK_HEXADECIMAL:2}" | bc )
echo ${BLOCK}

echo "eth_getBalance"
ADDRESS_EVM=0x07ffAaDFe3a598b91ee08C88e5924be3EfF35796
BALANCE_HEXADECIMAL=$( curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"125",
            "method":"eth_getBalance",
            "params":["'"${ADDRESS_EVM}"'", "latest"]
        }' \
    http://localhost:7546 \
    | jq -r ".result" | tr '[:lower:]' '[:upper:]' )
echo ${BALANCE_HEXADECIMAL}
BALANCE=$( echo "ibase=16; ${BALANCE_HEXADECIMAL:2}" | bc )
echo ${BALANCE}
