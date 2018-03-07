const Crafty = artifacts.require('./contracts/Crafty.sol');

module.exports = function (deployer) {
  deployer.deploy(Crafty);
};
