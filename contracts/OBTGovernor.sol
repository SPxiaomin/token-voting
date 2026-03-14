// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title OBTGovernor
/// @notice Simple token-weighted Governor using OBTToken for voting power.
contract OBTGovernor is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    /// @param token Voting token implementing IVotes (OBTToken).
    constructor(IVotes token)
        Governor("OBTGovernor")
        GovernorVotes(token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {}

    /// @dev Delay (in blocks) between proposal creation and voting start.
    function votingDelay() public pure override returns (uint256) {
        return 1; // 1 block
    }

    /// @dev Voting period (in blocks) proposals remain open for voting.
    function votingPeriod() public pure override returns (uint256) {
        return 45818; // ~1 week at 12s/block
    }

    /// @dev Minimum number of votes required to create a proposal.
    function proposalThreshold() public pure override returns (uint256) {
        return 0;
    }

    // The functions below are overrides required by Solidity.

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function _getVotes(
        address account,
        uint256 timepoint,
        bytes memory params
    ) internal view override(Governor, GovernorVotes) returns (uint256) {
        return super._getVotes(account, timepoint, params);
    }

    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight,
        bytes memory params
    ) internal override(Governor, GovernorCountingSimple) returns (uint256) {
        return super._countVote(proposalId, account, support, weight, params);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

