import React, { useState, useEffect } from 'react';
import './App.css';
import VotingApp from './VotingApp';
import Web3 from 'web3';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // Request account access
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccounts(accounts);
          setIsConnected(true);
          setConnectionError('');
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccounts(accounts);
          });
          
          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
          setConnectionError('Failed to connect to MetaMask. Please ensure it is installed and unlocked.');
        }
      } else {
        setConnectionError('MetaMask is not installed. Please install it to use this dApp.');
      }
    };

    initWeb3();
    
    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain Voting App</h1>
      </header>
      
      {connectionError ? (
        <div className="connection-error">
          <p>{connectionError}</p>
        </div>
      ) : isConnected ? (
        <main>
          <VotingApp web3={web3} accounts={accounts} />
        </main>
      ) : (
        <div className="loading">
          <p>Connecting to blockchain...</p>
        </div>
      )}
      
      <footer className="App-footer">
        <p>Connected Account: {accounts[0] || 'Not connected'}</p>
      </footer>
    </div>
  );
}

export default App;