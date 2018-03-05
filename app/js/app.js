window.addEventListener('load', async () => {
  ethnet.init();
  App.init();
});

const App = {
  init: async () => {
    // Get the deployed game contract
    App.crafty = await ethnet.getDeployedCrafty();

    // Load the game rules
    App.rules = await $.getJSON('rules.json');
    App.displayRules();

    // Account changes trigger an inventory update
    ethnet.onAccountChange(account => {
      if (account) {
        error.clear(); // Hacky - this clears the (possible) previous no account error

        layout.setAccount(account);
        App.updateInventory();
      } else {
        error.noEthAccount();
      }
    });

    // New blocks also trigger an inventory update
    ethnet.onNewBlock(block => {
      layout.setBlock(block);
      App.updateInventory();
    });
  },

  displayRules: () => {
    // Inventory
    App.itemAmountUpdaters = {};
    $.extend(App.itemAmountUpdaters, layout.addItemList(App.rules.basic, $('#basic-item-inv')));
    $.extend(App.itemAmountUpdaters, layout.addItemList(App.rules.recipes.map(rec => rec.result), $('#adv-item-inv')));

    // Actions
    layout.addPendableTxButtons(App.rules.basic, getCraftyAcquire, ethnet.txUrlGen(), $('#mine-actions'));
    layout.addPendableTxButtons(App.rules.recipes.map(rec => rec.result), getCraftyAcquire, ethnet.txUrlGen(), $('#craft-actions'));

    // Recipes
    layout.addIngredientsList(App.rules.recipes, $('#recipes'));
  },

  updateInventory: () => {
    Object.entries(App.itemAmountUpdaters).forEach(async ([item, updater]) => {
      const amount = await getCraftyAmount(item)();
      updater(amount);
    });
  }
};

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
