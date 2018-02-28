module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  },

  mocha: {
    timeout: 6000,
    slow: 1000
  }
};
