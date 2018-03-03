pragma solidity ^0.4.17;

import './Item.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract Crafty is Ownable {
  // Storage for each item. Each item is referenced using a unique string.
  // An enum could be used for this, but Solidity doesn't yet support having
  // mappings with enum keys, and enums are not exposed to JS, so strings are
  // far easier to work with.
  mapping (string => Craftable) private craftables;

  // A craftable item is simply an item, plus an optional recipe. which
  // specifies how it's crafted.
  struct Craftable {
    Item item;
    RecipeIngredient[] recipe;
  }

  // Each recipe ingredient is an item contract, and the amount of units
  // of that item needed to craft the recipe.
  struct RecipeIngredient {
    Item ingredient;
    uint256 amountNeeded;
  }

  // Creates a new item by deploying a new contract. This function should
  // never be called twice with the same id.
  function createItem(string id) onlyOwner public {
    craftables[id].item = new Item();
  }

  // Retrieves the deployed item contract associated with an id.
  function getItem(string id) private view returns (Item) {
    return craftables[id].item;
  }

  // Adds an ingredient to an item's recipe.
  function addIngredient(string result, string ingredient, uint256 amountNeeded) onlyOwner public {
    craftables[result].recipe.push(RecipeIngredient({
      ingredient: getItem(ingredient),
      amountNeeded: amountNeeded
    }));
  }

  // Attempts to craft an item. For items with recipes, the player must have
  // the required ingredients, which will be subtracted from his inventory.
  function craftItem(string id) public {
    address player = msg.sender;

    // Some items have no ingredients, and can be crafted immediately.
    RecipeIngredient[] memory ingredients = craftables[id].recipe;

    uint i;
    // Check all required items are present in the player's inventory.
    for (i = 0; i < ingredients.length; ++i) {
      require(ingredients[i].ingredient.balanceOf(player) >= ingredients[i].amountNeeded);
    }

    // If the check passed, subtract those items. We loop twice to prevent
    // subtracting item until we know the subtract call won't fail (and cause
    // items to be permanently lost).
    for (i = 0; i < ingredients.length; ++i) {
      ingredients[i].ingredient.burn(player, ingredients[i].amountNeeded);
    }

    // Add the resulting item
    getItem(id).mint(player, 1);
  }

  // Returns the current amount of items in the player's inventory for a given item type.
  function getItemAmount(string id) public view returns (uint256) {
    return getItem(id).balanceOf(msg.sender);
  }
}
