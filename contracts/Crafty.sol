pragma solidity ^0.4.17;

contract Crafty {
  mapping (address => uint256) private resources;

  function resourcesOf(address player) public view returns (uint256) {
    return resources[player];
  }

  function getResource() public {
    address player = msg.sender;
    resources[player] += 1;
  }
}
