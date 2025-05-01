blockchain-voting-dapp/
│
├── .git/                          # Git repository data
├── .gitignore                     # Git ignore rules
│
├── contracts/                     # Smart contract directory
│   ├── Migrations.sol            # Default migration contract
│   ├── SimpleStorage.sol         # Simple storage example contract
│   └── Voting.sol                # Main voting contract
│
├── migrations/                    # Deployment scripts
│   ├── 1_initial_migration.js    # Deploy Migrations contract
│   └── 2_deploy_contracts.js     # Deploy application contracts
│
├── test/                          # Test directory
│   ├── simple_storage_test.js    # Tests for SimpleStorage
│   └── voting_test.js            # Tests for Voting contract
│
├── client/                        # Frontend React application
│   ├── public/                   # Public assets
│   │   ├── index.html            # Main HTML file
│   │   ├── favicon.ico           # Favicon
│   │   ├── logo192.png           # Small app logo
│   │   ├── logo512.png           # Large app logo
│   │   ├── manifest.json         # Web app manifest
│   │   └── robots.txt            # Robots file
│   │
│   ├── src/                      # Source files
│   │   ├── components/           # React components
│   │   │   ├── AdminPanel.js     # Admin interface component
│   │   │   ├── AdminPanel.css    # Admin interface styles
│   │   │   ├── VoterPanel.js     # Voter interface component
│   │   │   ├── VoterPanel.css    # Voter interface styles
│   │   │   ├── ProposalsList.js  # Proposals display component
│   │   │   ├── ProposalsList.css # Proposals display styles
│   │   │   ├── ResultsPanel.js   # Results display component
│   │   │   └── ResultsPanel.css  # Results display styles
│   │   │
│   │   ├── utils/                # Utility files
│   │   │   └── web3Utils.js      # Web3 integration utilities
│   │   │
│   │   ├── contracts/            # Compiled contract artifacts (ABI)
│   │   │   ├── Migrations.json   # Compiled Migrations contract
│   │   │   ├── SimpleStorage.json # Compiled SimpleStorage contract
│   │   │   └── Voting.json       # Compiled Voting contract
│   │   │
│   │   ├── App.js                # Main React App component
│   │   ├── App.css               # Main CSS
│   │   ├── VotingApp.js          # Voting application component
│   │   ├── VotingApp.css         # Voting app CSS
│   │   ├── SimpleStorageApp.js   # Simple storage application
│   │   ├── SimpleStorageApp.css  # Simple storage CSS
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Global CSS
│   │
│   ├── package.json              # NPM dependencies and scripts
│   └── package-lock.json         # NPM lock file
│
├── truffle-config.js              # Truffle configuration
├── package.json                   # Project dependencies
├── package-lock.json              # Project lock file
│
├── docs/                          # Documentation
│   ├── images/                   # Documentation images
│   ├── api-reference.md          # API reference documentation
│   └── user-guide.md             # User documentation
│
├── .github/                       # GitHub specific files
│   └── workflows/                # GitHub Actions workflows
│       └── ci.yml                # Continuous Integration workflow
│
├── LICENSE                        # Project license (MIT)
└── README.md                      # Project documentation
