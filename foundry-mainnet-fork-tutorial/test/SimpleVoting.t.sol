// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {SimpleVoting} from "../src/SimpleVoting.sol";

/**
 * @notice This test assumes the contract is already deployed on Hedera mainnet
 *         and you are running:
 *         forge test --fork-url https://mainnet.hashio.io/api [--fork-block-number X]
 *
 * 1. Deploy with the provided deployment script.
 * 2. Copy the deployed EVM address into DEPLOYED below.
 * 3. Run tests. State-changing calls affect ONLY your fork, not mainnet.
 */
contract SimpleVotingTest is Test {
    // REPLACE with your real deployed address after running deployment script.
    address internal constant DEPLOYED =
        0x6035bA3BCa9595637B463Aa514c3a1cE3f67f3de;

    SimpleVoting internal voting;

    address internal alice;
    address internal bob;
    address internal carol;

    function setUp() public {
        require(
            DEPLOYED != address(0),
            "Set DEPLOYED to the mainnet address of SimpleVoting"
        );

        voting = SimpleVoting(DEPLOYED);

        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");

        // Prevent repeated remote eth_getBalance calls (rate limit mitigation)
        vm.deal(alice, 0);
        vm.deal(bob, 0);
        vm.deal(carol, 0);

        vm.label(address(voting), "SimpleVoting");
        vm.label(alice, "Alice");
        vm.label(bob, "Bob");
        vm.label(carol, "Carol");
    }

    // ============ Helpers ============

    function _createProposalLocal(
        address creator,
        string memory desc,
        uint64 dur
    ) internal returns (uint256 id) {
        vm.prank(creator);
        id = voting.propose(desc, dur);
    }

    function _voteLocal(address voter, uint256 id, bool support) internal {
        vm.prank(voter);
        voting.vote(id, support);
    }

    // ============ Tests ============

    function test_CreateProposalAndReadBack() public {
        uint256 before = voting.proposalCount();
        uint256 id = _createProposalLocal(
            alice,
            "Enable feature flag X",
            2 hours
        );
        assertEq(voting.proposalCount(), before + 1);

        (
            string memory description,
            uint64 start,
            uint64 end,
            uint256 yes,
            uint256 no,
            bool closed
        ) = voting.getProposal(id);

        assertEq(description, "Enable feature flag X");
        assertTrue(end > start);
        assertEq(yes, 0);
        assertEq(no, 0);
        assertFalse(closed);
    }

    function test_VoteCountsIncrement() public {
        uint256 id = _createProposalLocal(alice, "Ship new UI", 30 minutes);
        _voteLocal(alice, id, true); // yes
        _voteLocal(bob, id, false); // no
        _voteLocal(carol, id, true); // yes

        (, , , uint256 yes, uint256 no, ) = voting.getProposal(id);
        assertEq(yes, 2);
        assertEq(no, 1);
    }

    function test_RevertOnDoubleVote() public {
        uint256 id = _createProposalLocal(alice, "Param Tuning", 1 hours);
        _voteLocal(alice, id, true);

        vm.prank(alice);
        vm.expectRevert(SimpleVoting.AlreadyVoted.selector);
        voting.vote(id, true);
    }

    function test_RevertOnVoteAfterDeadline() public {
        uint256 id = _createProposalLocal(alice, "Late Voting", 1 hours);

        // Warp beyond end
        (, , uint64 end, , , ) = voting.getProposal(id);
        vm.warp(end + 1);

        vm.prank(bob);
        vm.expectRevert(SimpleVoting.ProposalExpired.selector);
        voting.vote(id, true);
    }

    function test_CloseAfterDeadlineAndOutcome() public {
        uint256 id = _createProposalLocal(alice, "Adopt new fee model", 10);
        _voteLocal(alice, id, true);
        _voteLocal(bob, id, true);
        _voteLocal(carol, id, false);

        (, , uint64 end, , , ) = voting.getProposal(id);
        vm.warp(end + 1);

        bool passed = voting.close(id);
        assertTrue(passed);

        // Closing again must revert
        vm.expectRevert(SimpleVoting.ProposalAlreadyClosed.selector);
        voting.close(id);
    }

    function test_RevertCloseBeforeDeadline() public {
        uint256 id = _createProposalLocal(alice, "Early close test", 1 days);

        vm.expectRevert(SimpleVoting.ProposalNotExpired.selector);
        voting.close(id);
    }

    function test_RevertInvalidProposalId() public {
        uint256 count = voting.proposalCount();
        vm.expectRevert(SimpleVoting.InvalidProposal.selector);
        voting.getProposal(count); // out-of-range
    }

    function testFuzz_SingleVotePerAddress(address voter) public {
        vm.assume(voter != address(0));
        vm.deal(voter, 0); // avoid remote balance lookups

        uint256 id = _createProposalLocal(alice, "Fuzz Vote", 1 hours);

        vm.prank(voter);
        voting.vote(id, true);

        vm.prank(voter);
        vm.expectRevert(SimpleVoting.AlreadyVoted.selector);
        voting.vote(id, false);
    }
}
