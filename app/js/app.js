App = {
  init: function() {
    web3js.version.getNetwork((err, netId) => {
      const netnames = {
        "1": "mainnet",
        "2": "Morden (testnet - deprecated)",
        "3": "Ropsten (testnet)",
        "4": "Rinkeby (testnet)",
        "42": "Kovan (testnet)"
      }

      const netname = netnames[netId] || "unknown";
      $("#network").text(netname)
    });

    $.getJSON("contracts/Crafty.json").then(crafty_artifact => {
      const contract = TruffleContract(crafty_artifact);
      contract.setProvider(web3js.currentProvider);

      this.crafty = contract.at("0x604420d0b12d07fc64e43774bf051354e6217207");
    });

    $.getJSON("rules.json").then(data => {
      this.rules = data;
    }).then(() => {
      layoutInventory();
    });

    this.user_account = undefined;
    setInterval(() => {
      if (typeof(this.user_account) === "undefined" || this.user_account !== web3js.eth.accounts[0]) {
        this.user_account = web3js.eth.accounts[0];
        $("#user-account").text(this.user_account);
        updateInventory();
      }
    }, 100);
  }
}

function layoutInventory() {
  let list = $("<ul></ul>");
  App.rules.resources.forEach(res_name => {
    let li = $(`<li>${res_name}: </li>`).addClass("first-letter").append($("<span></span>").attr("id", `res-${res_name}-amount`));
    list.append(li);
  });
  list.appendTo("#inventory");
}

async function updateInventory() {
  let inventory = await Promise.all(App.rules.resources.map(
    res_name => App.crafty.resourcesOf(App.user_account, res_name).then(amount => {
      return {name: res_name, amount: amount};
    })
  ));

  inventory.forEach(res => {
    $(`#res-${res.name}-amount`).text(res.amount);
  });
}

window.addEventListener('load', () => {
  if (typeof web3 !== "undefined") {
    web3js = new Web3(web3.currentProvider);
    App.init();
  } else {
    $("#no-eth-browser").modal("show");
  }
})