window.addEventListener('load', () => {
  if (typeof web3 !== 'undefined') {
    this.web3js = new Web3(web3.currentProvider);
    const provider = web3js.currentProvider;
    if (provider.isMetaMask) {
      $('#using-metamask').css('display', 'inline');
    }

    App.init();
  } else {
    showError(`
      <p>An Ethereum browser (such as <a href="https://metamask.io/">MetaMask</a> or <a href="https://github.com/ethereum/mist">Mist</a>) is required to use this dApp.</p>
      <div style="display: flex; justify-content: center;">
        <a href="https://metamask.io/" style="text-align: center">
          <img src="assets/download-metamask-dark.png" style="max-width: 70%">
        </a>
      </div>`);
  }
});

const App = {
  init: function () {
    web3js.version.getNetwork((err, netId) => {
      const netnames = {
        '1': 'mainnet',
        '2': 'Morden (testnet - deprecated)',
        '3': 'Ropsten (testnet)',
        '4': 'Rinkeby (testnet)',
        '42': 'Kovan (testnet)'
      };

      const netname = netnames[netId] || 'unknown';
      $('#network').text(netname);

      $.getJSON('contracts/Crafty.json').then(craftyArtifact => {
        const contract = TruffleContract(craftyArtifact);
        contract.setProvider(web3js.currentProvider);

        const craftyAddress = getCraftyAddress(netId);
        App.crafty = contract.at(craftyAddress);
        web3js.eth.getCode(craftyAddress, (err, code) => {
          if (code === craftyArtifact.deployedBytecode) {
            App.loadRules();
          } else {
            showError('<p>Could not find an up-to-date Crafty smart contract in this network. Deploy one before continuing.</p>');
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
  }
};

function getCraftyAddress(netId) {
  const craftyAddresses = {
  };

  return craftyAddresses[netId] || '0xb69cd8176616b5252dd97fc2f56aef9b1f6aaa60';
}

function accountChange(account) {
  App.userAccount = account;
  $('#user-account').text(App.userAccount);

  if (account) {
    hideError(); // A bit hacky - this clears the (possible) previous no account error
    updateInventory();
  } else {
    showError('<p>An Ethereum account needs to be selected in the Ethereum browser extension in order to use this dApp.</p>');
  }
}

function layoutRules() {
  // Inventory
  const list = $('<ul></ul>');
  App.rules.resources.forEach(resName => {
    const li = $(`<li>${resName}: </li>`).addClass('first-letter').append($('<span></span>').attr('id', `inv-res-${resName}-amount`));
    list.append(li);
  });
  list.appendTo('#inventory');

  // Actions
  const listGroup = $('<div class="list-group"></div>');
  App.rules.resources.forEach(resName => {
    const button = $(`<button type="button" id="actn-get-${resName}">Get ${resName}</button>`);
    button.addClass('list-group-item').addClass('list-group-item-action');
    button.click(() => App.crafty.getResource(resName));
    listGroup.append(button);
  });
  listGroup.appendTo('#actions');
}

async function updateInventory() {
  const inventory = await Promise.all(App.rules.resources.map(
    resName => App.crafty.resourcesOf(App.userAccount, resName).then(amount => {
      return {name: resName, amount: amount};
    })
  ));

  inventory.forEach(res => {
    $(`#inv-res-${res.name}-amount`).text(res.amount);
  });
}

function showError(content) {
  $('#modal-body').append($(content));
  $('#modal-dialog').modal('show');
}

function hideError() {
  $('#modal-dialog').modal('hide');
}
