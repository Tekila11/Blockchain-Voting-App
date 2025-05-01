import React, { useState } from 'react';
import './AdminPanel.css';

function AdminPanel({ workflowStatus, proposalsCount, registerVoter, changeWorkflowStatus, isLoading }) {
  const [voterAddress, setVoterAddress] = useState('');

  const handleRegisterVoter = (e) => {
    e.preventDefault();
    registerVoter(voterAddress);
    setVoterAddress('');
  };

  return (
    <div className="admin-panel">
      <h3>Administrator Panel</h3>
      
      {workflowStatus === 0 && (
        <div className="panel-section">
          <h4>Register Voters</h4>
          <form onSubmit={handleRegisterVoter}>
            <input
              type="text"
              placeholder="Enter Ethereum Address"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading}>
              Register Voter
            </button>
          </form>
          
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(1)}
            disabled={isLoading}
          >
            Start Proposals Registration
          </button>
        </div>
      )}
      
      {workflowStatus === 1 && (
        <div className="panel-section">
          <h4>Proposals Registration Phase</h4>
          <p>Current proposals: {proposalsCount}</p>
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(2)}
            disabled={isLoading}
          >
            End Proposals Registration
          </button>
        </div>
      )}
      
      {workflowStatus === 2 && (
        <div className="panel-section">
          <h4>Proposals Registration Ended</h4>
          <p>Total proposals: {proposalsCount}</p>
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(3)}
            disabled={isLoading || proposalsCount === 0}
          >
            Start Voting Session
          </button>
          {proposalsCount === 0 && (
            <div className="warning-message">
              At least one proposal is needed to start voting.
            </div>
          )}
        </div>
      )}
      
      {workflowStatus === 3 && (
        <div className="panel-section">
          <h4>Voting Session Active</h4>
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(4)}
            disabled={isLoading}
          >
            End Voting Session
          </button>
        </div>
      )}
      
      {workflowStatus === 4 && (
        <div className="panel-section">
          <h4>Voting Session Ended</h4>
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(5)}
            disabled={isLoading}
          >
            Tally Votes
          </button>
        </div>
      )}
      
      {workflowStatus === 5 && (
        <div className="panel-section">
          <h4>Votes Tallied</h4>
          <p>The election has concluded.</p>
          <p>Results are now available.</p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;