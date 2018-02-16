pragma solidity ^0.4.17;

contract Crafty {
  // This could later be implemented with multiple 'Resource' contracts
  mapping (string => mapping (address => uint256)) private resources;
  mapping (string => bool) private resourceTypes;

  function Crafty() public {
    resourceTypes["wood"] = true;
    resourceTypes["stone"] = true;
    resourceTypes["bronze"] = true;
    resourceTypes["iron"] = true;
  }

  function resourcesOf(address player, string resourceType) public view returns (uint256) {
    return resources[resourceType][player];
  }

  function getResource(string resourceType) public {
    require(isValidResource(resourceType));

    address player = msg.sender;
    resources[resourceType][player] += 1;
  }

  function isValidResource(string resourceType) public view returns (bool) {
    return resourceTypes[resourceType];
  }
}
