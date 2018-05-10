require('dotenv').config();

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },

    ropsten: {
      network_id: 3,
      gas: 4600000,
      host: process.env.ROPSTEN_HOST,
      port: process.env.ROPSTEN_PORT,
      from: process.env.ROPSTEN_FROM_ADDRESS
    }
  },

  mocha: {
    timeout: 10000,
    slow: 3000
  }
};
