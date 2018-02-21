const _ = require('underscore');
const fs = require('fs');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const Crafty = artifacts.require('Crafty');

contract('Crafty', accounts => {
  let crafty = null;
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));
  const player = accounts[0];

  beforeEach(async () => {
    crafty = await Crafty.new();
  });

  it('player starts with no resources', async () => {
    const resources = await crafty.resourcesOf(player, rules.resources[0]);
    assert(resources.eq(0));
  });

  it('resources increase by acquiring them', async () => {
    await crafty.getResource(rules.resources[0]);

    const balance = await crafty.resourcesOf(player, rules.resources[0]);
    assert(balance.eq(1));
  });

  it('resources can be acquired multiple times', async () => {
    Promise.all(_.range(5).map(() => {
      crafty.getResource(rules.resources[0]);
    }));

    const balance = await crafty.resourcesOf(player, rules.resources[0]);
    assert(balance.eq(5));
  });

  it('multiple resource types can be acquired', async () => {
    await Promise.all(rules.resources.map(res => crafty.getResource(res)));

    const balances = await Promise.all(rules.resources.map(res => crafty.resourcesOf(player, res)));
    balances.forEach(balance => {
      assert(balance.eq(1));
    });
  });

  it('invalid resources cannot be aquired', async () => {
    await expectPromiseThrow(crafty.getResource(''));
  });
});
