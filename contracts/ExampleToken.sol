/* we need truffle to compile this artifact pls */

pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";



contract ExampleToken is StandardToken, DetailedERC20 {}
