const SimpleStorage = artifacts.require("SimpleStorage");
const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  // Deploy SimpleStorage
  deployer.deploy(SimpleStorage);
  
  // Deploy Voting contract
  deployer.deploy(Voting);
};