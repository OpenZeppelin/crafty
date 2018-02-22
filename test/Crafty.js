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

  it('player starts with no items', async () => {
    const items = await crafty.itemsOf(player, rules.basic[0]);
    assert(items.eq(0));
  });

  it('items increase by acquiring them', async () => {
    await crafty.getItem(rules.basic[0]);

    const balance = await crafty.itemsOf(player, rules.basic[0]);
    assert(balance.eq(1));
  });

  it('items can be acquired multiple times', async () => {
    Promise.all(_.range(5).map(() => {
      crafty.getItem(rules.basic[0]);
    }));

    const balance = await crafty.itemsOf(player, rules.basic[0]);
    assert(balance.eq(5));
  });

  it('all basic items can be acquired', async () => {
    await Promise.all(rules.basic.map(item => crafty.getItem(item)));

    const balances = await Promise.all(rules.basic.map(item => crafty.itemsOf(player, item)));
    balances.forEach(balance => {
      assert(balance.eq(1));
    });
  });

  it('invalid items cannot be aquired', async () => {
    await expectPromiseThrow(crafty.getItem(''));
  });
});
