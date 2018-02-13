pragma solidity ^0.4.17;

contract Crafty {
  mapping (address => uint256) public balances;
  uint256 public lastNonce;
  uint256 public difficulty;

  function Crafty(uint256 seed) public {
    lastNonce = seed;
    difficulty = 2**250;
  }

  function balanceOf(address owner) public view
  returns(uint256) {
    return balances[owner];
  }

  function getReward(uint256 nonce) public
  returns(bool) {
    address owner = msg.sender;

    bytes32 digest = keccak256(owner, lastNonce, nonce);
    require(uint256(digest) < difficulty);

    lastNonce = nonce;
    balances[owner] += 1;
    return true;
  }
}
