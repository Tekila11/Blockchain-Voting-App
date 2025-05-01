import React from 'react';
import './ResultsPanel.css';

function ResultsPanel({ winner, proposals }) {
  // Calculate total votes
  const totalVotes = proposals.reduce((sum, proposal) => sum + proposal.voteCount, 0);
  
  // Sort proposals by vote count (descending)
  const sortedProposals = [...proposals].sort((a, b) => b.voteCount - a.voteCount);
  
  return (
    <div className="results-panel">
      <h3>Election Results</h3>
      
      <div className="winner-section">
        <h4>Winning Proposal</h4>
        <div className="winner-card">
          <div className="winner-description">{winner.description}</div>
          <div className="winner-stats">
            <div className="winner-votes">
              <span className="vote-number">{winner.voteCount}</span> votes
            </div>
            <div className="winner-percentage">
              {totalVotes > 0 
                ? `${Math.round((winner.voteCount / totalVotes) * 100)}%` 
                : '0%'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="all-results-section">
        <h4>All Results</h4>
        <div className="results-stats">
          <div>Total Proposals: {proposals.length}</div>
          <div>Total Votes Cast: {totalVotes}</div>
        </div>
        
        <ul className="results-list">
          {sortedProposals.map((proposal, index) => (
            <li 
              key={proposal.id}
              className={`result-item ${proposal.id === winner.id ? 'winner' : ''}`}
            >
              <div className="result-rank">#{index + 1}</div>
              <div className="result-content">
                <div className="result-description">{proposal.description}</div>
                <div className="result-bar-container">
                  <div 
                    className="result-bar"
                    style={{ 
                      width: totalVotes > 0 
                        ? `${(proposal.voteCount / totalVotes) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
              <div className="result-votes">
                <span className="vote-number">{proposal.voteCount}</span>
                <span className="vote-percentage">
                  {totalVotes > 0 
                    ? `${Math.round((proposal.voteCount / totalVotes) * 100)}%` 
                    : '0%'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ResultsPanel;