# Hedera AlarmClock – Recursive HSS smart contract calls

On most EVM chains like Ethereum, smart contracts cannot "wake up" on their own—every function call must be triggered by an externally owned account (EOA) or an off-chain bot. This means implementing time-based automation (like cron jobs) requires external infrastructure.

**Hedera changes this fundamentally.**

With the **[Hedera Schedule Service (HSS) via HIP-755](https://hips.hedera.com/hip/hip-755)** and **[HIP-1215](https://hips.hedera.com/hip/hip-1215)**, smart contracts on Hedera can schedule future calls to themselves or other contracts. The Hedera network itself stores and executes these scheduled transactions when the time comes—**no off-chain bots required**.

This unlocks powerful new patterns:

- **On-chain cron jobs** for DeFi rebalancing and automation
- **Time-based vesting** and token releases
- **Recurring payments** and subscriptions
- **DAO governance** with time-delayed execution

In this tutorial, you'll build a simple **AlarmClock** contract that demonstrates this unique capability by scheduling one-shot and recurring alarms entirely on-chain.

## 💥 Quickstart: Hedera Testnet Demo

### Setup

```bash
npm install
```

---

## 🚀 Deploy Contract

```bash
npx hardhat run scripts/deploy.ts --network testnet
export CONTRACT_ADDRESS=0xYOURDEPLOYEDADDRESS
```

## Optional: Verify Contract

In order to decode events emitted from the contract, the contract must be verified.

```bash
./generate_hedera_sc_metadata.sh AlarmClockSimple
```

You can then upload the `verify-bundles/AlarmClockSimple/metadata.json` file to Hashscan to verify this contract.

---

## 🏦 Set Contract as Payer

```bash
npx hardhat run scripts/setPayer.ts --network testnet
```

---

## 🌀 Method 1: Automated Recurring with scheduleCall

```bash
npx hardhat run scripts/setSchedulingMethodScheduleCall.ts --network testnet
npx hardhat run scripts/startRebalancing.ts --network testnet
npx hardhat run scripts/monitorRebalancing.ts --network testnet    # (optional, watch in another terminal)
npx hardhat run scripts/stopRebalancing.ts --network testnet
```

---

## 🌀 Method 2: Automated Recurring with scheduleCallWithPayer (contract as payer)

```bash
npx hardhat run scripts/setSchedulingMethodScheduleCallWithPayer.ts --network testnet
npx hardhat run scripts/startRebalancing.ts --network testnet
npx hardhat run scripts/monitorRebalancing.ts --network testnet
npx hardhat run scripts/stopRebalancing.ts --network testnet
```

---

## 🌟 One-Shot Immediate Execution (executeCallOnPayerSignature, not loopable)

This demo schedules a **single, immediate function call** (`demoAction(uint256)`) to be executed using `executeCallOnPayerSignature`.  
No need to start or stop rebalancing for this demo.

```bash
npx hardhat run scripts/setPayer.ts --network testnet
npx hardhat run scripts/demoImmediateExecution.ts --network testnet
```

**You should see a `DemoActionExecuted` event emitted.**

---

## 🔍 Check Contract Config & Balance

```bash
npx hardhat run scripts/getConfig.ts --network testnet
```

---

## ✅ Monitoring

```bash
npx hardhat run scripts/monitorRebalancing.ts --network testnet
```

---

## 🔗 HashScan Events

View live events at:  
https://hashscan.io/testnet/contract/$CONTRACT_ADDRESS/events

---

## 🚨 Note: Important Scheduling Guidance!

- Use **scheduleCall** or **scheduleCallWithPayer (contract as payer)** for all automated, recurring (looped) scheduling. These methods will automatically re-schedule future contract calls ("rebalance") for continuous operation.
- Use **executeCallOnPayerSignature** only for explicit, one-shot actions (e.g. `demoAction`).  
  This method is **not supported for recursive/looped/cron operations** due to Hedera mainnet recursion protection (`NO_SCHEDULING_ALLOWED_AFTER_SCHEDULED_RECURSION`).

---

## 🗂️ Scripts Index

- `deploy.ts` — Deploys the contract.
- `setPayer.ts` — Sets contract as payer (required for all demo cases).
- `setSchedulingMethodScheduleCall.ts` — Sets scheduleCall (auto loop).
- `setSchedulingMethodScheduleCallWithPayer.ts` — Sets scheduleCallWithPayer (auto loop).
- `startRebalancing.ts` — Starts rebalancing loop.
- `monitorRebalancing.ts` — Streams contract/event status.
- `stopRebalancing.ts` — Stops rebalancing loop, deletes schedule.
- `getConfig.ts` — Shows contract state.
- `demoImmediateExecution.ts` — One-shot immediate execution demo using executeCallOnPayerSignature.
