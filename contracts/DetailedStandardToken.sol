pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract DetailedStandardToken is DetailedERC20, StandardToken {
  function DetailedStandardToken(string _name, string _symbol, uint8 _decimals) DetailedERC20(_name, _symbol, _decimals) public {}
}
