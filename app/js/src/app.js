const ethnet = require('./ethnet');
const view = require('./view');
const error = require('./error');

const app = {};

window.addEventListener('load', async () => {
  ethnet.init();
  init();
});

async function init() {
  // Get the deployed game contract
  app.crafty = await ethnet.getDeployedCrafty();

  // Load the game rules
  app.rules = await $.getJSON('rules.json');
  displayRules();

  // Account changes trigger an inventory update
  ethnet.onAccountChange(account => {
    if (account) {
      error.clear(); // Hacky - this clears the (possible) previous no account error

      view.setAccount(account);
      updateInventory();
    } else {
      error.noEthAccount();
    }
  });

  // New blocks also trigger an inventory update
  ethnet.onNewBlock(block => {
    view.setBlock(block);
    updateInventory();
  });
}

function displayRules() {
  // Inventory
  app.itemAmountUpdaters = {};
  $.extend(app.itemAmountUpdaters, view.addItemList(app.rules.basic, $('#basic-item-inv')));
  $.extend(app.itemAmountUpdaters, view.addItemList(app.rules.recipes.map(rec => rec.result), $('#adv-item-inv')));

  // Actions
  view.addPendableTxButtons(app.rules.basic, getCraftyAcquire, ethnet.txUrlGen(), $('#mine-actions'));
  view.addPendableTxButtons(app.rules.recipes.map(rec => rec.result), getCraftyAcquire, ethnet.txUrlGen(), $('#craft-actions'));

  // Recipes
  view.addIngredientsList(app.rules.recipes, $('#recipes'));
}

function updateInventory() {
  Object.entries(app.itemAmountUpdaters).forEach(async ([item, updater]) => {
    const amount = await getCraftyAmount(item)();
    updater(amount);
  });
}

function getCraftyAcquire(item) {
  return app.crafty[`acquire${pascalify(item)}`];
}

function getCraftyAmount(item) {
  return app.crafty[`amount${pascalify(item)}`];
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function pascalify(str) {
  return str.replace('-', ' ').split(' ').reduce((accum, str) => accum.concat(capitalize(str)), '');
}
