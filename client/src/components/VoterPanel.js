import React, { useState } from 'react';
import './VoterPanel.css';

function VoterPanel({ workflowStatus, proposals, registerProposal, vote, hasVoted, isLoading }) {
  const [proposalDescription, setProposalDescription] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(proposals.length > 0 ? proposals[0].id : 0);

  const handleProposalSubmit = (e) => {
    e.preventDefault();
    registerProposal(proposalDescription);
    setProposalDescription('');
  };

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    vote(selectedProposal);
  };

  return (
    <div className="voter-panel">
      <h3>Voter Panel</h3>
      
      {workflowStatus === 0 && (
        <div className="panel-section">
          <h4>Registration Phase</h4>
          <p>You are registered as a voter.</p>
          <p>Please wait for the administrator to start the proposals registration.</p>
        </div>
      )}
      
      {workflowStatus === 1 && (
        <div className="panel-section">
          <h4>Submit a Proposal</h4>
          <form onSubmit={handleProposalSubmit}>
            <textarea
              placeholder="Enter your proposal description"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading}>
              Submit Proposal
            </button>
          </form>
        </div>
      )}
      
      {workflowStatus === 2 && (
        <div className="panel-section">
          <h4>Proposals Registration Ended</h4>
          <p>The proposal submission phase has ended.</p>
          <p>Please wait for the administrator to start the voting session.</p>
        </div>
      )}
      
      {workflowStatus === 3 && !hasVoted && (
        <div className="panel-section">
          <h4>Cast Your Vote</h4>
          {proposals.length > 0 ? (
            <form onSubmit={handleVoteSubmit}>
              <div className="select-container">
                <label htmlFor="proposal-select">Select a proposal:</label>
                <select
                  id="proposal-select"
                  value={selectedProposal}
                  onChange={(e) => setSelectedProposal(e.target.value)}
                  disabled={isLoading}
                >
                  {proposals.map(proposal => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.description.length > 30 
                        ? proposal.description.substring(0, 30) + '...' 
                        : proposal.description}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isLoading}>
                Vote
              </button>
            </form>
          ) : (
            <p className="warning-message">No proposals available to vote on.</p>
          )}
        </div>
      )}
      
      {workflowStatus === 3 && hasVoted && (
        <div className="panel-section">
          <h4>Vote Cast</h4>
          <p className="success-message">You have successfully cast your vote.</p>
          <p>Voting session is still active for other voters.</p>
        </div>
      )}
      
      {workflowStatus === 4 && (
        <div className="panel-section">
          <h4>Voting Session Ended</h4>
          <p>The voting session has ended.</p>
          <p>Please wait for the administrator to tally the votes.</p>
        </div>
      )}
      
      {workflowStatus === 5 && (
        <div className="panel-section">
          <h4>Election Concluded</h4>
          <p>The votes have been tallied.</p>
          <p>You can view the results in the Results Panel.</p>
        </div>
      )}
    </div>
  );
}

export default VoterPanel;