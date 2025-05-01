import Web3 from 'web3';

/**
 * Initialize a Web3 instance with MetaMask provider
 * @returns {Promise<Web3>} Web3 instance
 */
export const initWeb3 = async () => {
  if (window.ethereum) {
    // Modern dApp browsers
    const web3Instance = new Web3(window.ethereum);
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3Instance;
    } catch (error) {
      throw new Error("User denied account access");
    }
  } else if (window.web3) {
    // Legacy dApp browsers
    return new Web3(window.web3.currentProvider);
  } else {
    // Non-dApp browsers
    throw new Error("No Ethereum browser extension detected");
  }
};

/**
 * Get connected MetaMask accounts
 * @param {Web3} web3 - Web3 instance
 * @returns {Promise<string[]>} Array of account addresses
 */
export const getAccounts = async (web3) => {
  return await web3.eth.getAccounts();
};

/**
 * Initialize a contract instance
 * @param {Web3} web3 - Web3 instance
 * @param {Object} contractArtifact - Compiled contract artifact
 * @returns {Promise<Object>} Contract instance
 */
export const initContract = async (web3, contractArtifact) => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = contractArtifact.networks[networkId];
  
  if (!deployedNetwork) {
    throw new Error("Contract not deployed to detected network");
  }
  
  return new web3.eth.Contract(
    contractArtifact.abi,
    deployedNetwork.address
  );
};

/**
 * Send a transaction to the blockchain
 * @param {Object} contract - Contract instance
 * @param {string} method - Method name to call
 * @param {Array} params - Parameters for the method
 * @param {string} fromAddress - Sender address
 * @returns {Promise<Object>} Transaction receipt
 */
export const sendTransaction = async (contract, method, params, fromAddress) => {
  try {
    return await contract.methods[method](...params).send({ from: fromAddress });
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
};

/**
 * Read data from the contract (no transaction)
 * @param {Object} contract - Contract instance
 * @param {string} method - Method name to call
 * @param {Array} params - Parameters for the method
 * @returns {Promise<any>} Contract data
 */
export const readContractData = async (contract, method, params = []) => {
  try {
    return await contract.methods[method](...params).call();
  } catch (error) {
    console.error("Read error:", error);
    throw error;
  }
};

/**
 * Format Ethereum address for display
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};

/**
 * Convert workflow status code to text
 * @param {number} status - Workflow status code
 * @returns {string} Status text
 */
export const getWorkflowStatusText = (status) => {
  const statusText = [
    "Registering Voters",
    "Proposals Registration Started",
    "Proposals Registration Ended",
    "Voting Session Started",
    "Voting Session Ended",
    "Votes Tallied"
  ];
  
  return statusText[status] || "Unknown Status";
};