module.exports = {
  networks: {
    local: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  },

  mocha: {
    timeout: 10000,
    slow: 3000
  }
};
