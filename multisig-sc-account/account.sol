// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IHederaTokenService.sol";

contract Account {
    IHederaTokenService hederaTokenService;

    constructor() {
        hederaTokenService = IHederaTokenService(address(0x0167));
    }

    function performPrecompileOperation(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external {
        int64 responseCode = hederaTokenService.transferToken(token, sender, recipient, amount);
        // HederaResponseCodes.SUCCESS = 22
        require(responseCode == 22, "HTS transfer error");
    }
}
