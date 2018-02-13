var Crafty = artifacts.require("./Crafty.sol");

module.exports = function(deployer) {
  deployer.deploy(Crafty, 0);
};
