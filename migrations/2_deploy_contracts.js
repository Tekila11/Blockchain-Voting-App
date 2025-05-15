const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  // Deploy Voting contract
  deployer.deploy(Voting);
};