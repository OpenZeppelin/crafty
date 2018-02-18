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

      const crafty_address = "0xe6e0450c64eedcc11d6b815caf3c453d44f2d06b";
      this.crafty = contract.at(crafty_address);
      web3js.eth.getCode(crafty_address, (err, code) => {
        if (code !== crafty_artifact.deployedBytecode) {
          $("#no-crafty-deployed").modal("show");
        }
      });
    });

    $.getJSON("rules.json").then(data => {
      this.rules = data;
    }).then(() => {
      layoutInventory();
    });

    setInterval(updateAccount, 100);
  }
}

function updateAccount() {
  if (web3js.eth.accounts.length > 0) {
    $("#no-eth-account").modal("hide");

    const selected_acc = web3js.eth.accounts[0];
    if ((typeof(App.user_account) === "undefined") || (App.user_account !== selected_acc)) {
      App.user_account = selected_acc;
      $("#user-account").text(App.user_account);
      updateInventory();
    }
  } else {
    $("#no-eth-account").modal("show");
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
    const provider = web3js.currentProvider;
    if (provider.isMetaMask) {
      $("#using-metamask").css("display", "inline")
    }

    App.init();
  } else {
    $("#no-eth-browser").modal("show");
  }
})