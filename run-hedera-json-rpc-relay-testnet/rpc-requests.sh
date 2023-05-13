#!/bin/bash

function echo_hex_and_dec () {
    HEXADECIMAL=$( echo "${1}" | tr '[:lower:]' '[:upper:]' )
    echo ${HEXADECIMAL}
    DECIMAL=$( echo "ibase=16; ${HEXADECIMAL:2}" | bc )
    echo ${DECIMAL}
}

echo "net_version"
CHAINID=$( curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"123",
            "method":"net_version",
            "params":[]
        }' \
    http://localhost:7546 \
    | jq -r ".result" )
echo_hex_and_dec ${CHAINID}

echo "eth_blockNumber"
BLOCK=$( curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"124",
            "method":"eth_blockNumber",
            "params":[]
        }' \
    http://localhost:7546 \
    | jq -r ".result" )
echo_hex_and_dec ${BLOCK}

echo "eth_getBalance"
ADDRESS_EVM=0x07ffAaDFe3a598b91ee08C88e5924be3EfF35796
BALANCE=$( curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "jsonrpc":"2.0",
            "id":"125",
            "method":"eth_getBalance",
            "params":["'"${ADDRESS_EVM}"'", "latest"]
        }' \
    http://localhost:7546 \
    | jq -r ".result" )
echo_hex_and_dec ${BALANCE}
