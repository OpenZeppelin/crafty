window.addEventListener('load', () => {
  if (typeof web3 !== 'undefined') {
    this.web3js = new Web3(web3.currentProvider);
    const provider = web3js.currentProvider;
    if (provider.isMetaMask) {
      $('#using-metamask').css('display', 'inline');
    }

    App.init();
  } else {
    layout.showNoEthBrowserError();
  }
});

const App = {
  init: function () {
    web3js.version.getNetwork((err, netId) => {
      this.netId = netId;

      const netname = netName(this.netId);
      $('#network').text(netname);

      $.getJSON('contracts/Crafty.json').then(craftyArtifact => {
        const contract = TruffleContract(craftyArtifact);
        contract.setProvider(web3js.currentProvider);

        const craftyAddress = netCraftyAddress(this.netId);
        App.crafty = contract.at(craftyAddress);
        web3js.eth.getCode(craftyAddress, (err, code) => {
          if (code.length > '0x'.length) {
            App.loadRules();
          } else {
            layout.showNoDeployedCraftyError();
          }
        });
      });
    });
  },

  loadRules: async function () {
    App.rules = await $.getJSON('rules.json');
    layoutRules();

    accountChange(web3js.eth.accounts[0]);
    setInterval(() => {
      const selectedAcc = web3js.eth.accounts[0];
      if (App.userAccount !== selectedAcc) {
        accountChange(selectedAcc);
      }
    }, 100);

    web3js.eth.getBlock('latest', false, (err, block) => {
      App.lastBlock = block;

      moment.relativeTimeThreshold('ss', 5);
      setInterval(() => {
        $('#last-block').text(`#${App.lastBlock.number} (mined ${moment.unix(App.lastBlock.timestamp).fromNow()})`);
      }, 100);

      setInterval(() => {
        web3js.eth.getBlock('latest', false, (err, block) => {
          if (block.number !== App.lastBlock.number) {
            App.lastBlock = block;
            $('#last-block').fadeOut(500, () => $('#last-block').fadeIn(500));
            updateInventory();
          }
        });
      }, 1000);
    });
  }
};

function accountChange(account) {
  App.userAccount = account;
  $('#user-account').text(App.userAccount);

  if (account) {
    layout.hideErrors(); // A bit hacky - this clears the (possible) previous no account error
    updateInventory();
  } else {
    layout.showNoEthAccountError();
  }
}

function layoutRules() {
  // Inventory
  App.itemAmountUpdaters = {};
  $.extend(App.itemAmountUpdaters, layout.addItemList(App.rules.basic, $('#basic-item-inv')));
  $.extend(App.itemAmountUpdaters, layout.addItemList(App.rules.recipes.map(rec => rec.result), $('#adv-item-inv')));

  // Actions
  layout.addPendableTxButtons(App.rules.basic, getCraftyAcquire, netTxUrl(App.netId), $('#mine-actions'));
  layout.addPendableTxButtons(App.rules.recipes.map(rec => rec.result), getCraftyAcquire, netTxUrl(App.netId), $('#craft-actions'));

  // Recipes
  layout.addIngredientsList(App.rules.recipes, $('#recipes'));
}

async function updateInventory() {
  Object.entries(App.itemAmountUpdaters).forEach(([item, updater]) => {
    getCraftyAmount(item)().then(amount => {
      updater(amount);
    });
  });
}

function getCraftyAcquire(item) {
  return () => App.crafty.craftItem(pascalify(item));
}

function getCraftyAmount(item) {
  return () => App.crafty.getItemAmount(pascalify(item));
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function pascalify(str) {
  return str.replace('-', ' ').split(' ').reduce((accum, str) => accum.concat(capitalize(str)), '');
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

  return craftyAddresses[netId] || '0xe8328aac701f763e37f72494d28a66912b5c3f95'; // Replace for local address during development
}
