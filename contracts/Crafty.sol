pragma solidity ^0.4.21;

import './CraftableToken.sol';
import 'openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import 'zos-lib/contracts/migrations/Initializable.sol';

/**
 * @title Crafting token game
 * @dev The game holds multiple CraftableTokens (craftables), which can be
 * crafted by players. Crafting advanced tokens (those with ingredients)
 * requires the player to hold the required amount of said ingredient, which will be
 * consumed in the crafting process. New craftables (with their ingredients) can be
 * added by all players.
 */
contract Crafty is RBAC, Initializable {
  // Storage for craftables. Some of them may have been zeroed-out (by a deleteCraftable
  // call), so validation of each CraftableToken should be performed by readers.
  CraftableToken[] private craftables;

  event CraftableAdded(address addr);
  event CraftableDeleted(address addr);

  // Role Based Access Control (RBAC)
  string public constant ROLE_ADMIN = "admin";

  // Initializer for integration with ZeppelinOS
  function initialize(address _initialAdmin) isInitializer public {
    addRole(_initialAdmin, ROLE_ADMIN);
  }

  // Player API

  /**
   * @dev Returns the total number of craftables in the game.
   */
  function getTotalCraftables() public view returns (uint256) {
    return craftables.length;
  }

  /**
   * @dev Returns one of the game's craftables.
   * @param  _index The index of the requested craftable (from 0 to getTotalCraftables() - 1).
   */
  function getCraftable(uint256 _index) public view returns (CraftableToken) {
    require(_index < craftables.length);
    return craftables[_index];
  }

  /**
   * @dev Adds a new craftable to the game.
   * @param _name The name of the craftable.
   * @param _symbol The symbol of the craftable.
   * @param _tokenURI A URI ponting to craftable metadata (i.e. a thumbnail).
   * @param _ingredients A non-empty array with the different ERC20s required to craft the new token.
   * @param _ingredientAmounts The amount of required tokens for each ERC20.
   * @return The address of the newly created token.
   */
  function addCraftable(string _name, string _symbol, string _tokenURI, ERC20[] _ingredients, uint256[] _ingredientAmounts) public returns (CraftableToken) {
    require(_ingredients.length == _ingredientAmounts.length);
    require(_ingredients.length > 0);

    CraftableToken newCraftable = new CraftableToken(_name, _symbol, _tokenURI, _ingredients, _ingredientAmounts);
    craftables.push(newCraftable);

    emit CraftableAdded(newCraftable);

    return newCraftable;
  }

  /**
   * @dev Adds a pre-created craftable token to the game. No tests are
   * performed on the craftable to make sure its valid. Only admin
   * users can do this. After this call, ownsership of the token must be
   * transferred to the Crafty contract, to allow it to mint tokens.
   * @param _craftable The address of the craftable token to add.
   */
  function addPrecreatedCraftable(CraftableToken _craftable) onlyRole(ROLE_ADMIN) public {
    craftables.push(_craftable);
    emit CraftableAdded(_craftable);
  }

  /**
   * @dev Crafts a craftable. The player must have allowed Crafty to use his
   * ingredient tokens, which will be transferred to the game contract during crafting.
   * @param _craftable The craftable to craft.
   */
  function craft(CraftableToken _craftable) public {
    address player = msg.sender;

    uint256 totalSteps = _craftable.getTotalRecipeSteps();
    for (uint i = 0; i < totalSteps; ++i) {
      ERC20 ingredient;
      uint256 amountNeeded;
      (ingredient, amountNeeded) = _craftable.getRecipeStep(i);

      ingredient.transferFrom(player, address(this), amountNeeded);
    }

    // Issue the crafted token - for ingredient-less tokens, a higher number of
    // tokens are minted.
    uint256 tokensToMint = (totalSteps == 0) ? 100 : 1;
    _craftable.mint(player, tokensToMint);
  }

  // Admin API

  /**
   * @dev Adds a new admin.
   * @param _user The address of the new admin.
   */
  function addAdminRole(address _user) onlyRole(ROLE_ADMIN) public {
    addRole(_user, ROLE_ADMIN);
  }

  /**
   * @dev Deletes a craftable from the game.
   * @param _craftable The craftable token to delete.
   */
  function deleteCraftable(CraftableToken _craftable) public onlyRole(ROLE_ADMIN) {
    delete craftables[getCraftableIndex(_craftable)];
    emit CraftableDeleted(_craftable);
  }

  // Internals

  /**
   * @dev Returns the index of a craftable stored in the game.
   */
  function getCraftableIndex(CraftableToken _craftable) internal view returns (uint256) {
    for (uint i = 0; i < craftables.length; ++i) {
      if (craftables[i] == _craftable) {
        return i;
      }
    }

    revert();
  }
}
