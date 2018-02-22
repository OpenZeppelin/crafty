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

function netTXUrl(netId) {
  return netInfo[netId] ? netInfo[netId].txUrl : () => '';
}

window.addEventListener('load', () => {
  toastr.options = {
    'positionClass': 'toast-bottom-center',
    'preventDuplicates': false,
    'showDuration': '300',
    'hideDuration': '1000',
    'timeOut': '5000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'fadeIn',
    'hideMethod': 'fadeOut'
  };

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
      this.netId = netId;

      const netname = netName(this.netId);
      $('#network').text(netname);

      $.getJSON('contracts/Crafty.json').then(craftyArtifact => {
        const contract = TruffleContract(craftyArtifact);
        contract.setProvider(web3js.currentProvider);

        const craftyAddress = getCraftyAddress(this.netId);
        App.crafty = contract.at(craftyAddress);
        web3js.eth.getCode(craftyAddress, (err, code) => {
          if (code.length > '0x'.length) {
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

function getCraftyAddress(netId) {
  const craftyAddresses = {
    '3': '0x8bd6c3c90ad24c4d5417d8e6c96e9638ac17b597'
  };

  return craftyAddresses[netId] || '0xe8328aac701f763e37f72494d28a66912b5c3f95';
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
  App.rules.basic.forEach(item => {
    const li = $(`<li>${item}: </li>`).addClass('first-letter').append($('<span></span>').attr('id', `inv-item-${item}-amount`));
    list.append(li);
  });
  list.appendTo('#inventory');

  // Actions - a new button is created for each
  const listGroup = $('<div class="list-group"></div>');
  App.rules.basic.forEach(item => {
    const buttonId = `actn-get-${item}`;
    const button = $(`<button type="button" id="${buttonId}" title="">Get ${item}</button>`);
    button.addClass('list-group-item').addClass('list-group-item-action d-flex justify-content-between align-items-center');

    // A badge will track the number of pending transactions
    button.append($(`<span class="badge badge-secondary badge-pill" id="${buttonId}-cnt"></span>`));
    let pendingTxs = 0;

    button.click(async () => {
      button.blur(); // To prevent the button from remaining 'active'
      const badge = $(`#${buttonId}-cnt`);

      pendingTxs += 1;
      badge.text(pendingTxs);
      button.attr('title', 'Pending TXs');

      try {
        const result = await App.crafty.getItem(item);
        toastr['success'](`<a href=${netTXUrl(App.netId)(result.tx)} target="_blank">${result.tx}</a>`, 'Broadcasted TX!');

      } catch (e) {
        toastr['error']('Failed to broadcast TX');

      } finally {
        pendingTxs -= 1;
        badge.text(pendingTxs > 0 ? pendingTxs : '');
        if (pendingTxs === 0) {
          button.attr('title', '');
        }
      }
    });

    listGroup.append(button);
  });

  listGroup.appendTo('#actions');
}

async function updateInventory() {
  const inventory = await Promise.all(App.rules.basic.map(
    item => App.crafty.itemsOf(App.userAccount, item).then(amount => {
      return {name: item, amount: amount};
    })
  ));

  inventory.forEach(item => {
    $(`#inv-item-${item.name}-amount`).text(item.amount);
  });
}

function showError(content) {
  $('#modal-body').append($(content));
  $('#modal-dialog').modal('show');
}

function hideError() {
  $('#modal-dialog').modal('hide');
}
