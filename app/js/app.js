window.addEventListener('load', async () => {
  ethnet.loadWeb3();
  App.crafty = await ethnet.getDeployedCrafty();
  App.init();
});

const App = {
  init: function () {
    App.loadRules();
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
    error.clear(); // A bit hacky - this clears the (possible) previous no account error
    updateInventory();
  } else {
    error.noEthAccount();
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

function updateInventory() {
  Object.entries(App.itemAmountUpdaters).forEach(([item, updater]) => {
    getCraftyAmount(item)().then(amount => {
      updater(amount);
    });
  });
}

function getCraftyAcquire(item) {
  return App.crafty[`acquire${pascalify(item)}`];
}

function getCraftyAmount(item) {
  return App.crafty[`amount${pascalify(item)}`];
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function pascalify(str) {
  return str.replace('-', ' ').split(' ').reduce((accum, str) => accum.concat(capitalize(str)), '');
}
