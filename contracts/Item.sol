pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * Based on OpenZeppelin's Mintable (https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol)
 * and Burnable (https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/BurnableToken.sol) tokens.
 */
contract Item is StandardToken, Ownable {
  event Mint(address indexed player, uint256 amount);
  event Burn(address indexed player, uint256 amount);

  /**
   * @dev Mints (creates) new tokens and adds it to a player's supply.
   * @param player The player that will receive the minted tokens.
   * @param amount The amount of tokens to mint.
   */
  function mint(address player, uint256 amount) onlyOwner public {
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
  function burn(address player, uint256 amount) onlyOwner public {
    require(amount <= balances[player]);
    // No need to require amount <= totalSupply, since that would imply the
    // player's balance is greater than the totalSupply, which *should* be an
    // assertion failure

    totalSupply_ = totalSupply_.sub(amount);
    balances[player] = balances[player].sub(amount);

    Burn(player, amount);
  }
}
