pragma solidity ^0.4.21;

import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';


contract ExtendedERC20 is DetailedERC20 {
  string public tokenURI;

  function ExtendedERC20(string _tokenURI) public {
    tokenURI = _tokenURI;
  }
}
