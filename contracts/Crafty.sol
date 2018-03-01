pragma solidity ^0.4.17;

import './Item.sol';

contract Crafty {
  struct RecipeIngredient {
    Item ingredient;
    uint256 amountNeeded;
  }

  struct Craftable {
    Item item;
    RecipeIngredient[] recipe;
  }

  enum ItemId {
    Wood,
    Stone,
    Bronze,
    Iron,
    StoneSword,
    BronzeSword,
    IronSword,
    TriSword
  }

  mapping (bytes32 => Craftable) private craftables;

  function Crafty() public {
    // Basic items - empty recipes

    createItem(ItemId.Wood);
    createItem(ItemId.Stone);
    createItem(ItemId.Bronze);
    createItem(ItemId.Iron);

    // Advanced items

    createItem(ItemId.StoneSword);
    addIngredient(ItemId.StoneSword, ItemId.Wood, 1);
    addIngredient(ItemId.StoneSword, ItemId.Stone, 3);

    createItem(ItemId.BronzeSword);
    addIngredient(ItemId.BronzeSword, ItemId.Wood, 1);
    addIngredient(ItemId.BronzeSword, ItemId.Bronze, 3);

    createItem(ItemId.IronSword);
    addIngredient(ItemId.IronSword, ItemId.Wood, 1);
    addIngredient(ItemId.IronSword, ItemId.Iron, 3);

    createItem(ItemId.TriSword);
    addIngredient(ItemId.TriSword, ItemId.StoneSword, 1);
    addIngredient(ItemId.TriSword, ItemId.BronzeSword, 1);
    addIngredient(ItemId.TriSword, ItemId.IronSword, 1);
  }

  function createItem(ItemId id) private {
    craftables[keccak256(id)].item = new Item();
  }

  function getItem(ItemId id) private view returns (Item) {
    return craftables[keccak256(id)].item;
  }

  function addIngredient(ItemId result, ItemId ingredientId, uint256 amount) private {
    craftables[keccak256(result)].recipe.push(RecipeIngredient({
      ingredient: getItem(ingredientId),
      amountNeeded: amount
    }));
  }

  // Item acquisition

  function acquireWood() public {
    acquireItem(ItemId.Wood);
  }

  function acquireStone() public {
    acquireItem(ItemId.Stone);
  }

  function acquireBronze() public {
    acquireItem(ItemId.Bronze);
  }

  function acquireIron() public {
    acquireItem(ItemId.Iron);
  }

  function acquireItem(ItemId id) public {
    address player = msg.sender;
    RecipeIngredient[] memory ingredients = craftables[keccak256(id)].recipe;

    uint i;
    // Make sure the player has enough items to acquire the target item
    for (i = 0; i < ingredients.length; ++i) {
      require(ingredients[i].ingredient.amount(player) >= ingredients[i].amountNeeded);
    }

    // Substract the materials
    for (i = 0; i < ingredients.length; ++i) {
      ingredients[i].ingredient.subtract(player, ingredients[i].amountNeeded);
    }

    getItem(id).add(player, 1);
  }

  function acquireStoneSword() public {
    acquireItem(ItemId.StoneSword);
  }

  function acquireBronzeSword() public {
    acquireItem(ItemId.BronzeSword);
  }

  function acquireIronSword() public {
    acquireItem(ItemId.IronSword);
  }

  function acquireTriSword() public {
    acquireItem(ItemId.TriSword);
  }

  // Item amount query

  function amountWood() public view returns (uint256) {
    return getItem(ItemId.Wood).amount(msg.sender);
  }

  function amountStone() public view returns (uint256) {
    return getItem(ItemId.Stone).amount(msg.sender);
  }

  function amountBronze() public view returns (uint256) {
    return getItem(ItemId.Bronze).amount(msg.sender);
  }

  function amountIron() public view returns (uint256) {
    return getItem(ItemId.Iron).amount(msg.sender);
  }

  function amountStoneSword() public view returns (uint256) {
    return getItem(ItemId.StoneSword).amount(msg.sender);
  }

  function amountBronzeSword() public view returns (uint256) {
    return getItem(ItemId.BronzeSword).amount(msg.sender);
  }

  function amountIronSword() public view returns (uint256) {
    return getItem(ItemId.IronSword).amount(msg.sender);
  }

  function amountTriSword() public view returns (uint256) {
    return getItem(ItemId.TriSword).amount(msg.sender);
  }
}
