pragma solidity ^0.4.17;

import './CraftableToken.sol';
import 'zeppelin-solidity/contracts/ownership/rbac/RBAC.sol';
import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';


/**
 * @title Crafting token game
 * @dev The game holds multiple CraftableTokens (craftables), which can be
 * crafted by players. Crafting advanced tokens (those with ingredients)
 * requires the player to hold the required amount of said ingredient, which will be
 * consumed up in the crafting process. New craftables (with their ingredients) can be
 * added by all players.
 */
contract Crafty is RBAC {
  // Storage for craftables. Some of them may have been zeroed-out (by a deleteCraftable
  // call), so validation of each CraftableToken should be performed by readers.
  CraftableToken[] public craftables;

  // Role Based Access Control (RBAC)

  string public constant ROLE_ADMIN = "admin";
  string public constant ROLE_CURATOR = "curator";

  modifier onlyAdmin() {
    checkRole(msg.sender, ROLE_ADMIN);
    _;
  }

  modifier onlyCurator() {
    checkRole(msg.sender, ROLE_CURATOR);
    _;
  }

  // Admins can add new admins, and add and remove curators.

  function addAdminRole(address _user) onlyAdmin public {
    addRole(_user, ROLE_ADMIN);
  }

  function addCuratorRole(address _user) onlyAdmin public {
    addRole(_user, ROLE_CURATOR);
  }

  function removeCuratorRole(address _user) onlyAdmin public {
    removeRole(_user, ROLE_CURATOR);
  }

  function Crafty() public {
    // Make the deployer the initial admin.
    addRole(msg.sender, ROLE_ADMIN);
  }

  // Player API

  /**
   * @dev Returns one of the game's craftables. Reverts if the craftable doesn't exist.
   * @param _id The craftable's id.
   */
  function getCraftable(uint256 _id) public view returns (CraftableToken) {
    return craftables[getCraftableIndex(_id)];
  }

  /**
   * @dev Crafts a craftable. The player must have allowed Crafty to use his
   * tokens, which will be transferred to the null address (destoyed) during
   * crafting.
   * @param _craftable The craftable to craft.
   */
  function craft(CraftableToken _craftable) public {
    address player = msg.sender;

    uint256 totalSteps = _craftable.getTotalRecipeSteps();
    for (uint i = 0; i < totalSteps; ++i) {
      ERC20 ingredient;
      uint256 amountNeeded;
      (ingredient, amountNeeded) = _craftable.getRecipeStep(i);

      ingredient.transferFrom(player, 0, amountNeeded);
    }

    // Issue the crafted token
    _craftable.transfer(player, 1);
  }

  /**
   * @dev Adds a new craftable to the game.
   * @param _ingredients An array with the different ERC20s required to craft the new token.
   * @param _ingredient_amounts The amount of required tokens for each ERC20.
   * @return The id of the newly created token, which is used to interact with it.
   */
  function addCraftable(ERC20[] _ingredients, uint256[] _ingredient_amounts) public returns (uint256) {
    uint256 id = uint256(keccak256(craftables.length)); // No need for these to be random, uniqueness is enough
    craftables.push(new CraftableToken(id, _ingredients, _ingredient_amounts));

    return id;
  }

  // Admin API

  /**
   * @dev Deletes a craftable from the game.
   * @param _id The id of the craftable to delete.
   */
  function deleteCraftable(uint256 _id) public onlyAdmin {
    delete craftables[getCraftableIndex(_id)];
  }

  // Curator API

  // Internals

  function getCraftableIndex(uint256 _id) internal view returns (uint256) {
    for (uint i = 0; i < craftables.length; ++i) {
      if (craftables[i].id() == _id) {
        return i;
      }
    }

    revert();
  }
}
