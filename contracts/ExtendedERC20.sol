pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract ExtendedERC20 is DetailedERC20 {
  string public tokenURI;

  function ExtendedERC20(
    string _name,
    string _symbol,
    uint8 _decimals,
    string _tokenURI
  )
    DetailedERC20(_name, _symbol, _decimals)
    public
  {
    tokenURI = _tokenURI;
  }
}
