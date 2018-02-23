pragma solidity ^0.4.17;

import './Item.sol';

contract CraftyRecipes {
  Item private wood;
  Item private stone;
  Item private bronze;
  Item private iron;
  Item private stoneSword;
  Item private bronzeSword;
  Item private ironSword;
  Item private triSword;

  function CraftyRecipes() public {
    wood = new Item();
    stone = new Item();
    bronze = new Item();
    iron = new Item();
    stoneSword = new Item();
    bronzeSword = new Item();
    ironSword = new Item();
    triSword = new Item();
  }

  // Item acquisition

  function acquireWood() public {
    wood.add(msg.sender, 1);
  }

  function acquireStone() public {
    stone.add(msg.sender, 1);
  }

  function acquireBronze() public {
    bronze.add(msg.sender, 1);
  }

  function acquireIron() public {
    iron.add(msg.sender, 1);
  }

  function acquireStoneSword() public {
    require(amountWood() >= 1);
    require(amountStone() >= 3);

    address player = msg.sender;

    wood.subtract(player, 1);
    stone.subtract(player, 3);
    stoneSword.add(player, 1);
  }

  function acquireBronzeSword() public {
    require(amountWood() >= 1);
    require(amountBronze() >= 3);

    address player = msg.sender;

    wood.subtract(player, 1);
    bronze.subtract(player, 3);
    bronzeSword.add(player, 1);
  }

  function acquireIronSword() public {
    require(amountWood() >= 1);
    require(amountIron() >= 3);

    address player = msg.sender;

    wood.subtract(player, 1);
    iron.subtract(player, 3);
    ironSword.add(player, 1);
  }

  function acquireTriSword() public {
    require(amountStoneSword() >= 1);
    require(amountBronzeSword() >= 1);
    require(amountIronSword() >= 1);

    address player = msg.sender;

    stoneSword.subtract(player, 1);
    bronzeSword.subtract(player, 1);
    ironSword.subtract(player, 1);
    triSword.add(player, 1);
  }

  // Item amount query

  function amountWood() public view returns (uint256) {
    return wood.amount(msg.sender);
  }

  function amountStone() public view returns (uint256) {
    return stone.amount(msg.sender);
  }

  function amountBronze() public view returns (uint256) {
    return bronze.amount(msg.sender);
  }

  function amountIron() public view returns (uint256) {
    return iron.amount(msg.sender);
  }

  function amountStoneSword() public view returns (uint256) {
    return stoneSword.amount(msg.sender);
  }

  function amountBronzeSword() public view returns (uint256) {
    return bronzeSword.amount(msg.sender);
  }

  function amountIronSword() public view returns (uint256) {
    return ironSword.amount(msg.sender);
  }

  function amountTriSword() public view returns (uint256) {
    return triSword.amount(msg.sender);
  }
}
