require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },

    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, `https://ropsten.infura.io/${process.env.INFURA_API_KEY}`)
      },
      network_id: 3
    },

    rinkeby: {
      provider: function() {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, `https://rinkeby.infura.io/${process.env.INFURA_API_KEY}`)
      },
      network_id: 4
    }
  },

  mocha: {
    timeout: 6000,
    slow: 1000
  }
};
