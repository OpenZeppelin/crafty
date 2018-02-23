const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const Item = artifacts.require('Item');

contract('Item', accounts => {
  let item = null;
  const owner = accounts[0]; // This is the account that creates the contract
  const players = accounts.slice(1, accounts.length);

  beforeEach(async () => {
    item = await Item.new({from: owner});
  });

  it('players start with no items', async () => {
    const balances = await Promise.all(players.map(player => item.amount(player)));
    assert(balances.every(balance => balance.eq(0)));
  });

  it('the owner can increase the balance of players selectively', async () => {
    await item.add(players[0], 10, {from: owner});
    await item.add(players[1], 20, {from: owner});

    const balances = await Promise.all(players.map(player => item.amount(player)));

    assert(balances[0].eq(10));
    assert(balances[1].eq(20));
    assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
  });

  it('balance can be increased multiple times', async () => {
    await item.add(players[0], 10, {from: owner});
    await item.add(players[0], 20, {from: owner});

    const balance = await item.amount(players[0]);
    assert(balance.eq(30));
  });

  it('non-owners cannot increase balances', async () => {
    await expectPromiseThrow(item.add(players[0], 10, {from: players[0]}));
    await expectPromiseThrow(item.add(players[1], 10, {from: players[0]}));

    const balances = await Promise.all(players.map(player => item.amount(player)));
    assert(balances.every(balance => balance.eq(0)));
  });

  it('the owner can decrease the balance of players selectively', async () => {
    await item.add(players[0], 10, {from: owner});
    await item.add(players[1], 20, {from: owner});

    await item.subtract(players[0], 5, {from: owner});
    await item.subtract(players[1], 2, {from: owner});

    const balances = await Promise.all(players.map(player => item.amount(player)));

    assert(balances[0].eq(5));
    assert(balances[1].eq(18));
    assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
  });

  it('balance can be decreased multiple times', async () => {
    await item.add(players[0], 20, {from: owner});

    await item.subtract(players[0], 6, {from: owner});
    await item.subtract(players[0], 4, {from: owner});

    const balance = await item.amount(players[0]);
    assert(balance.eq(10));
  });

  it('balance cannot be negative', async () => {
    await expectPromiseThrow(item.subtract(players[0], 1, {from: owner}));
  });

  it('non-owners cannot decrease balances', async () => {
    await item.add(players[0], 10, {from: owner});
    await item.add(players[1], 20, {from: owner});

    await expectPromiseThrow(item.subtract(players[0], 5, {from: players[0]}));
    await expectPromiseThrow(item.subtract(players[1], 12, {from: players[0]}));

    const balances = await Promise.all([item.amount(players[0]), item.amount(players[1])]);

    assert(balances[0].eq(10));
    assert(balances[1].eq(20));
    assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
  });
});
