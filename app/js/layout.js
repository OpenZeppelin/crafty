const layout = {
  // Creates an HTML list of items (name and value) and adds it to
  // a parent element. Returns an object mapping item names to a
  // function that receives a new item value and updates the DOM.
  addItemList: (items, parent) => {
    const itemAmountUpdaters = {};

    const list = $('<ul></ul>');
    items.forEach(item => {
      const li = $(`<li>${item}: </li>`).addClass('first-letter').append();
      const span = $('<span></span>');

      li.append(span);
      list.append(li);

      itemAmountUpdaters[item] = newVal => {
        span.text(newVal);
      };
    });
    parent.append(list);

    return itemAmountUpdaters;
  },

  addPendableTxButtons: (items, parametrizeAction, urlFromTx, parent) => {
    const listGroup = $('<div class="list-group align-items-center" ></div>');
    items.forEach(item => {
      // The title of the button will reflect if transactions are pending
      const button = $(`<button type="button" title="">Get ${item}</button>`);
      button.addClass('list-group-item').addClass('list-group-item-action d-flex justify-content-between align-items-center');

      // A badge will track the number of pending transactions
      const badge = $(`<span class="badge badge-secondary badge-pill"></span>`);
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
  },

  showNoEthBrowserError: () => {
    layout.showError(`
      <p>An Ethereum browser (such as <a href="https://metamask.io/">MetaMask</a> or <a href="https://github.com/ethereum/mist">Mist</a>) is required to use this dApp.</p>
      <div style="display: flex; justify-content: center;">
        <a href="https://metamask.io/" style="text-align: center">
          <img src="assets/download-metamask-dark.png" style="max-width: 70%">
        </a>
      </div>`);
  },

  showNoDeployedCraftyError: () => {
    layout.showError('<p>Could not find an up-to-date Crafty smart contract in this network. Deploy one before continuing.</p>');
  },

  showNoEthAccountError: () => {
    layout.showError('<p>An Ethereum account needs to be selected in the Ethereum browser extension in order to use this dApp.</p>');
  },

  showError: (content) => {
    $('#modal-body').append($(content));
    $('#modal-dialog').modal('show');
  },

  hideErrors: () => {
    $('#modal-body').empty();
    $('#modal-dialog').modal('hide');
  }
};

function toastSuccessfulTx(tx, url) {
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
