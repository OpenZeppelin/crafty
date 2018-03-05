const error = { // eslint-disable-line no-unused-vars
  noEthBrowser: () => {
    layout.showModalError(`
      <p>An Ethereum browser (such as <a href="https://metamask.io/">MetaMask</a> or <a href="https://github.com/ethereum/mist">Mist</a>) is required to use this dApp.</p>
      <div style="display: flex; justify-content: center;">
        <a href="https://metamask.io/" style="text-align: center">
          <img src="images/download-metamask-dark.png" style="max-width: 70%">
        </a>
      </div>`);
  },

  noDeployedCrafty: () => {
    layout.showModalError('<p>Could not find an up-to-date Crafty smart contract in this network. Deploy one before continuing.</p>');
  },

  noEthAccount: () => {
    layout.setAccount('none');
    layout.showModalError('<p>An Ethereum account needs to be selected in the Ethereum browser extension in order to use this dApp.</p>');
  },

  clear: () => {
    layout.hideModalError();
  }
};
