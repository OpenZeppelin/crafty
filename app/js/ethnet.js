const ethnet = { // eslint-disable-line no-unused-vars
  loadWeb3: () => {
    if (typeof web3 === 'undefined') {
      error.noEthBrowser();
      return;
    }

    // Create a new web3 object using the current provider
    window.web3js = new Web3(web3.currentProvider);
    // And promisify the callback functions that we use
    Promise.promisifyAll(web3js.version, {suffix: 'Async'});
    Promise.promisifyAll(web3js.eth, {suffix: 'Async'});

    if (web3js.currentProvider.isMetaMask) {
      layout.showMetaMaskBadge();
    }
  },

  getDeployedCrafty: async () => {
    // We need to figure out in which network we're in to fetch the appropiate
    // contract address
    const netId = await web3js.version.getNetworkAsync();
    layout.setEthnetName(netName(this.netId));

    const craftyAddress = netCraftyAddress(this.netId);
    const codeAtAddress = await web3js.eth.getCodeAsync(craftyAddress);

    // We're not checking the actual code, only that there is a contract there.
    // This may yield false positives if the contract code changes but the
    // address isn't updated.
    if (codeAtAddress.length <= '0x'.length) {
      error.noDeployedCrafty();
      return;
    }

    // We have a deployed contract in the network! Load the built artifact
    // and create a contract object deployed at that address.
    const craftyArtifact = await Promise.resolve($.getJSON('contracts/Crafty.json'));
    const contract = TruffleContract(craftyArtifact);
    contract.setProvider(web3js.currentProvider);

    return contract.at(craftyAddress);
  }
};

function netName(netId) {
  return netInfo[netId] ? netInfo[netId].name : 'unknown';
}

function netTxUrl(netId) {
  return netInfo[netId] ? netInfo[netId].txUrl : () => '';
}

function netCraftyAddress(netId) {
  const craftyAddresses = {
    '3': '0x15d3a47ed3ad89790e5c1f65c98aee1169fe28cd'
  };

  return craftyAddresses[netId] || '0xca5e1ac53a2e1994a6bdf056c36c3bf0e9d065bf'; // Replace for local address during development
}

const netInfo = {
  '1': {
    'name': 'mainnet',
    'txUrl': tx => `https://etherscan.io/tx/${tx}`
  },
  '2': {
    'name': 'Morden (testnet - deprecated)',
    'txUrl': () => ``
  },
  '3': {
    'name': 'Ropsten (testnet)',
    'txUrl': tx => `https://ropsten.etherscan.io/tx/${tx}`
  },
  '4': {
    'name': 'Rinkeby (testnet)',
    'txUrl': tx => `https://rinkeby.etherscan.io/tx/${tx}`
  },
  '42': {
    'name': 'Kovan (testnet)',
    'txUrl': tx => `https://kovan.etherscan.io/tx/${tx}`
  }
};
