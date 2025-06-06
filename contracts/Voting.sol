// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Voting
 * @dev Implements voting process with admin-only proposal submission and voting deadline
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
    
    // New state variables for voting deadline
    uint public votingDeadline;
    bool public hasDeadline;

    // Events
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);
    event VotingDeadlineSet(uint timestamp);

    // Modifiers
    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only administrator can perform this action");
        _;
    }

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "You are not a registered voter");
        _;
    }
    
    // Check if voting deadline has passed
    modifier deadlineNotPassed() {
        if (hasDeadline) {
            require(block.timestamp <= votingDeadline, "Voting deadline has passed");
        }
        _;
    }

    // Constructor
    constructor() {
        administrator = msg.sender;
        workflowStatus = WorkflowStatus.RegisteringVoters;
        hasDeadline = false;
    }

    // Register a voter
    function registerVoter(address _voter) public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not active");
        require(!voters[_voter].isRegistered, "Voter is already registered");
        
        voters[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }
    
    // Set voting deadline
    function setVotingDeadline(uint _timestamp) public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.RegisteringVoters || 
                workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 
                "Cannot set deadline at current status");
        require(_timestamp > block.timestamp, "Deadline must be in the future");
        
        votingDeadline = _timestamp;
        hasDeadline = true;
        emit VotingDeadlineSet(_timestamp);
    }
    
    // Remove voting deadline
    function removeVotingDeadline() public onlyAdministrator {
        require(hasDeadline, "No deadline is set");
        hasDeadline = false;
        emit VotingDeadlineSet(0);
    }

    // Start the proposal registration phase
    function startProposalsRegistration() public onlyAdministrator {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Current status is not RegisteringVoters");
        
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Register a proposal - MODIFIED: Only admin can submit proposals
    function registerProposal(string memory _description) public onlyAdministrator {
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
    function vote(uint _proposalId) public onlyRegisteredVoter deadlineNotPassed {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_proposalId < proposals.length, "Proposal does not exist");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId);
    }

    // End the voting session - can be called by admin or automatically when deadline passes
    function endVotingSession() public {
        // Allow administrator to end voting manually
        if (msg.sender == administrator) {
            require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Current status is not VotingSessionStarted");
            workflowStatus = WorkflowStatus.VotingSessionEnded;
            emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
            return;
        }
        
        // Allow anyone to end voting if deadline has passed
        require(hasDeadline && block.timestamp > votingDeadline, "Voting deadline has not passed or no deadline set");
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

    // Get voting deadline info
    function getDeadlineInfo() public view returns (bool, uint) {
        return (hasDeadline, votingDeadline);
    }

    // Get remaining time until deadline (in seconds)
    function getRemainingTime() public view returns (uint) {
        if (!hasDeadline || block.timestamp >= votingDeadline) {
            return 0;
        }
        return votingDeadline - block.timestamp;
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