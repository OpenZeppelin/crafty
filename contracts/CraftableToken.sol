pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * @title Craftable Token
 * @dev Token that can be minted or burned by it's owner, who can also add
 * ingredients required for the minting of the token. Note that this contract
 * DOES NOT enforce the ingredients requirement: it merely provides storage
 * for them, and it is the owner's choice whether or not to comply.
 * Borrows from OpenZeppelin's Mintable (https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol)
 * and Burnable (https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/BurnableToken.sol) tokens.
 */
contract CraftableToken is StandardToken, Ownable {
  event Mint(address indexed player, uint256 amount);
  event Burn(address indexed player, uint256 amount);

  // Each step of the recipe is an CraftableToken that must be consumed
  // (burned), and the amount of tokens to burn.
  struct RecipeStep {
    CraftableToken ingredient;
    uint256 amountNeeded;
  }

  RecipeStep[] private recipe;

  // Public API

  /**
   * @dev Returns the number of steps in the CraftableToken's recipe.
   */
  function getTotalRecipeSteps() public view returns (uint256) {
    return recipe.length;
  }

  modifier validStep(uint256 step) {
    require(step < recipe.length);
    _;
  }

  /**
   * @dev Returns the CraftableToken that must be burned to comply with a
   * recipe step.
   * @param recipeStep The queried recipe step.
   */
  function getIngredient(uint256 recipeStep) public view validStep(recipeStep) returns (CraftableToken) {
    return recipe[recipeStep].ingredient;
  }

  /**
   * @dev Returns the amount of CraftableTokens that must be burned to comply
   * with a recipe step.
   * @param recipeStep The queried recipe step.
   */
  function getAmountNeeded(uint256 recipeStep) public view validStep(recipeStep) returns (uint256) {
    return recipe[recipeStep].amountNeeded;
  }

  // Owner API

  /**
   * @dev Permanently adds a new recipe step to the CraftableToken.
   * @param ingredient The CraftableToken to burn as part of the new recipe
   * step.
   * @param amountNeeded The amount of ingredient tokens to burn as part of
   * the new recipe step.
   */
  function addRecipeStep(CraftableToken ingredient, uint256 amountNeeded) public onlyOwner {
    require(ingredient != address(0));
    require(amountNeeded > 0);

    recipe.push(RecipeStep({
      ingredient: ingredient,
      amountNeeded: amountNeeded
    }));
  }

  /**
   * @dev Mints (creates) new tokens and adds it to a player's supply.
   * @param player The player that will receive the minted tokens.
   * @param amount The amount of tokens to mint.
   */
  function mint(address player, uint256 amount) public onlyOwner {
    totalSupply_ = totalSupply_.add(amount);
    balances[player] = balances[player].add(amount);

    Mint(player, amount);
    Transfer(address(0), player, amount);
  }

  /**
   * @dev Burns (destroys) tokens from a player's supply.
   * @param player The player whose tokens will be burned.
   * @param amount The amount of tokens to burn.
   */
  function burn(address player, uint256 amount) public onlyOwner {
    require(amount <= balances[player]);
    // No need to require amount <= totalSupply, since that would imply the
    // player's balance is greater than the totalSupply, which *should* be an
    // assertion failure

    totalSupply_ = totalSupply_.sub(amount);
    balances[player] = balances[player].sub(amount);

    Burn(player, amount);
  }
}
