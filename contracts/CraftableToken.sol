pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';


/**
 * @title Craftable Token
 * @dev Token with a recipe containing the required ingredients to craft it. Crafting
 * is simply a way of issuing tokens: the token creator holds a large (virtually
 * infinite) initial supply, and transfers from said supply to crafters.
 * Note that this contract DOES NOT enforce the ingredients requirement: it merely
 * provides storage for them, and it is the creator's choice whether or not to comply.
 */
contract CraftableToken is StandardToken {
  // Each step of the recipe has an ERC20 ingredient, of which a certain amount
  // are required to craft the recipe.
  struct RecipeStep {
    ERC20 ingredient;
    uint256 amountNeeded;
  }

  RecipeStep[] private recipe;
  uint256 public id;

  uint256 constant MAX_UINT_256 = 2**256 - 1;

  /**
   * @dev Constructor. The recipe is created here, and cannot be modified afterwards.
   * @param _id The id of the newly created token.
   * @param _ingredients An array with the ERC20s required to craft this token.
   * @param _ingredient_amounts The amount of tokens required for crafting, for each ERC20.
   */
  function CraftableToken(uint256 _id, ERC20[] _ingredients, uint256[] _ingredient_amounts) public {
    require(_ingredients.length == _ingredient_amounts.length);

    // The token creator (who is in charge of enforcing the crafting rules) holds all of the
    // initial supply, which is issued to players as they craft tokens (and taken back when
    // they are consumed for crafting purposes).
    totalSupply_ = MAX_UINT_256;
    balances[msg.sender] = totalSupply_;

    id = _id;

    for (uint i = 0; i < _ingredients.length; ++i) {
      require(_ingredient_amounts[i] > 0);

      recipe.push(RecipeStep({
        ingredient: _ingredients[i],
        amountNeeded: _ingredient_amounts[i]
      }));
    }
  }

  // Public API

  /**
   * @dev Returns the number of steps in the CraftableToken's recipe.
   */
  function getTotalRecipeSteps() public view returns (uint256) {
    return recipe.length;
  }

  modifier validStep(uint256 _step) {
    require(_step < recipe.length);
    _;
  }

  /**
   * @dev Returns the ERC20 required to comply with a recipe step, along with the amount of tokens needed.
   * @return A tuple containing the token and the amount.
   */
  function getRecipeStep(uint256 _recipeStep) public view validStep(_recipeStep) returns (ERC20, uint256) {
    return (recipe[_recipeStep].ingredient, recipe[_recipeStep].amountNeeded);
  }
}
