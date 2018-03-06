const layout = {};

// Creates an HTML list of items (name and value) and adds it to
// a parent element. Returns an object mapping item names to a
// function that receives a new item value and updates the DOM.
exports.addItemList = (items, parent) => {
  const itemAmountUpdaters = {};

  const list = $('<ul>');
  items.forEach(item => {
    const li = $(`<li>${item}: </li>`).addClass('first-letter').append();
    const span = $('<span>');

    li.append(span);
    list.append(li);

    itemAmountUpdaters[item] = newVal => {
      span.text(newVal);
    };
  });
  parent.append(list);

  return itemAmountUpdaters;
};

exports.addPendableTxButtons = (items, parametrizeAction, urlFromTx, parent) => {
  const listGroup = $('<div>').addClass('list-group align-items-center');
  items.forEach(item => {
    // The title of the button will reflect if transactions are pending
    const button = $(`<button type="button" title="">Get ${item}</button>`);
    button.addClass('list-group-item').addClass('list-group-item-action d-flex justify-content-between align-items-center');

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
        // The action to execute is the result of parametrizing it with the item
        const result = await parametrizeAction(item)();
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

exports.addIngredientsList = (recipes, parent) => {
  recipes.forEach(recipe => {
    const title = $(`<h6>${recipe.result}</h6>`).addClass('first-letter');
    const list = $('<ul class="list-group list-group-flush float-right" style="margin-bottom: 1rem"></ul>');
    recipe.ingredients.forEach(ingredient => {
      const li = $(`<li class="list-group-item list-group-item-secondary">${ingredient.amount}x ${ingredient.name}</li>`);
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

exports.setAccount = (account) => {
  $('#user-account').text(account);
};

exports.setBlock = (block) => {
  // On the first call, layout.block has not been set yet
  if (typeof layout.block === 'undefined') {
    // Periodically update the last block text (even if the block doesn't
    // change, the time since mining needs to be updated)
    setInterval(() => {
      $('#last-block').text(`#${layout.block.number} (mined ${moment.unix(layout.block.timestamp).fromNow()})`);
    }, 100);
  }

  layout.block = block;
  $('#last-block').fadeOut(500, () => $('#last-block').fadeIn(500));
};

exports.showMetaMaskBadge = () => {
  $('#using-metamask').css('display', 'inline');
};

exports.setEthnetName = (netName) => {
  $('#network').text(netName);
};

exports.showModalError = (content) => {
  $('#modal-body').empty();
  $('#modal-body').append($(content));
  $('#modal-dialog').modal('show');
};

exports.hideModalError = () => {
  $('#modal-dialog').modal('hide');
};

function toastSuccessfulTx(tx, url) {
  console.log(url);
  toastr['success'](url ? `<a href=${url} target="_blank">${tx}</a>` : tx, 'Broadcasted TX!');
}

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

moment.relativeTimeThreshold('ss', 5);
