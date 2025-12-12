// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {
    HederaScheduleService
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-schedule-service/HederaScheduleService.sol";
import {
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/HederaResponseCodes.sol";
import {
    PrngSystemContract
} from "@hashgraph/smart-contracts/contracts/system-contracts/pseudo-random-number-generator/PrngSystemContract.sol";

/// Capacity-aware on-chain rebalancer:
/// - Uses hasScheduleCapacity to probe future network availability
/// - Applies exponential backoff + jitter to find optimal scheduling windows
/// - Self-sustains by rescheduling after each execution
/// - Can be stopped by canceling pending schedules
contract RebalancerCapacityAware is HederaScheduleService {
    // Gas limit for each rebalance execution
    uint256 internal constant REBALANCE_GAS_LIMIT = 2_000_000;

    struct RebalanceConfig {
        bool active; // Is the rebalancing loop active?
        uint256 intervalSeconds; // Desired seconds between rebalances
        uint256 lastRebalanceTime; // Timestamp of last execution
        uint256 rebalanceCount; // Total number of rebalances executed
        address lastScheduleAddress; // Address of the most recent scheduled transaction
    }

    RebalanceConfig public config;

    event RebalancingStarted(uint256 intervalSeconds, uint256 firstScheduledAt);
    event RebalanceScheduled(
        uint256 chosenTime,
        uint256 desiredTime,
        address scheduleAddress
    );
    event RebalanceExecuted(uint256 timestamp, uint256 count);
    event RebalancingStopped();

    constructor() payable {}
    receive() external payable {}

    /// Start the capacity-aware rebalancing loop
    function startRebalancing(uint256 intervalSeconds) external {
        require(intervalSeconds > 0, "interval must be > 0");
        require(!config.active, "already active");

        config.active = true;
        config.intervalSeconds = intervalSeconds;
        config.lastRebalanceTime = block.timestamp;
        config.rebalanceCount = 0;

        uint256 desiredTime = block.timestamp + intervalSeconds;
        uint256 scheduledAt = _scheduleNextRebalance(desiredTime);

        emit RebalancingStarted(intervalSeconds, scheduledAt);
    }

    /// The function called by scheduled transactions
    /// Increments counter and schedules the next rebalance
    function rebalance() external {
        require(config.active, "not active");

        config.rebalanceCount += 1;
        config.lastRebalanceTime = block.timestamp;

        emit RebalanceExecuted(block.timestamp, config.rebalanceCount);

        // Schedule next rebalance
        uint256 desiredTime = block.timestamp + config.intervalSeconds;
        _scheduleNextRebalance(desiredTime);
    }

    /// Stop the rebalancing loop and cancel pending schedule
    function stopRebalancing() external {
        if (config.lastScheduleAddress != address(0)) {
            address scheduleAddress = config.lastScheduleAddress;

            // Attempt to delete the scheduled transaction
            deleteSchedule(scheduleAddress);
            // Note: We don't revert if deletion fails - just best effort
            config.lastScheduleAddress = address(0);
        }

        config.active = false;
        emit RebalancingStopped();
    }

    /// Internal:  Schedule next rebalance using capacity-aware logic
    function _scheduleNextRebalance(
        uint256 desiredTime
    ) internal returns (uint256 chosenTime) {
        // Find a second that has capacity for our gas limit
        chosenTime = _findAvailableSecond(
            desiredTime,
            REBALANCE_GAS_LIMIT,
            8 // maxProbes
        );

        bytes memory callData = abi.encodeWithSelector(this.rebalance.selector);

        (int64 rc, address scheduleAddress) = scheduleCall(
            address(this),
            chosenTime,
            REBALANCE_GAS_LIMIT,
            0,
            callData
        );
        require(rc == HederaResponseCodes.SUCCESS, "scheduleCall failed");

        config.lastScheduleAddress = scheduleAddress;

        emit RebalanceScheduled(chosenTime, desiredTime, scheduleAddress);
    }

    /// Internal: Find an available second using exponential backoff + jitter
    function _findAvailableSecond(
        uint256 expiry,
        uint256 gasLimit,
        uint256 maxProbes
    ) internal returns (uint256 second) {
        // First, try the ideal time
        if (hasScheduleCapacity(expiry, gasLimit)) {
            return expiry;
        }

        // Get pseudorandom seed from Hedera PRNG
        bytes32 seed = PrngSystemContract(address(0x169)).getPseudorandomSeed();

        // Exponential backoff with jitter
        for (uint256 i = 0; i < maxProbes; i++) {
            uint256 baseDelay = 1 << i; // 1, 2, 4, 8, 16, 32, 64, 128

            // Generate jitter from seed
            bytes32 hash = keccak256(abi.encodePacked(seed, i));
            uint16 randomValue = uint16(uint256(hash)); // Take low 16 bits
            uint256 jitter = uint256(randomValue) % (baseDelay + 1);

            uint256 candidate = expiry + baseDelay + jitter;

            if (hasScheduleCapacity(candidate, gasLimit)) {
                return candidate;
            }
        }

        revert("No capacity after maxProbes");
    }
}
