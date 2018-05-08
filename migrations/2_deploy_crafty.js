const Crafty = artifacts.require('Crafty');
const Test1Token = artifacts.require('Test1Token');
const Test2Token = artifacts.require('Test2Token');
const Test3Token = artifacts.require('Test3Token');

module.exports = async function (deployer) {
  deployer.deploy(Crafty).then(async () => {
    await deployer.deploy(Test1Token);
    await deployer.deploy(Test2Token);
    await deployer.deploy(Test3Token);
  });
};
