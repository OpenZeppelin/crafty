module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  },

  mocha: {
    timeout: 1000,
    slow: 300
  }
};
