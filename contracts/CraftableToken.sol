pragma solidity ^0.4.21;

import 'zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
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
contract CraftableToken is StandardToken, DetailedERC20 {
  // Each step of the recipe has an ERC20 ingredient, of which a certain amount
  // are required to craft the recipe.
  struct RecipeStep {
    ERC20 ingredient;
    uint256 amountNeeded;
  }

  string public tokenURI;

  RecipeStep[] private recipe;

  uint256 constant MAX_UINT_256 = 2**256 - 1;

  /**
   * @dev Constructor. The recipe is created here, and cannot be modified afterwards.
   * @param _name The name of the token.
   * @param _symbol The symbol of the token.
   * @param _tokenURI A URI pointing to token metadata (i.e. a thumbnail).
   * @param _ingredients An array with the ERC20s required to craft this token.
   * @param _ingredientAmounts The amount of tokens required for crafting, for each ERC20.
   */
  function CraftableToken(string _name, string _symbol, string _tokenURI, ERC20[] _ingredients, uint256[] _ingredientAmounts) DetailedERC20(_name, _symbol, 0) public {
    require(_ingredients.length == _ingredientAmounts.length);

    tokenURI = _tokenURI;

    // The token creator (who is in charge of enforcing the crafting rules) holds all of the
    // initial supply, which is issued to players as they craft tokens (and taken back when
    // they are consumed for crafting purposes).
    totalSupply_ = MAX_UINT_256;
    balances[msg.sender] = totalSupply_;

    for (uint i = 0; i < _ingredients.length; ++i) {
      require(_ingredientAmounts[i] > 0);

      recipe.push(RecipeStep({
        ingredient: _ingredients[i],
        amountNeeded: _ingredientAmounts[i]
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

  /**
   * @dev Returns the ERC20 required to comply with a recipe step, along with the amount of tokens needed.
   * @return A tuple containing the token and the amount.
   */
  function getRecipeStep(uint256 _recipeStepNumber) public view returns (ERC20, uint256) {
    require(_recipeStepNumber < recipe.length);
    return (recipe[_recipeStepNumber].ingredient, recipe[_recipeStepNumber].amountNeeded);
  }
}
