pragma solidity ^0.4.17;

contract Crafty {
  // This could later be implemented with multiple 'Item' contracts
  mapping (string => mapping (address => uint256)) private items;
  mapping (string => bool) private basicItems;

  function Crafty() public {
    basicItems["wood"] = true;
    basicItems["stone"] = true;
    basicItems["bronze"] = true;
    basicItems["iron"] = true;
  }

  function itemsOf(address player, string itemName) public view returns (uint256) {
    return items[itemName][player];
  }

  function getItem(string itemName) public {
    require(isBasicItem(itemName));

    address player = msg.sender;
    items[itemName][player] += 1;
  }

  function isBasicItem(string itemName) public view returns (bool) {
    return basicItems[itemName];
  }
}
