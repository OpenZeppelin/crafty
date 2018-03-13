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
      amountSpan.fadeOut(300, () =>amountSpan.fadeIn(300));
    };
    li.append(amountSpan);

    list.append(li);
  });
  parent.append(list);
};

/*
 * Creates a set of buttons.
 * @param items An array of the craftables to be crafted with each button.
 * @param onclick A callback function to call with a craftable when its button
 * is clicked.
 * @param parent The HTML object the list of buttons is going to be appended to.
 * An enableCraft function is added to the UI property of each craftable, which
 * receives a boolean value indicating if it can be crafted or not, and updates
 * the DOM.
 * @returns An object mapping item names to a function that enables or disables
 * the associated button.
 */
exports.addCraftButtons = (craftables, onclick, parent) => {
  const listGroup = $('<div>').addClass('list-group align-items-center');
  craftables.forEach(craftable => {
    // The title of the button will reflect if transactions are pending
    const button = $(`<button type="button">Get ${craftable.name}</button>`);
    button.addClass('list-group-item').addClass('list-group-item-action d-flex justify-content-between align-items-center');

    craftable.ui.enableCraft = enabled => {
      button.prop('disabled', !enabled);
    };

    button.click(() => {
      button.blur(); // To prevent the button from remaining 'active'
      onclick(craftable);
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
    toastr['warning']('Failed to copy token');
  }
}

/*
 * Generates a successful transaction toast.
 * @param tx The transaction hash.
 * @param url (optional) A link to where more information about the transaction
 * can be found.
 */
exports.toastSuccessfulTx = (tx, url) => {
  toastr['success'](tx, 'Successful transaction!', {onclick: () => {
    if (url) {
      window.open(url, '_blank');
    }
  }});
};

/*
 * Generates a failed to send transaction toast.
 */
exports.toastFailedToSendTx = () => {
  toastr['warning']('Failed to send a transaction');
};

/*
 * Generates a failed transaction toast.
 */
exports.toastErrorTx = () => {
  toastr['error']('Transaction failed');
};

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
