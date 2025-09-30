// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title SimpleVoting
 * @notice Minimal yes/no proposal contract:
 *         - Anyone can create a proposal with an arbitrary duration (in seconds)
 *         - Anyone can vote exactly once (yes or no) per proposal while it is active
 *         - After the deadline anyone may close it; result is final
 *
 * @dev This contract is intentionally simple (no quorum, no delegation, no upgrade)
 *      to make it ideal for illustrating fork-based interaction tests.
 */
contract SimpleVoting {
    // ========= Errors =========
    error InvalidProposal();
    error ProposalExpired();
    error AlreadyVoted();
    error ProposalNotExpired();
    error ProposalAlreadyClosed();

    // ========= Events =========
    event ProposalCreated(
        uint256 indexed id,
        address indexed creator,
        string description,
        uint64 start,
        uint64 end
    );
    event VoteCast(
        uint256 indexed id,
        address indexed voter,
        bool support,
        uint256 yesVotes,
        uint256 noVotes
    );
    event ProposalClosed(
        uint256 indexed id,
        bool passed,
        uint256 yesVotes,
        uint256 noVotes
    );

    struct Proposal {
        string description;
        uint64 start;
        uint64 end;
        uint256 yes;
        uint256 no;
        bool closed;
    }

    Proposal[] internal _proposals;
    // proposalId => voter => voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /**
     * @notice Create a proposal lasting `durationSeconds`.
     * @param description Human-readable text
     * @param durationSeconds Proposal duration (>= 1 second)
     * @return id The new proposal id
     */
    function propose(
        string calldata description,
        uint64 durationSeconds
    ) external returns (uint256 id) {
        require(durationSeconds > 0, "DURATION=0");
        uint64 start = uint64(block.timestamp);
        uint64 end = start + durationSeconds;

        id = _proposals.length;
        _proposals.push(
            Proposal({
                description: description,
                start: start,
                end: end,
                yes: 0,
                no: 0,
                closed: false
            })
        );

        emit ProposalCreated(id, msg.sender, description, start, end);
    }

    /**
     * @notice Cast a yes/no vote while proposal is active.
     * @param id Proposal id
     * @param support true = yes, false = no
     */
    function vote(uint256 id, bool support) external {
        if (id >= _proposals.length) revert InvalidProposal();
        Proposal storage p = _proposals[id];

        if (block.timestamp > p.end) revert ProposalExpired();
        if (hasVoted[id][msg.sender]) revert AlreadyVoted();

        hasVoted[id][msg.sender] = true;
        if (support) {
            unchecked {
                p.yes += 1;
            }
        } else {
            unchecked {
                p.no += 1;
            }
        }

        emit VoteCast(id, msg.sender, support, p.yes, p.no);
    }

    /**
     * @notice Close a proposal after it expires. Anyone may call.
     * @param id Proposal id
     * @return passed True if yes > no
     */
    function close(uint256 id) external returns (bool passed) {
        if (id >= _proposals.length) revert InvalidProposal();
        Proposal storage p = _proposals[id];

        if (block.timestamp <= p.end) revert ProposalNotExpired();
        if (p.closed) revert ProposalAlreadyClosed();

        p.closed = true;
        passed = p.yes > p.no;

        emit ProposalClosed(id, passed, p.yes, p.no);
    }

    /**
     * @notice Get full proposal struct.
     */
    function getProposal(
        uint256 id
    )
        external
        view
        returns (
            string memory description,
            uint64 start,
            uint64 end,
            uint256 yes,
            uint256 no,
            bool closed
        )
    {
        if (id >= _proposals.length) revert InvalidProposal();
        Proposal storage p = _proposals[id];
        return (p.description, p.start, p.end, p.yes, p.no, p.closed);
    }

    /**
     * @return total Number of proposals created
     */
    function proposalCount() external view returns (uint256 total) {
        return _proposals.length;
    }
}
