const toClipboard = require('copy-to-clipboard');

// Module storage
const view = {};

/*
 * Initializes the view.
 */
exports.init = () => {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  });
};

/*
 * Creates an HTML list of craftables, displaying name and value.
 * @param craftables An array of craftables.
 * @param parent The HTML object the list is going to be appended to.
 * An updateAmount function is added to the UI property of each craftable,
 * which receives a new craftable amount and updates the DOM.
 */
exports.addItemList = (craftables, parent) => {
  const list = $('<ul>').addClass('list-group').css({'background-color': 'transparent'});
  craftables.forEach(craftable => {
    const li = $('<li>').addClass('list-group-item').css({'background-color': 'transparent'}).addClass('border-0');

    const addressButton = $('<button>').addClass('btn btn-secondary btn-sm btn-mini').text('ERC20').css({'outline': 'none'});
    addressButton.click(() => {
      const copied = toClipboard(craftable.address);
      toastTokenAddressCopied(copied);
    });
    li.append(addressButton);

    const labelSpan = $('<span>');
    labelSpan.text(` ${craftable.name}: `).addClass('first-letter');
    li.append(labelSpan);

    const amountSpan = $('<span>');
    craftable.ui.updateAmount = newVal => {
      amountSpan.text(newVal);
      amountSpan.fadeOut(500, () =>amountSpan.fadeIn(500));
    };
    li.append(amountSpan);

    list.append(li);
  });
  parent.append(list);
};

/*
 * Creates a set of buttons that trigger pendable transactions.
 * @param items An array of the craftables to be obtained in each transaction.
 * @param parametrizeAction The action to execute when a button is clicked,
 * parametrized with the item corresponding to said button.
 * @param urlFromTX a function that returns a transaction URL when called
 * with a transaction hash.
 * @param parent The HTML object the list of buttons is going to be appended to.
 * An enableCraft function is added to the UI property of each craftable, which
 * receives a boolean value indicating if it can be crafted or not, and updates
 * the DOM.
 * @returns An object mapping item names to a function that enables or disables
 * the associated button.
 */
exports.addPendableTxButtons = (craftables, parametrizeAction, urlFromTx, parent) => {
  const listGroup = $('<div>').addClass('list-group align-items-center');
  craftables.forEach(craftable => {
    // The title of the button will reflect if transactions are pending
    const button = $(`<button type="button" title="">Get ${craftable.name}</button>`);
    button.addClass('list-group-item').addClass('list-group-item-action d-flex justify-content-between align-items-center');

    craftable.ui.enableCraft = enabled => {
      button.prop('disabled', !enabled);
    };

    // A badge will track the number of pending transactions
    const badge = $('<span>').addClass('badge badge-secondary badge-pill');
    button.append(badge);

    let pendingTxs = 0;
    button.click(async () => {
      button.blur(); // To prevent the button from remaining 'active'

      pendingTxs += 1;
      badge.text(pendingTxs);
      button.attr('title', 'Pending TXs');

      try {
        // The action to execute is the result of parametrizing it with the craftable name
        const result = await parametrizeAction(craftable.name);
        toastSuccessfulTx(result.tx, urlFromTx(result.tx));

      } catch (e) {
        toastErrorTx();

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

  parent.append(listGroup);
};

/*
 * Creates an HTML list showing recipe results and their ingredients.
 * @param recipes An array of recipes, consisting of results, ingredients, and
 * amounts.
 * @parent The HTML object the list of recipes is going to be appended to.
 */
exports.addIngredientsList = (recipes, parent) => {
  recipes.forEach(recipe => {
    const title = $(`<h6>${recipe.name}</h6>`).addClass('first-letter');
    const list = $('<ul class="list-group list-group-flush float-right" style="margin-bottom: 1rem"></ul>');
    recipe.ingredients.forEach(ingredient => {
      const li = $(`<li class="list-group-item list-group-item-secondary" style="width: 170px;">${ingredient.amount}x ${ingredient.name}</li>`);
      li.addClass('first-letter');
      list.append(li);
    });

    const col = $('<div>').addClass('col');
    col.append(title);
    col.append(list);

    const row = $('<div>').addClass('row');
    row.append(col);

    parent.append(row);
  });
};

/*
 * Sets the current Ethereum account number.
 */
exports.setAccount = (account) => {
  $('#user-account').text(account);
};

/*
 * Sets the current block. This function should be called every time a new
 * block is mined.
 */
exports.setBlock = (block) => {
  // On the first call, view.block has not been set yet
  if (typeof view.block === 'undefined') {
    // Periodically update the last block text (even if the block doesn't
    // change, the time since mining needs to be updated)
    setInterval(() => {
      $('#last-block').text(`#${view.block.number} (mined ${moment.unix(view.block.timestamp).fromNow()})`);
    }, 100);
  }

  view.block = block;
  $('#last-block').fadeOut(500, () => $('#last-block').fadeIn(500));
};

/*
 * Shows a MetaMask badge.
 */
exports.showMetaMaskBadge = () => {
  $('#using-metamask').css('display', 'inline');
};

/*
 * Sets the name of the current Ethereum network.
 */
exports.setEthnetName = (netName) => {
  $('#network').text(netName);
};

/*
 * Shows an unclosable modal dialog, used to display error messages.
 */
exports.showModalError = (content) => {
  $('#modal-body').empty();
  $('#modal-body').append($(content));
  $('#modal-dialog').modal('show');
};

/*
 * Hides the unclosable error modal dialog.
 */
exports.hideModalError = () => {
  $('#modal-dialog').modal('hide');
};

/*
 * Generates an address copied to clipboard toast.
 * @param copied The boolean result of the copy action.
 */
function toastTokenAddressCopied(copied) {
  if (copied) {
    toastr['info']('Token copied to clipboard');
  } else {
    toastr['warn']('Failed to copy token');
  }
}

/*
 * Generates a successful transaction toast.
 * @param tx The transaction hash.
 * @param url (optional) A link to where more information about the transaction
 * can be found.
 */
function toastSuccessfulTx(tx, url) {
  toastr['success'](tx, 'Broadcasted TX!', {onclick: () => {
    if (url) {
      window.open(url, '_blank');
    }
  }});
}

/*
 * Generates a failed transaction toast.
 */
function toastErrorTx() {
  toastr['error']('Failed to broadcast TX');
}

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

// This causes moment to only show 'a few seconds ago' for the first
// 5 seconds after a timestamp.
moment.relativeTimeThreshold('ss', 5);
