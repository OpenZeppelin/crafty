const view = require('./view');
const error = require('./error');

// Module storage
const ethnet = {};

/*
 * Initializes the ethnet module.
 * @returns true when initialization is successful.
 */
function init() {
  if (typeof web3 === 'undefined') {
    error.noEthBrowser();
  }

  // Create a new web3 object using the current provider
  ethnet.web3 = new Web3(web3.currentProvider);
  // And promisify the callback functions that we use
  Promise.promisifyAll(ethnet.web3.version, {suffix: 'Async'});
  Promise.promisifyAll(ethnet.web3.eth, {suffix: 'Async'});

  if (ethnet.web3.currentProvider.isMetaMask) {
    view.showMetaMaskBadge();
  }

  return true;
}

/*
 * Creates a crafty contract object, used to interact with a deployed instance.
 * @returns the created contract, or undefined if one wasn't found.
 */
exports.getDeployedCrafty = async () => {
  if (!init()) {
    return;
  }

  // We need to figure out in which network we're in to fetch the appropiate
  // contract address
  ethnet.netId = await ethnet.web3.version.getNetworkAsync();
  view.setEthnetName(netInfo[ethnet.netId] ? netInfo[ethnet.netId].name : 'unknown');

  const craftyAddress = await netCraftyAddress(ethnet.netId);
  if (!craftyAddress) {
    error.noCraftyAddress();
    return;
  }

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

/*
 * Registers a callback to be called whenever the Ethereum account changes
 * on the Ethereum browser. The callback is also called immediately.
 * @param handler A function that receives an Ethereum account.
 */
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

/*
 * Registers a callback to be called whenever a new block is mined. The
 * callback is also called immediately.
 * @param handler A function that receives a block.
 */
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

/*
 * Returns a function that generates an URL from a transaction hash, linking to
 * information about that transaction.
 */
exports.txUrlGen = () => {
  return netInfo[ethnet.netId] ? netInfo[ethnet.netId].txUrlGen : () => '';
};

/*
 * Returns the address of a known deployed crafty contract for a given network
 * id.
 */
async function netCraftyAddress(netId) {
  const addresses = await $.getJSON('contract-addresses.json');
  if (addresses[netId]) {
    return addresses[netId];
  } else {
    return addresses['unknown']; // Used during local development
  }
}

// Misc information about the different networks
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
