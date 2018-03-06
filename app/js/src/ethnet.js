const layout = require('./layout');
const error = require('./error');

const ethnet = {};

exports.init = () => {
  if (typeof web3 === 'undefined') {
    error.noEthBrowser();
    return;
  }

  // Create a new web3 object using the current provider
  ethnet.web3 = new Web3(web3.currentProvider);
  // And promisify the callback functions that we use
  Promise.promisifyAll(ethnet.web3.version, {suffix: 'Async'});
  Promise.promisifyAll(ethnet.web3.eth, {suffix: 'Async'});

  if (ethnet.web3.currentProvider.isMetaMask) {
    layout.showMetaMaskBadge();
  }
};

exports.getDeployedCrafty = async () => {
  // We need to figure out in which network we're in to fetch the appropiate
  // contract address
  ethnet.netId = await ethnet.web3.version.getNetworkAsync();
  layout.setEthnetName(netInfo[ethnet.netId] ? netInfo[ethnet.netId].name : 'unknown');

  const craftyAddress = netCraftyAddress(ethnet.netId);
  const codeAtAddress = await ethnet.web3.eth.getCodeAsync(craftyAddress);

  // We're not checking the actual code, only that there is a contract there.
  // This may yield false positives if the contract code changes but the
  // address isn't updated.
  if (codeAtAddress.length <= '0x'.length) {
    error.noDeployedCrafty();
    return;
  }

  // We have a deployed contract in the network! Load the built artifact
  // and create a contract object deployed at that address.
  const craftyArtifact = await $.getJSON('contracts/Crafty.json');
  const contract = TruffleContract(craftyArtifact);
  contract.setProvider(ethnet.web3.currentProvider);

  return contract.at(craftyAddress);
};

exports.onAccountChange = (handler) => {
  ethnet.currentAccount = ethnet.web3.eth.accounts[0];
  // Call the handler callback once with the current account
  handler(ethnet.currentAccount);

  // There's no account change event, so we need to poll and manually check
  // for account changes
  setInterval(() => {
    const newAccount = ethnet.web3.eth.accounts[0];

    if (ethnet.currentAccount !== newAccount) {
      ethnet.currentAccount = newAccount;

      handler(ethnet.currentAccount);
    }
  }, 100);
};

exports.onNewBlock = async (handler) => {
  ethnet.currentBlock = await ethnet.web3.eth.getBlockAsync('latest');
  // Call the handler callback once with the current block
  handler(ethnet.currentBlock);

  // Most web3 providers don't support new block events, so we need to poll
  // and manually check for new blocks
  setInterval(async () => {
    const newBlock = await ethnet.web3.eth.getBlockAsync('latest');

    if (ethnet.currentBlock.number !== newBlock.number) {
      ethnet.currentBlock = newBlock;

      handler(ethnet.currentBlock);
    }
  }, 1000);
};

exports.txUrlGen = () => {
  return netInfo[ethnet.netId] ? netInfo[ethnet.netId].txUrlGen : () => '';
};

function netCraftyAddress(netId) {
  const craftyAddresses = {
    '3': '0x15d3a47ed3ad89790e5c1f65c98aee1169fe28cd'
  };

  return craftyAddresses[netId] || '0xec0caff17f1588bb6559bb9b7614471adf15adee'; // Replace for local address during development
}

const netInfo = {
  '1': {
    'name': 'mainnet',
    'txUrlGen': tx => `https://etherscan.io/tx/${tx}`
  },
  '2': {
    'name': 'Morden (testnet - deprecated)',
    'txUrlGen': () => ``
  },
  '3': {
    'name': 'Ropsten (testnet)',
    'txUrlGen': tx => `https://ropsten.etherscan.io/tx/${tx}`
  },
  '4': {
    'name': 'Rinkeby (testnet)',
    'txUrlGen': tx => `https://rinkeby.etherscan.io/tx/${tx}`
  },
  '42': {
    'name': 'Kovan (testnet)',
    'txUrlGen': tx => `https://kovan.etherscan.io/tx/${tx}`
  }
};
