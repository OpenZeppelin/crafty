const Crafty = artifacts.require("Crafty");

contract("Crafty", accounts => {
  let crafty = null;
  const player = accounts[0];

  beforeEach(async() => {
    crafty = await Crafty.new();
  });

  it("player starts with no resources", async() => {
    const resources = await crafty.resourcesOf(player);
    assert(resources.eq(0));
  });

  it("resources increase by acquiring them", async() => {
    crafty.getResource();

    const balance = await crafty.resourcesOf(player);
    assert(balance.eq(1));
  });
});