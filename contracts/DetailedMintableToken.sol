pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


contract DetailedMintableToken is DetailedERC20, MintableToken {
  function DetailedMintableToken(
    string _name,
    string _symbol,
    uint8 _decimals
  )
    DetailedERC20(_name, _symbol, _decimals)
    public
  {}
}
