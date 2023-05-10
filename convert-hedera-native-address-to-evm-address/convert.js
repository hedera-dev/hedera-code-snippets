#!/usr/bin/env node

import {
    EntityIdHelper,
} from "@hashgraph/sdk";

function convert(hederaNativeAddress) {
    const { shard, realm, num } =
        EntityIdHelper.fromString(hederaNativeAddress);
    return EntityIdHelper.toSolidityAddress([shard, realm, num]);
}

function main() {
    console.log(`    '0.0.12345' --> '${convert('0.0.12345')}'`);
    console.log(`'17.2049.12345' --> '${convert('17.2049.12345')}'`);
}

main();
