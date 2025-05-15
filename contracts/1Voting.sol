// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Voting
 * @dev Implements voting process
 */
contract Voting {
    // Voter structure
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    // Proposal structure
    struct Proposal {
        string description;
        uint voteCount;
    }

    // Election status enum
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    // State variables
    address public administrator;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    WorkflowStatus public workflowStatus;
    uint public winningProposalId;

    // Events
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    // Modifiers
    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only administrator can perform this action");
        _;
    }

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "You are not a registered voter");
        _;
    }

    // Constructor
    constructor() {
        administrator = msg.sender;
        workflowStatus = WorkflowStatus.RegisteringVoters;
    }

    // Register a voter
    function registerVoter(address _voter) public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not active");
        require(!voters[_voter].isRegistered, "Voter is already registered");
        
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    // Start the proposal registration phase
    function startProposalsRegistration() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Current status is not RegisteringVoters");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Register a proposal
    function registerProposal(string memory _description) public onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals registration is not active");
        require(bytes(_description).length > 0, "Proposal description cannot be empty");
        
        proposals.push(Proposal({
            description: _description,
            voteCount: 0
        }));
        
        emit ProposalRegistered(proposals.length - 1);
    }

    // End the proposal registration phase
    function endProposalsRegistration() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Current status is not ProposalsRegistrationStarted");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Start the voting session
    function startVotingSession() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Current status is not ProposalsRegistrationEnded");
        require(proposals.length > 0, "No proposals registered");
        
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Vote for a proposal
    function vote(uint _proposalId) public onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_proposalId < proposals.length, "Proposal does not exist");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId);
    }

    // End the voting session
    function endVotingSession() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Current status is not VotingSessionStarted");
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Tally votes and determine the winner
    function tallyVotes() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not VotingSessionEnded");
        
        uint winningVoteCount = 0;
        
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
        
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    // Get winning proposal
    function getWinner() public view returns (string memory, uint) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes have not been tallied yet");
        return (proposals[winningProposalId].description, proposals[winningProposalId].voteCount);
    }

    // Get proposal count
    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }

    // Get proposal details
    function getProposal(uint _proposalId) public view returns (string memory, uint) {
        require(_proposalId < proposals.length, "Proposal does not exist");
        return (proposals[_proposalId].description, proposals[_proposalId].voteCount);
    }
}