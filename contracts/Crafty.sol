pragma solidity ^0.4.17;

import './CraftableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract Crafty is Ownable {
  // Storage for each item. Each item is referenced using a unique string.
  // An enum could be used for this, but Solidity doesn't yet support having
  // mappings with enum keys, and enums are not exposed to JS, so strings are
  // far easier to work with.
  mapping (string => CraftableToken) private craftables;

  // Adds a new item by deploying a new contract. This function should
  // never be called twice with the same item name.
  function addItem(string itemName) onlyOwner public {
    require(craftables[itemName] == address(0));

    craftables[itemName] = new CraftableToken();
  }

  // Retrieves the deployed item contract associated with a name.
  function getItem(string itemName) public view returns (CraftableToken) {
    require(craftables[itemName] != address(0));

    return craftables[itemName];
  }

  // Adds an ingredient to an item's recipe.
  function addIngredient(string resultName, string ingredientName, uint256 amountNeeded) onlyOwner public {
    require(keccak256(resultName) != keccak256(ingredientName));

    CraftableToken result = getItem(resultName);
    CraftableToken ingredient = getItem(ingredientName);

    result.addRecipeStep(ingredient, amountNeeded);
  }

  // Attempts to craft an item. For items with recipes, the player must have
  // the required ingredients, which will be subtracted from his inventory.
  function craftItem(string id) public {
    CraftableToken result = getItem(id);
    address player = msg.sender;

    uint i;
    uint256 totalSteps = result.getTotalRecipeSteps();

    // Check all required items are present in the player's inventory.
    for (i = 0; i < totalSteps; ++i) {
      require(result.getIngredient(i).balanceOf(player) >= result.getAmountNeeded(i));
    }

    // After the check passed, subtract those items. We loop twice to prevent
    // subtracting item until we know the subtract call won't fail (and cause
    // items to be permanently lost).
    for (i = 0; i < totalSteps; ++i) {
      result.getIngredient(i).burn(player, result.getAmountNeeded(i));
    }

    // Add the resulting item
    result.mint(player, 1);
  }

  // Returns the current amount of items in the player's inventory for a given item type.
  function getItemAmount(string id) public view returns (uint256) {
    return getItem(id).balanceOf(msg.sender);
  }
}
