import React, { useState } from 'react';
import './VoterPanel.css';

function VoterPanel({ 
  workflowStatus, 
  proposals, 
  vote, 
  hasVoted, 
  isLoading,
  hasDeadline,
  votingDeadline,
  remainingTime
}) {
  const [selectedProposal, setSelectedProposal] = useState(proposals.length > 0 ? proposals[0].id : 0);

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    vote(selectedProposal);
  };
  
  // Function to check if voting deadline has passed
  const isDeadlinePassed = () => {
    if (!hasDeadline) return false;
    return Math.floor(Date.now() / 1000) >= votingDeadline;
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
          <h4>Proposals Registration Phase</h4>
          <p>The administrator is currently registering proposals.</p>
          <p>You will be able to vote once the voting session starts.</p>
          
          {hasDeadline && (
            <div className="deadline-info">
              <p>A voting deadline has been set for:</p>
              <p className="deadline-time">{new Date(votingDeadline * 1000).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
      
      {workflowStatus === 2 && (
        <div className="panel-section">
          <h4>Proposals Registration Ended</h4>
          <p>The proposal submission phase has ended.</p>
          <p>Please wait for the administrator to start the voting session.</p>
          
          {hasDeadline && (
            <div className="deadline-info">
              <p>Voting will end at:</p>
              <p className="deadline-time">{new Date(votingDeadline * 1000).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
      
      {workflowStatus === 3 && !hasVoted && !isDeadlinePassed() && (
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
              
              {hasDeadline && (
                <div className="voting-timer">
                  <p>Time remaining to vote: <span className="time-value">{remainingTime}</span></p>
                </div>
              )}
              
              <button type="submit" disabled={isLoading}>
                Vote
              </button>
            </form>
          ) : (
            <p className="warning-message">No proposals available to vote on.</p>
          )}
        </div>
      )}
      
      {workflowStatus === 3 && !hasVoted && isDeadlinePassed() && (
        <div className="panel-section">
          <h4>Voting Period Ended</h4>
          <p className="warning-message">The voting deadline has passed. You can no longer cast a vote.</p>
        </div>
      )}
      
      {workflowStatus === 3 && hasVoted && (
        <div className="panel-section">
          <h4>Vote Cast</h4>
          <p className="success-message">You have successfully cast your vote.</p>
          <p>Voting session is still active for other voters.</p>
          
          {hasDeadline && (
            <div className="deadline-info">
              <p>Voting ends at:</p>
              <p className="deadline-time">{new Date(votingDeadline * 1000).toLocaleString()}</p>
              <p>Time remaining: {remainingTime}</p>
            </div>
          )}
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