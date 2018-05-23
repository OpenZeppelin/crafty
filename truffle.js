require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    local: {
      network_id: '*',
      host: 'localhost',
      port: 8545
    },

    ropsten: {
      network_id: 3,
      gas: 4700000,
      host: process.env.ROPSTEN_HOST,
      port: process.env.ROPSTEN_PORT,
      from: process.env.ROPSTEN_FROM_ADDRESS
    },

    ropsten_infura: {
      network_id: 3,
      gas: 4600000,
      provider: function() {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, `https://ropsten.infura.io/${process.env.INFURA_API_KEY}`)
      }
    }
  },

  mocha: {
    timeout: 10000,
    slow: 3000
  }
};
