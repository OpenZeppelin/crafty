$(document).ready(() => {
  if (typeof web3 !== "undefined") {
    console.log("Metamask detected");
  } else {
    console.log("No Metamask");
  }
});