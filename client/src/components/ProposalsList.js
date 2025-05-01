import React from 'react';
import './ProposalsList.css';

function ProposalsList({ proposals, workflowStatus, votingEnabled, vote, isLoading }) {
  const handleVoteClick = (proposalId) => {
    vote(proposalId);
  };

  // Sort proposals by vote count for status 5 (tallied)
  const sortedProposals = workflowStatus === 5 
    ? [...proposals].sort((a, b) => b.voteCount - a.voteCount)
    : proposals;

  return (
    <div className="proposals-list">
      <h3>Proposals {workflowStatus < 5 && `(${proposals.length})`}</h3>
      
      {proposals.length === 0 ? (
        <p className="no-proposals">No proposals have been submitted yet.</p>
      ) : (
        <ul>
          {sortedProposals.map((proposal) => (
            <li key={proposal.id} className="proposal-item">
              <div className="proposal-content">
                <div className="proposal-description">{proposal.description}</div>
                
                {workflowStatus >= 3 && (
                  <div className="proposal-votes">
                    {workflowStatus === 5 ? (
                      <span className="vote-count">Votes: {proposal.voteCount}</span>
                    ) : workflowStatus === 4 ? (
                      <span className="vote-pending">Votes pending tally</span>
                    ) : (
                      <span className="vote-active">Voting active</span>
                    )}
                  </div>
                )}
              </div>
              
              {votingEnabled && (
                <button 
                  className="vote-button"
                  onClick={() => handleVoteClick(proposal.id)} 
                  disabled={isLoading}
                >
                  Vote
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {workflowStatus === 0 && (
        <div className="phase-message">
          Waiting for proposals registration to start.
        </div>
      )}
      
      {workflowStatus === 1 && (
        <div className="phase-message">
          Proposals registration is open. Registered voters can submit proposals.
        </div>
      )}
      
      {workflowStatus === 2 && (
        <div className="phase-message">
          Proposals registration has ended. Waiting for voting to begin.
        </div>
      )}
      
      {workflowStatus === 3 && (
        <div className="phase-message highlight">
          Voting is now open! Registered voters can cast their vote.
        </div>
      )}
      
      {workflowStatus === 4 && (
        <div className="phase-message">
          Voting has ended. Waiting for votes to be tallied.
        </div>
      )}
    </div>
  );
}

export default ProposalsList;