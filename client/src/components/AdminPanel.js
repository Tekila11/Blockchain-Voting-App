import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ 
  web3, 
  contract, 
  accounts, 
  workflowStatus, 
  proposalsCount, 
  registerVoter, 
  registerProposal, 
  changeWorkflowStatus, 
  isLoading,
  hasDeadline,
  votingDeadline,
  setVotingDeadline,
  removeVotingDeadline
}) {
  const [voterAddress, setVoterAddress] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [remainingTime, setRemainingTime] = useState('');

  // Setup deadline countdown timer
  useEffect(() => {
    let timer;
    if (hasDeadline && votingDeadline > Math.floor(Date.now() / 1000)) {
      timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        if (now >= votingDeadline) {
          setRemainingTime('Voting period has ended');
          clearInterval(timer);
          
          // Call endVoting if in voting stage
          if (workflowStatus === 3) {
            try {
              contract.methods.endVotingSession().send({ from: accounts[0] });
            } catch (error) {
              console.error("Error ending voting session:", error);
            }
          }
        } else {
          const diff = votingDeadline - now;
          const days = Math.floor(diff / 86400);
          const hours = Math.floor((diff % 86400) / 3600);
          const minutes = Math.floor((diff % 3600) / 60);
          const seconds = diff % 60;
          
          setRemainingTime(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
          );
        }
      }, 1000);
    } else if (hasDeadline) {
      setRemainingTime('Voting period has ended');
    } else {
      setRemainingTime('No deadline set');
    }
    
    return () => clearInterval(timer);
  }, [hasDeadline, votingDeadline, workflowStatus, contract, accounts]);

  const handleRegisterVoter = (e) => {
    e.preventDefault();
    registerVoter(voterAddress);
    setVoterAddress('');
  };

  const handleRegisterProposal = (e) => {
    e.preventDefault();
    registerProposal(proposalDescription);
    setProposalDescription('');
  };

  const handleSetDeadline = (e) => {
    e.preventDefault();
    
    // Combine date and time inputs into a timestamp
    const deadlineTimestamp = Math.floor(new Date(`${deadlineDate}T${deadlineTime}`).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    if (deadlineTimestamp <= now) {
      alert('Deadline must be in the future');
      return;
    }
    
    setVotingDeadline(deadlineTimestamp);
    setDeadlineDate('');
    setDeadlineTime('');
  };

  const handleRemoveDeadline = () => {
    removeVotingDeadline();
  };

  // Get minimum date (today) for the date picker
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="admin-panel">
      <h3>Administrator Panel</h3>
      
      {/* Deadline Section (displayed in stages 0-3) */}
      {workflowStatus <= 3 && (
        <div className="panel-section deadline-section">
          <h4>Voting Deadline</h4>
          
          {hasDeadline ? (
            <div className="deadline-info">
              <p>
                <strong>Deadline:</strong> {new Date(votingDeadline * 1000).toLocaleString()}
              </p>
              <p className="countdown">
                <strong>Remaining:</strong> {remainingTime}
              </p>
              <button 
                onClick={handleRemoveDeadline}
                disabled={isLoading || workflowStatus > 2}
                className="deadline-button"
              >
                Remove Deadline
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetDeadline}>
              <div className="deadline-inputs">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  min={getTodayDate()}
                  required
                  disabled={isLoading || workflowStatus > 2}
                />
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  required
                  disabled={isLoading || workflowStatus > 2}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || workflowStatus > 2}
                className="deadline-button"
              >
                Set Voting Deadline
              </button>
            </form>
          )}
        </div>
      )}
      
      {/* Voter Registration (Stage 0) */}
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
      
      {/* Proposal Registration (Stage 1) */}
      {workflowStatus === 1 && (
        <div className="panel-section">
          <h4>Add Proposal</h4>
          <form onSubmit={handleRegisterProposal}>
            <textarea
              placeholder="Enter proposal description"
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading}>
              Submit Proposal
            </button>
          </form>
          
          <div className="proposals-info">
            <p>Current proposals: {proposalsCount}</p>
          </div>
          
          <button
            className="workflow-button"
            onClick={() => changeWorkflowStatus(2)}
            disabled={isLoading}
          >
            End Proposals Registration
          </button>
        </div>
      )}
      
      {/* Proposals Registration Ended (Stage 2) */}
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
      
      {/* Voting Session Active (Stage 3) */}
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
      
      {/* Voting Session Ended (Stage 4) */}
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
      
      {/* Votes Tallied (Stage 5) */}
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