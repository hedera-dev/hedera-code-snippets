# hedera-code-snippets

Short, Self Contained, Correct Examples of code on Hedera.

See: [sscce.org](http://sscce.org/)

## Snippets

- Associate token using JS SDK: [`associate-token-js-sdk`](./associate-token-js-sdk/)
- Associate token using ethers.js & Metamask: [`associate-token-via-ethers`](./associate-token-via-ethers/)
- Check if an account is associated to a token using JS SDK: [`is-associated-js`](./is-associated-js/)
- Connect to Hedera Testnet via EthersJs: [`connect-ethersjs`](./connect-ethersjs/)
- Connect to Hedera Testnet via Viem: [`connect-viem`](./connect-viem/)
- Convert address from Hedera-native (`S.R.N`) format to EVM (`0x...`) format: [`convert-hedera-native-address-to-evm-address`](./convert-hedera-native-address-to-evm-address/)
- DApp built with Viem connected to Hedera Testnet: [`dapp-viem`](./dapp-viem/)
- Dissociate token using JS SDK: [`dissociate-token-js-sdk`](./dissociate-token-js-sdk/)
- Dissociate token using ethers.js & MetaMask: [`dissociate-via-ethers`](./dissociate-token-via-ethers/)
- Obtain "block" number based on timestamp: [`obtain-block-number-from-timestamp`](./obtain-block-number-from-timestamp/)
- Smallest units of HBAR in smart contracts: [`smallest-hbar-units-smart-contracts`](./smallest-hbar-units-smart-contracts/)
- Random number generation using system contract: [`prng-system-contract`](./prng-system-contract/)
- Convert USD to HBAR using system contract: [`convert-usd-hbar-system-contract`](./convert-usd-hbar-system-contract/)
- Run Hedera JSON RPC Relay connected to Hedera Testnet: [`run-hedera-json-rpc-relay-testnet`](./run-hedera-json-rpc-relay-testnet/)
- Throttling through partial excess gas refunds: [`excess-gas-partial-refunds`](./excess-gas-partial-refunds/)
- Create new account on Hedera Testnet using Python: [`create-new-account-py`](./create-new-account-py/)
- Deploy Smart Contract on Hedera Testnet using Python: [`deploy-smart-contract-py`](./deploy-smart-contract-py/)
- Read Account HBAR balance using Python: [`get-account-hbar-balance-py`](./get-account-hbar-balance-py/)
- Store file on Hedera Network using Python: [`store-file-onchain-py`](./store-file-onchain-py/)
- Multisig Account: [`multisig-account`](./multisig-account/)
- Multisig Smart Contract Account: [`multisig-sc-account`](./multisig-sc-account/)
- Create, mint, and delete HTS fungible tokens: [`hts-fungible-token`](./hts-fungible-token/)

## Contributing

### What to contribute

- Something that you think will be useful to developers working on Hedera technology.
- Something can be reduced to a **short, self-contained, correct example**. See [sscce.org](http://sscce.org/).
  - If your code example cannot be turned into an SSCCE, e.g. it is too complex, consider contributing a full repo on its own instead.
- Something that you think is worth explaining. For example:
  - Solutions/ workarounds for commonly encountered issues.
  - Demonstrate nuances/ differences between Hedera and other DLTs.
  - Doing something *tricky*.

### How to contribute

Submit a pull request with a new directory containing your code snippet,
plus a README file that explains it.

Suggested steps:

- Fork this repo into your github account.
- Clone your forked repo.
- Create a new branch with the name of your code snippet as the branch name.
- Create a new directory in the root directory of this repo with the name of your code snippet.
- Copy the template README file from `templates/README.md` into your new code snippet directory.
- Add one (or more) code files for your code snippet.
- Edit the README file to replace the placeholders - use existing code snippets' README files as a reference.
- Edit the main README file for this repo to add a link to your code snippet under `## Snippets`.
- Save your changes.
- Push the changes to the git remote corresponding to your forked repo.
- Submit a pull request from your branch in the forked repo against the `main` branch in this repo.

Example commands:

If you're using the `git` command line tool,
here's a set of example commands,
where `bguiz` is your github username
and `hello-world` is the name of your code snippet.

```shell
# fork the repo
# visit https://github.com/hedera-dev/hedera-code-snippets ; and press the "fork" button

# git clone the repo specifying your username as the remote to get your forked repo
git clone --origin bguiz git@github.com:bguiz/hedera-code-snippets.git

# create a new branch
cd hedera-code-snippets
git checkout -b feat/hello-world

# create a new directory
mkdir ./hello-world

# copy the README file template
cp ./templates/README.md ./hello-world/

# create code files related to your code snippet
touch ./hello-world/hello-world.js

# edit the README file to fill in the placeholders
touch ./hello-world/README.md

# edit the main README for the repo to link to your code snippet
touch ./README.md

# save changes
git add ./hello-world/hello-world.js ./hello-world/README.md
git commit -s "feat: add hello world code snippet"

# git push your branch specifying your username as the remote to update your forked repo
git push bguiz feat/hello-world

# submit a pull request
# visit https://github.com/hedera-dev/hedera-code-snippets ; and press the "compare & pull request" button

```
