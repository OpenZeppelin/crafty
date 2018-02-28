pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Item is Ownable {
  using SafeMath for uint256;

  mapping (address => uint256) private balances;

  function add(address player, uint256 amount) public onlyOwner {
    balances[player] = balances[player].add(amount);
  }

  function subtract(address player, uint256 amount) public onlyOwner {
    require(balances[player] >= amount);
    balances[player] = balances[player].sub(amount);
  }

  function amount(address player) public view returns (uint256) {
    return balances[player];
  }
}
