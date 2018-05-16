pragma solidity ^0.4.21;

import 'openzeppelin-zos/contracts/token/ERC20/DetailedERC20.sol';


contract ExtendedERC20 is DetailedERC20 {
  string public tokenURI;

  function initialize(address _sender, string _name, string _symbol, uint8 _decimals, string _tokenURI) isInitializer('ExtendedERC20', '0') public {
    DetailedERC20.initialize(_sender, _name, _symbol, _decimals);
    tokenURI = _tokenURI;
  }
}
