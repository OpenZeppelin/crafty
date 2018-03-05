pragma solidity ^0.4.17;

import './CraftableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * @title Crafting token game
 * @dev The game holds multiple CraftableTokens (craftables), which can be
 * crafted by players. Crafting advanced tokens (with ingredients) requires
 * the player to hold the required amount of said ingredient, which will be
 * used up in the crafting process. New craftables and ingredients can be
 * added by the game owner at any point in time.
 */
contract Crafty is Ownable {
  // Craftable storage. Each craftable is referenced using a unique string.
  // An enum could be used for this, but Solidity doesn't yet support having
  // mappings with enum keys, and enums are not exposed to JS, so strings are
  // far easier to work with.
  mapping (string => CraftableToken) private craftables;

  // Player API

  /**
   * @dev Returns one of the game's craftables.
   * @param name The craftable's name.
   */
  function getCraftable(string name) public view returns (CraftableToken) {
    require(craftables[name] != address(0));

    return craftables[name];
  }

  /**
   * @dev Crafts a craftable. All of the craftable's ingredients must be
   * present in the player's inventory in the required amounts, and they
   * will be consumed (destroyed) by the crafting process.
   * @param name The name of the craftable to craft.
   */
  function craft(string name) public {
    CraftableToken result = getCraftable(name);
    address player = msg.sender;

    // Check the required craftables are present in the player's inventory,
    // and then consume those items. All burn calls will be reverted if the
    // player is missing any ingredient.
    uint256 totalSteps = result.getTotalRecipeSteps();
    for (uint i = 0; i < totalSteps; ++i) {
      CraftableToken ingredient;
      uint256 amountNeeded;
      (ingredient, amountNeeded) = result.getRecipeStep(i);

      require(ingredient.balanceOf(player) >= amountNeeded);
      ingredient.burn(player, amountNeeded);
    }

    // Add the resulting item
    result.mint(player, 1);
  }

  /**
   * @dev Returns the amount of craftables or a certain type owned by the
   * player.
   * @param name The name of the craftable to query.
   */
  function getAmount(string name) public view returns (uint256) {
    return getCraftable(name).balanceOf(msg.sender);
  }

  // Owner API

  /**
   * @dev Adds a new craftable to the game by deploying a new CraftableToken.
   * @param name The name of the new craftable, which will be later used to
   * interact with it. Once a name has been taken, it cannot be reused.
   */
  function addCraftable(string name) public onlyOwner {
    require(craftables[name] == address(0));

    craftables[name] = new CraftableToken();
  }

  /**
   * @dev Adds an ingredient requirement to a craftable. After calling this
   * function, crafting the craftable will require consuming (destroying) the
   * new ingredient.
   * @param resultName The name of the craftable to add the ingredient to.
   * @param ingredientName The name of the ingredient craftable.
   * @param amountNeeded The number of ingredient craftables to consume during
   * the result's craftable crafting.
   */
  function addIngredient(string resultName, string ingredientName, uint256 amountNeeded) public onlyOwner {
    require(keccak256(resultName) != keccak256(ingredientName));

    CraftableToken result = getCraftable(resultName);
    CraftableToken ingredient = getCraftable(ingredientName);

    result.addRecipeStep(ingredient, amountNeeded);
  }
}
