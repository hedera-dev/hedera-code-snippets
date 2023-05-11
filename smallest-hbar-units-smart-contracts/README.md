# Smallest units of HBAR in smart contracts

On the hedera main website, plus the Hedera helpdesk,
the smallest unit of HBAR is the Tinybar,
which is defined as `1^-8` HBAR:

> - 1 Gℏ = 1,000,000,000 ℏ  
> - 1 Mℏ = 1,000,000 ℏ  
> - 1Kℏ = 1,000 ℏ  
> - 1 ℏ = 1 ℏ  
> - 1,000 mℏ = 1 ℏ  
> - 1,000,000 μℏ = 1 ℏ  
> - 100,000,000 tℏ = 1 ℏ

However, in HIP-410, the concept of a Weibar is introduced,
which is defined as `1^-18` HBAR.
This is even smaller than a Tinybar.

> For Ethereum transactions, we introduce the concept of “WeiBars”, which are 1 to 10^-18th the value of a HBAR.
> This is to maximize compatibility with third party tools that expect ether units to be operated on in fractions of 10^18,
> also known as a Wei.
> Thus, 1 tinyBar is 10^10 weiBars or 10 gWei.

So within the Solidity implementation,
are the units denominated in Tinybars, or Weibars?

## Code

The file `tinybars_demo.sol` in this directory,
is a smart contract with a single function named `checkBalance`.
All it does is return the value of `msg.sender.balance`.

- Deploy this smart contract to any Hedera network.
- Invoke the `checkBalance` function from your account.
- Observe that the balance returned is `10^8` times what your wallet displays in HBAR
- Therefore the smallest unit used within Solidity smart contracts is: **Weibar**.
- Note that if you were to deploy this same smart contract to Ethereum,
  you would get a different result, where
  the balance returned is `10^18` times what your wallet displays in Ether

The file `native_coin_units.sol` in this directory,
is a smart contract with several public variables that
spell out the conversions more explicitly,
as well as the differences between Hedera and Ethereum more explicitly.

## References

- [HIP-410](https://hips.hedera.com/hip/hip-410)
- [What is the "full unit" of the native coin (HBAR) on Hedera?](https://stackoverflow.com/a/76178646/194982)
- [Hedera - HBAR](https://hedera.com/hbar#:%7E:text=HBAR%20cryptocurrency%20denominations)
- [Hedera Helpdesk - What are the official HBAR cryptocurrency denominations?](https://help.hedera.com/hc/en-us/articles/360000674317-What-are-the-official-HBAR-cryptocurrency-denominations-)
