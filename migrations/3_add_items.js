const Crafty = artifacts.require('./contracts/Crafty.sol');
const addCraftablesFromRules = require('./addCraftablesFromRules.js');
const fs = require('fs');

module.exports = async function (deployer) { // eslint-disable-line no-unused-vars
  const crafty = await Crafty.deployed();
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));

  await addCraftablesFromRules(crafty, rules);
};
