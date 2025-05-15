import React, { useState, useEffect } from 'react';
import VotingContract from './contracts/Voting.json';
import './VotingApp.css';
import AdminPanel from './components/AdminPanel';
import VoterPanel from './components/VoterPanel';
import ProposalsList from './components/ProposalsList';
import ResultsPanel from './components/ResultsPanel';

const workflowStatusNames = [
  "Registering Voters",
  "Proposals Registration Started",
  "Proposals Registration Ended",
  "Voting Session Started",
  "Voting Session Ended",
  "Votes Tallied"
];

function VotingApp({ web3, accounts }) {
  // State variables
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [winner, setWinner] = useState({ description: '', voteCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  
  // New state variables for deadline
  const [hasDeadline, setHasDeadline] = useState(false);
  const [votingDeadline, setVotingDeadline] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        // Get the contract instance
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];
        
        if (deployedNetwork) {
          const instance = new web3.eth.Contract(
            VotingContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
          
          // Get contract state
          await updateContractState(instance, accounts[0]);
          
          // Set up event listeners
          setupEventListeners(instance);
        } else {
          setTransactionStatus('Voting contract not deployed to the detected network.');
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
        setTransactionStatus('Failed to load contract.');
      }
    };

    if (web3 && accounts.length > 0) {
      initContract();
    }
  }, [web3, accounts]);

  // Update when accounts change
  useEffect(() => {
    if (contract && accounts.length > 0) {
      updateContractState(contract, accounts[0]);
    }
  }, [accounts, contract]);

  // Update countdown timer
  useEffect(() => {
    let timer;
    if (hasDeadline && votingDeadline > Math.floor(Date.now() / 1000)) {
      timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        if (now >= votingDeadline) {
          setRemainingTime('Voting period has ended');
          clearInterval(timer);
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
    }
    
    return () => clearInterval(timer);
  }, [hasDeadline, votingDeadline]);

  // Setup event listeners for contract events
  const setupEventListeners = (contractInstance) => {
    contractInstance.events.VoterRegistered({})
      .on('data', () => {
        updateContractState(contractInstance, accounts[0]);
        setTransactionStatus('Voter registered successfully!');
        setIsLoading(false);
      })
      .on('error', error => {
        console.error("Event error:", error);
        setIsLoading(false);
      });
      
    contractInstance.events.WorkflowStatusChange({})
      .on('data', (event) => {
        const newStatus = Number(event.returnValues.newStatus);
        setWorkflowStatus(newStatus);
        setTransactionStatus(`Workflow status changed to: ${workflowStatusNames[newStatus]}`);
        updateContractState(contractInstance, accounts[0]);
        setIsLoading(false);
      })
      .on('error', error => {
        console.error("Event error:", error);
        setIsLoading(false);
      });
      
    contractInstance.events.ProposalRegistered({})
      .on('data', () => {
        updateProposals(contractInstance);
        setTransactionStatus('Proposal registered successfully!');
        setIsLoading(false);
      })
      .on('error', error => {
        console.error("Event error:", error);
        setIsLoading(false);
      });
      
    contractInstance.events.Voted({})
      .on('data', (event) => {
        if (event.returnValues.voter.toLowerCase() === accounts[0].toLowerCase()) {
          setTransactionStatus(`You voted for proposal #${event.returnValues.proposalId}!`);
          setHasVoted(true);
        } else {
          setTransactionStatus('New vote recorded!');
        }
        updateProposals(contractInstance);
        setIsLoading(false);
      })
      .on('error', error => {
        console.error("Event error:", error);
        setIsLoading(false);
      });
      
    // New event for deadline changes
    contractInstance.events.VotingDeadlineSet({})
      .on('data', (event) => {
        const timestamp = Number(event.returnValues.timestamp);
        if (timestamp === 0) {
          setTransactionStatus('Voting deadline removed.');
          setHasDeadline(false);
        } else {
          setTransactionStatus(`Voting deadline set to ${new Date(timestamp * 1000).toLocaleString()}`);
          setHasDeadline(true);
          setVotingDeadline(timestamp);
        }
        setIsLoading(false);
      })
      .on('error', error => {
        console.error("Event error:", error);
        setIsLoading(false);
      });
  };

  // Update contract state
  const updateContractState = async (contractInstance, account) => {
    try {
      const admin = await contractInstance.methods.administrator().call();
      setIsAdmin(admin.toLowerCase() === account.toLowerCase());
      
      const voter = await contractInstance.methods.voters(account).call();
      setIsRegistered(voter.isRegistered);
      setHasVoted(voter.hasVoted);
      
      const status = await contractInstance.methods.workflowStatus().call();
      setWorkflowStatus(Number(status));
      
      // Get deadline info
      const deadlineInfo = await contractInstance.methods.getDeadlineInfo().call();
      setHasDeadline(deadlineInfo[0]);
      setVotingDeadline(Number(deadlineInfo[1]));
      
      if (Number(status) === 5) { // If votes are tallied
        try {
          const winningId = await contractInstance.methods.winningProposalId().call();
          const winnerDetails = await contractInstance.methods.getProposal(winningId).call();
          setWinner({
            id: winningId,
            description: winnerDetails[0],
            voteCount: Number(winnerDetails[1])
          });
        } catch (error) {
          console.error("Error getting winner:", error);
        }
      }
      
      updateProposals(contractInstance);
    } catch (error) {
      console.error("Error updating contract state:", error);
    }
  };

  // Update proposals list
  const updateProposals = async (contractInstance) => {
    try {
      const count = await contractInstance.methods.getProposalCount().call();
      const proposalsArray = [];
      
      for (let i = 0; i < count; i++) {
        const proposal = await contractInstance.methods.getProposal(i).call();
        proposalsArray.push({
          id: i,
          description: proposal[0],
          voteCount: Number(proposal[1])
        });
      }
      
      setProposals(proposalsArray);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  // Register a voter
  const registerVoter = async (voterAddress) => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      await contract.methods.registerVoter(voterAddress).send({ from: accounts[0] });
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error registering voter:", error);
      setTransactionStatus('Failed to register voter: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Register a proposal (now admin-only)
  const registerProposal = async (description) => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      await contract.methods.registerProposal(description).send({ from: accounts[0] });
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error registering proposal:", error);
      setTransactionStatus('Failed to register proposal: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Set voting deadline
  const setDeadline = async (timestamp) => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      await contract.methods.setVotingDeadline(timestamp).send({ from: accounts[0] });
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error setting deadline:", error);
      setTransactionStatus('Failed to set deadline: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Remove voting deadline
  const removeDeadline = async () => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      await contract.methods.removeVotingDeadline().send({ from: accounts[0] });
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error removing deadline:", error);
      setTransactionStatus('Failed to remove deadline: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Change workflow status
  const changeWorkflowStatus = async (newStatus) => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      switch (newStatus) {
        case 1: // Start proposals registration
          await contract.methods.startProposalsRegistration().send({ from: accounts[0] });
          break;
        case 2: // End proposals registration
          await contract.methods.endProposalsRegistration().send({ from: accounts[0] });
          break;
        case 3: // Start voting session
          await contract.methods.startVotingSession().send({ from: accounts[0] });
          break;
        case 4: // End voting session
          await contract.methods.endVotingSession().send({ from: accounts[0] });
          break;
        case 5: // Tally votes
          await contract.methods.tallyVotes().send({ from: accounts[0] });
          break;
        default:
          throw new Error("Invalid workflow status");
      }
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error changing workflow status:", error);
      setTransactionStatus('Failed to change workflow status: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  // Vote for a proposal
  const vote = async (proposalId) => {
    setIsLoading(true);
    setTransactionStatus('');
    
    try {
      await contract.methods.vote(proposalId).send({ from: accounts[0] });
      // Status will be updated by event listener
    } catch (error) {
      console.error("Error voting:", error);
      setTransactionStatus('Failed to vote: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  if (!contract) {
    return <div className="loading">Loading contract data...</div>;
  }

  return (
    <div className="voting-app">
      <h2>Decentralized Voting Application</h2>
      
      <div className="status-bar">
        <div className="account-info">
          <div>Account: <span className="address">{accounts[0]}</span></div>
          <div>Status: {isAdmin ? 'Administrator' : (isRegistered ? 'Registered Voter' : 'Not Registered')}</div>
        </div>
        <div className="workflow-info">
          <div className="current-phase">Current phase: {workflowStatusNames[workflowStatus]}</div>
          <div className="workflow-progress">
            {workflowStatusNames.map((status, index) => (
              <div 
                key={index} 
                className={`progress-step ${index <= workflowStatus ? 'active' : ''}`}
                title={status}
              />
            ))}
          </div>
        </div>
      </div>
      
      {hasDeadline && workflowStatus === 3 && (
        <div className="deadline-banner">
          <div className="deadline-timer">
            <span className="timer-label">Voting Ends In:</span>
            <span className="timer-value">{remainingTime}</span>
          </div>
          <div className="deadline-date">
            {new Date(votingDeadline * 1000).toLocaleString()}
          </div>
        </div>
      )}
      
      {transactionStatus && (
        <div className="status-message">
          {transactionStatus}
          {isLoading && <span className="loading-spinner"></span>}
        </div>
      )}
      
      <div className="app-content">
        {/* Admin Panel */}
        {isAdmin && (
          <AdminPanel 
            web3={web3}
            contract={contract}
            accounts={accounts}
            workflowStatus={workflowStatus}
            proposalsCount={proposals.length}
            registerVoter={registerVoter}
            registerProposal={registerProposal}
            changeWorkflowStatus={changeWorkflowStatus}
            isLoading={isLoading}
            hasDeadline={hasDeadline}
            votingDeadline={votingDeadline}
            setVotingDeadline={setDeadline}
            removeVotingDeadline={removeDeadline}
          />
        )}
        
        {/* Voter Panel - Only shown to registered voters who are not administrators */}
        {isRegistered && !isAdmin && (
          <VoterPanel
            workflowStatus={workflowStatus}
            proposals={proposals}
            vote={vote}
            hasVoted={hasVoted}
            isLoading={isLoading}
            hasDeadline={hasDeadline}
            votingDeadline={votingDeadline}
            remainingTime={remainingTime}
          />
        )}
        
        {/* Proposals List */}
        {proposals.length > 0 && (
          <ProposalsList 
            proposals={proposals}
            workflowStatus={workflowStatus}
            votingEnabled={isRegistered && workflowStatus === 3 && !hasVoted}
            vote={vote}
            isLoading={isLoading}
          />
        )}
        
        {/* Results Panel */}
        {workflowStatus === 5 && (
          <ResultsPanel winner={winner} proposals={proposals} />
        )}
        
        {/* Not Registered Message */}
        {!isRegistered && !isAdmin && (
          <div className="not-registered">
            <h3>You are not registered to participate in this election</h3>
            <p>Please contact the administrator to get registered.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VotingApp;