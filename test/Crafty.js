const expectPromiseThrow = require("./helpers/expectPromiseThrow");
const _ = require("underscore");

const Crafty = artifacts.require("Crafty");

contract("Crafty", accounts => {
  let crafty = null;
  const player = accounts[0];

  beforeEach(async() => {
    crafty = await Crafty.new();
  });

  it("player starts with no resources", async() => {
    const resources = await crafty.resourcesOf(player, "wood");
    assert(resources.eq(0));
  });

  it("resources increase by acquiring them", async() => {
    await crafty.getResource("wood");

    const balance = await crafty.resourcesOf(player, "wood");
    assert(balance.eq(1));
  });

  it("resources can be acquired multiple times", async() => {
    _.times(5, async() => {
      await crafty.getResource("wood");
    });

    const balance = await crafty.resourcesOf(player, "wood");
    assert(balance.eq(5));
  });

  it("multiple resource types can be acquired", async() => {
    await crafty.getResource("wood");
    await crafty.getResource("iron");

    const wood_balance = await crafty.resourcesOf(player, "wood");
    const iron_balance = await crafty.resourcesOf(player, "wood");

    assert(wood_balance.eq(1));
    assert(iron_balance.eq(1));
  });

  it("invalid resources cannot be aquired", async () => {
    await expectPromiseThrow(crafty.getResource(""));
  });
});