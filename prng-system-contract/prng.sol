// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

interface IPrngSystemContract {
    // Generates a 256-bit pseudorandom seed using the first 256-bits of running hash of n-3 transaction record.
    // Users can generate a pseudorandom number in a specified range using the seed by (integer value of seed % range)
    function getPseudorandomSeed() external returns (bytes32);
}

contract Prng {
    IPrngSystemContract constant PrngSystemContract =
        IPrngSystemContract(address(0x169));

    event RandomResult(bytes32 randomBytes, uint256 num);

    function getPseudorandomSeed() public returns (bytes32 randomBytes) {
        randomBytes = PrngSystemContract.getPseudorandomSeed();
    }
    
    // Return value in the range [lo, hi)
    function getPseudorandomNumber(uint256 lo, uint256 hi) external returns (uint256 num) {
        bytes32 randomBytes = getPseudorandomSeed();
        num = uint256(randomBytes);
        num = lo + (num % (hi - lo));
        emit RandomResult(randomBytes, num);
    }
}
