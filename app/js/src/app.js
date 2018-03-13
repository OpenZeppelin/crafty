const ethnet = require('./ethnet');
const view = require('./view');
const error = require('./error');

// Module storage
const app = {};

window.addEventListener('load', () => {
  view.init();

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

/*
 * Loads the game rules and creates the craftables data structure using that
 * information.
 */
async function loadCraftables() {
  const rules = await $.getJSON('rules.json');
  app.craftables = rules.craftables;

  await Promise.all(app.craftables.map(async (craftable) => {
    craftable.address = await app.crafty.getCraftable(craftable.name);

    // The UI property is used to store view callbacks and other UI-related
    // data
    craftable.ui = {
      pendingTxs: []
    };
  }));
}

/*
 * Builds the UI (inventory, actions, recipes) from the craftables data
 * structure, adding UI callbacks to it.
 */
function buildUI() {
  const basicItems = app.craftables.filter(craftable => craftable.ingredients.length === 0);
  const advItems = app.craftables.filter(craftable => craftable.ingredients.length > 0);

  // Inventory
  view.addItemList(basicItems, $('#basic-item-inv'));
  view.addItemList(advItems, $('#adv-item-inv'));

  // Actions
  view.addCraftButtons(basicItems, onCraft, $('#mine-actions'));
  view.addCraftButtons(advItems, onCraft, $('#craft-actions'));

  // Recipes
  view.addIngredientsList(app.craftables.filter(craftable => craftable.ingredients.length > 0), $('#recipes'));
}

/*
 * Calls the craft function on the contract, storing the transaction's hash to
 * enable optimistic updates.
 */
async function onCraft(craftable) {
  try {
    // sendTransaction returns immediately after the transaction is broadcasted
    // (i.e. after it is signed by the Ethereum Browser)
    const txHash = await app.crafty.craft.sendTransaction(craftable.name);

    craftable.ui.pendingTxs.push({hash: txHash});
    // Trigger an inventory update to reflect the new pending transaction
    updateInventory();

  } catch (e) {
    // The transaction did not fail, it was simply never sent
    view.toastFailedToSendTx();
  }
}

/*
 * Fetches the current balance of each craftable (taking into account pending
 * transactions) and updates the UI. Confirmed transactions are removed from
 * the pending lists.
 */
async function updateInventory() {
  // We need to have the full updated inventory to be able to evaluate if an
  // item can be crafted, so we update it all at once
  const inventory = {};
  await Promise.all(app.craftables.map(craftable => {
    return app.crafty.getAmount(craftable.name).then(amount => {
      inventory[craftable.name] = {
        current: Number(amount) // The current balance in the blockchain
      };
    });
  }));

  await clearConfirmedTXs();

  // Optimistically update the amounts (assuming the pending transactions will
  // succeed)
  app.craftables.forEach(craftable => {
    // The current inventory is not updated, only the pending one, to prevent
    // not-yet crafted craftables from being used as ingredients (which will
    // likely fail)
    inventory[craftable.name].pending = craftable.ui.pendingTxs.length;

    // Ingredients of pending transactions, however, are subtracted from the
    // current amount, to prevent them from being used again (this rolls back
    // if the transaction fails)
    craftable.ingredients.forEach(ingredient => {
      inventory[ingredient.name].current -= craftable.ui.pendingTxs.length * ingredient.amount;
    });
  });

  // Then, update the displayed amount of each item, and its craftable status
  app.craftables.forEach(async (craftable) => {
    craftable.ui.updateAmount(inventory[craftable.name].current, inventory[craftable.name].pending);
    craftable.ui.enableCraft(isCraftable(craftable, inventory));
  });
}

/*
 * Removes all confirmed transactions from the pending transactions lists.
 */
async function clearConfirmedTXs() {
  // We can't simply call filter because ethnet.isTxConfirmed is async, so we
  // store that data along the hash, and then filter synchronously.
  await Promise.all(app.craftables.map(async (craftable) => {
    await Promise.all(craftable.ui.pendingTxs.map(async tx => {
      tx.confirmed = await ethnet.isTxConfirmed(tx.hash);

      if (tx.confirmed) {
        // Confirmed transactions may have failed (asserts, etc.)
        const successful = await ethnet.isTxSuccessful(tx.hash);
        if (successful) {
          view.toastSuccessfulTx(tx.hash, ethnet.txUrl(tx.hash));
        } else {
          view.toastErrorTx();
        }
      }
    }));
  }));

  app.craftables.forEach(craftable => {
    craftable.ui.pendingTxs = craftable.ui.pendingTxs.filter(tx => !tx.confirmed);
  });
}

/*
 * Calculates if a craftable can be crafted given the current balance in an
 * inventory.
 */
function isCraftable(craftable, inventory) {
  // Check all ingredients are present for the craftable
  return craftable.ingredients.every(ingredient =>
    inventory[ingredient.name].current >= ingredient.amount
  );
}
