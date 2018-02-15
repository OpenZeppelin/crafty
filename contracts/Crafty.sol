pragma solidity ^0.4.17;

contract Crafty {
  mapping (address => uint256) private resources;

  function resourcesOf(address owner) public view
  returns(uint256) {
    return resources[owner];
  }

  function getResource() public
  returns(bool) {
    address owner = msg.sender;
    resources[owner] += 1;

    return true;
  }
}
