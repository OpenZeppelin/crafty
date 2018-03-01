pragma solidity ^0.4.17;

import './Item.sol';

contract Crafty {
  // The different craftable items in the game.
  enum CraftId {
    Wood,
    Stone,
    Bronze,
    Iron,
    StoneSword,
    BronzeSword,
    IronSword,
    TriSword
  }

  // Storage for each item. Solidity doesn't yet support having enums as a
  // mapping key, so we use uint256 and cast to it (which always works).
  mapping (uint256 => Craftable) private craftables;

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

  function Crafty() public {
    // Basic items - empty recipes

    createItem(CraftId.Wood);
    createItem(CraftId.Stone);
    createItem(CraftId.Bronze);
    createItem(CraftId.Iron);

    // Advanced items

    createItem(CraftId.StoneSword);
    addIngredient(CraftId.StoneSword, CraftId.Wood, 1);
    addIngredient(CraftId.StoneSword, CraftId.Stone, 3);

    createItem(CraftId.BronzeSword);
    addIngredient(CraftId.BronzeSword, CraftId.Wood, 1);
    addIngredient(CraftId.BronzeSword, CraftId.Bronze, 3);

    createItem(CraftId.IronSword);
    addIngredient(CraftId.IronSword, CraftId.Wood, 1);
    addIngredient(CraftId.IronSword, CraftId.Iron, 3);

    createItem(CraftId.TriSword);
    addIngredient(CraftId.TriSword, CraftId.StoneSword, 1);
    addIngredient(CraftId.TriSword, CraftId.BronzeSword, 1);
    addIngredient(CraftId.TriSword, CraftId.IronSword, 1);
  }

  // Creates a new item by deploying a new contract. This function should
  // never be called twice with the same id.
  function createItem(CraftId id) private {
    craftables[uint256(id)].item = new Item();
  }

  // Retrieves the deployed item contract associated with an id.
  function getItem(CraftId id) private view returns (Item) {
    return craftables[uint256(id)].item;
  }

  // Adds an ingredient to an item's recipe.
  function addIngredient(CraftId result, CraftId ingredientId, uint256 amount) private {
    craftables[uint256(result)].recipe.push(RecipeIngredient({
      ingredient: getItem(ingredientId),
      amountNeeded: amount
    }));
  }

  // Attempts to craft an item. For items with recipes, the player must have
  // the required ingredients, which will be subtracted from his inventory.
  function craftItem(CraftId id) public {
    address player = msg.sender;

    // Some items have no ingredients, and can be crafted immediately.
    RecipeIngredient[] memory ingredients = craftables[uint256(id)].recipe;

    uint i;
    // Check all required items are present in the player's inventory.
    for (i = 0; i < ingredients.length; ++i) {
      require(ingredients[i].ingredient.amount(player) >= ingredients[i].amountNeeded);
    }

    // If the check passed, subtract those items. We loop twice to prevent
    // subtracting item until we know the subtract call won't fail (and cause
    // items to be permanently lost).
    for (i = 0; i < ingredients.length; ++i) {
      ingredients[i].ingredient.subtract(player, ingredients[i].amountNeeded);
    }

    // Add the resulting item
    getItem(id).add(player, 1);
  }

  // Returns the current amount of items in the player's inventory for a given item type.
  function getItemAmount(CraftId id) public view returns (uint256) {
    return getItem(id).amount(msg.sender);
  }

  // Item acquisition

  function acquireWood() public {
    craftItem(CraftId.Wood);
  }

  function acquireStone() public {
    craftItem(CraftId.Stone);
  }

  function acquireBronze() public {
    craftItem(CraftId.Bronze);
  }

  function acquireIron() public {
    craftItem(CraftId.Iron);
  }

  function acquireStoneSword() public {
    craftItem(CraftId.StoneSword);
  }

  function acquireBronzeSword() public {
    craftItem(CraftId.BronzeSword);
  }

  function acquireIronSword() public {
    craftItem(CraftId.IronSword);
  }

  function acquireTriSword() public {
    craftItem(CraftId.TriSword);
  }

  // Item amount query

  function amountWood() public view returns (uint256) {
    return getItem(CraftId.Wood).amount(msg.sender);
  }

  function amountStone() public view returns (uint256) {
    return getItem(CraftId.Stone).amount(msg.sender);
  }

  function amountBronze() public view returns (uint256) {
    return getItem(CraftId.Bronze).amount(msg.sender);
  }

  function amountIron() public view returns (uint256) {
    return getItem(CraftId.Iron).amount(msg.sender);
  }

  function amountStoneSword() public view returns (uint256) {
    return getItem(CraftId.StoneSword).amount(msg.sender);
  }

  function amountBronzeSword() public view returns (uint256) {
    return getItem(CraftId.BronzeSword).amount(msg.sender);
  }

  function amountIronSword() public view returns (uint256) {
    return getItem(CraftId.IronSword).amount(msg.sender);
  }

  function amountTriSword() public view returns (uint256) {
    return getItem(CraftId.TriSword).amount(msg.sender);
  }
}
