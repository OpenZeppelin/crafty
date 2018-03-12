const ethnet = require('./ethnet');
const view = require('./view');
const error = require('./error');

// Module storage
const app = {};

window.addEventListener('load', () => {
  init();
});

async function init() {
  // Get the deployed game contract
  app.crafty = await ethnet.getDeployedCrafty();

  if (!app.crafty) {
    // Nothing to do if no Crafty object was created
    return;
  }

  // The UI is built based on the available craftables
  await loadCraftables();

  // Build the UI
  buildUI();

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

async function loadCraftables() {
  const rules = await $.getJSON('rules.json');
  app.craftables = rules.craftables;

  await Promise.all(app.craftables.map(async (craftable) => {
    craftable.address = await app.crafty.getCraftable(craftable.name);
    craftable.ui = {}; // The UI property will later store callbacks related to this craftable
  }));
}

function buildUI() {
  const basicItems = app.craftables.filter(craftable => craftable.ingredients.length === 0);
  const advItems = app.craftables.filter(craftable => craftable.ingredients.length > 0);

  // Inventory
  view.addItemList(basicItems, $('#basic-item-inv'));
  view.addItemList(advItems, $('#adv-item-inv'));

  // Actions
  view.addPendableTxButtons(basicItems, app.crafty.craft, ethnet.txUrlGen(), $('#mine-actions'));
  view.addPendableTxButtons(advItems, app.crafty.craft, ethnet.txUrlGen(), $('#craft-actions'));

  // Recipes
  view.addIngredientsList(app.craftables.filter(craftable => craftable.ingredients.length > 0), $('#recipes'));
}

async function updateInventory() {
  // We need to have the full updated inventory to be able to evaluate if an
  // item can be crafted, so we update it all at once

  const inventory = {};
  await Promise.all(app.craftables.map(craftable => {
    return app.crafty.getAmount(craftable.name).then(amount => {
      inventory[craftable.name] = amount;
    });
  }));

  // Then, update the displayed amount of each item, and its craftable status
  // (if it applies)

  app.craftables.forEach(async (craftable) => {
    craftable.ui.updateAmount(inventory[craftable.name]);
    craftable.ui.enableCraft(isCraftable(craftable, inventory));
  });
}

function isCraftable(craftable, inventory) {
  // Check all ingredients are present for the craftable
  return craftable.ingredients.every(ingredient =>
    inventory[ingredient.name] >= ingredient.amount
  );
}
