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
    // Trigger a UI update to reflect the new pending transaction
    updateUI();

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
  // Retrieve the new balances and store them in a temporary inventory
  const newInventory = {};
  await Promise.all(app.craftables.map(craftable => {
    return app.crafty.getAmount(craftable.name).then(amount => {
      newInventory[craftable.name] = Number(amount);
    });
  }));

  await clearConfirmedTXs();

  // Only update the real inventory once all balances were retrieved and
  // confirmed transactions removed, to prevent access during the update
  app.inventory = newInventory;

  // Update the UI using the updated data
  updateUI();
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
 * Updates the UI from the current inventory, without updating it.
 */
function updateUI() {
  // Optimistically update the amounts (assuming the pending transactions will
  // succeed). We work on temporary inventories, to prevent modifying the real
  // one (which is only updated by reading from the blockchain).

  const pendingInventory = {}; // Used to track pending craftables
  const uiInventory = JSON.parse(JSON.stringify(app.inventory)); // Deep copy

  // We need to calculate the whole optimistic inventory before the UI can be
  // updated
  app.craftables.forEach(craftable => {
    const pendingAmount = craftable.ui.pendingTxs.length;

    // Pending craftables are not added to the UI inventory to prevent not-yet
    // crafted craftables from being used as ingredients (which will likely
    // fail)
    pendingInventory[craftable.name] = pendingAmount;

    // Ingredients of pending transactions, however, are subtracted from the
    // current amount, to prevent them from being used again (this will roll
    // back if the transaction fails)
    craftable.ingredients.forEach(ingredient => {
      uiInventory[ingredient.name] -= pendingAmount * ingredient.amount;
    });
  });

  app.craftables.forEach(craftable => {
    // Then, update the displayed amount, and the craftability
    craftable.ui.updateAmount(uiInventory[craftable.name], pendingInventory[craftable.name]);
    craftable.ui.enableCraft(isCraftable(craftable, uiInventory));
  });
}

/*
 * Calculates if a craftable can be crafted given the current balance in an
 * inventory.
 */
function isCraftable(craftable, inventory) {
  // Check all ingredients are present for the craftable
  return craftable.ingredients.every(ingredient =>
    inventory[ingredient.name] >= ingredient.amount
  );
}
