# Blockchain Voting App

A decentralized voting application built with Ethereum smart contracts and React.

## Features

- Full voting workflow from registration to results
- Administrator controls for managing the election process
- Proposal submission by registered voters
- Secure blockchain-based voting
- Real-time updates using smart contract events
- Responsive UI for desktop and mobile devices

## Technology Stack

- **Smart Contracts**: Solidity
- **Development Framework**: Truffle Suite
- **Local Blockchain**: Ganache
- **Frontend**: React
- **Web3 Integration**: Web3.js, MetaMask
- **Development Environment**: Visual Studio Code

## Project Structure

```
project/
├── contracts/            # Smart contracts written in Solidity
├── migrations/           # Deployment scripts
├── test/                 # Smart contract tests
├── truffle-config.js     # Truffle configuration
└── client/               # React frontend
```

## Prerequisites

- Node.js (v14.x or later)
- npm (v7.x or later)
- Truffle (v5.x)
- Ganache
- MetaMask browser extension

## Setup and Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd voting-app
   ```

2. Install dependencies
   ```
   # Install Truffle globally
   npm install -g truffle
   
   # Install project dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. Start Ganache
   - Open Ganache UI
   - Create a new workspace (or use quickstart)
   - Configure to run on `127.0.0.1:7545`

4. Compile and deploy smart contracts
   ```
   # From project root
   truffle compile
   truffle migrate --reset
   ```

5. Configure MetaMask
   - Connect to Ganache network (http://127.0.0.1:7545, Chain ID: 1337)
   - Import an account from Ganache

6. Start the React application
   ```
   cd client
   npm start
   ```

7. Open your browser to http://localhost:3000

## Smart Contract Workflow

The voting application follows a specific workflow managed by the administrator:

1. **Registering Voters**: The administrator registers voter addresses
2. **Proposals Registration**: Registered voters can submit proposals
3. **Proposals Registration Ends**: No more proposals can be submitted
4. **Voting Session**: Registered voters can vote for one proposal
5. **Voting Session Ends**: No more votes can be submitted
6. **Votes Tallied**: Results are calculated and displayed

## Testing

Run the test suite to verify smart contract functionality:

```
truffle test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Truffle Suite for the development framework
- OpenZeppelin for smart contract security patterns
- React community for frontend libraries and tools
