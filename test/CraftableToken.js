const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const CraftableToken = artifacts.require('CraftableToken');

contract('CraftableToken', accounts => {
  let craftable = null;
  const owner = accounts[0]; // This is the account that creates the token
  const players = accounts.slice(1, accounts.length);
  const zeroAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    craftable = await CraftableToken.new({from: owner});
  });

  it('players start with no craftables', async () => {
    const balances = await Promise.all(players.map(player => craftable.balanceOf(player)));
    assert(balances.every(balance => balance.eq(0)));
  });

  describe('Ingredients', () => {
    it('craftables start with no ingredients', async () => {
      const recipeSteps = await craftable.getTotalRecipeSteps();
      assert.equal(recipeSteps, 0);
    });

    it('invalid recipe steps cannot be accessed', async () => {
      const recipeSteps = await craftable.getTotalRecipeSteps();

      await expectPromiseThrow(craftable.getIngredient(recipeSteps + 1));
      await expectPromiseThrow(craftable.getAmountNeeded(recipeSteps + 1));
    });

    it('the owner can add ingredients', async () => {
      const ingredient = await CraftableToken.new({from: owner});
      await craftable.addRecipeStep(ingredient.contract.address, 3, {from: owner});

      const totalRecipeSteps = await craftable.getTotalRecipeSteps();
      assert(totalRecipeSteps.eq(1));

      const storedIngredient = await craftable.getIngredient(0);
      const storedAmountNeeded = await craftable.getAmountNeeded(0);

      assert.equal(storedIngredient, ingredient.contract.address);
      assert(storedAmountNeeded.eq(3));
    });

    it('the owner can add multiple ingredients', async () => {
      const recipeSteps = await Promise.all([5, 7, 10].map(amount =>
        CraftableToken.new({from: owner}).then(ingredient =>
          ({'ingredient': ingredient, 'amount': amount})
        )
      ));

      await Promise.all(recipeSteps.map(step =>
        craftable.addRecipeStep(step.ingredient.contract.address, step.amount, {from: owner})
      ));

      const totalRecipeSteps = await craftable.getTotalRecipeSteps();
      assert(totalRecipeSteps.eq(recipeSteps.length));

      for (let i = 0; i < recipeSteps.length; ++i) { // eslint-disable-line no-await-in-loop
        const storedIngredient = await craftable.getIngredient(i);
        const storedAmountNeeded = await craftable.getAmountNeeded(i);

        assert.equal(storedIngredient, recipeSteps[i].ingredient.contract.address);
        assert(storedAmountNeeded.eq(recipeSteps[i].amount));
      }
    });

    it('non-owners cannot add ingredients', async () => {
      const ingredient = await CraftableToken.new({from: owner});
      await expectPromiseThrow(craftable.addRecipeStep(ingredient.contract.address, 3, {from: players[0]}));
    });
  });

  describe('Minting', () => {
    it('the owner can mint new craftables for players selectively', async () => {
      await craftable.mint(players[0], 10, {from: owner});
      await craftable.mint(players[1], 20, {from: owner});

      const balances = await Promise.all(players.map(player => craftable.balanceOf(player)));

      assert(balances[0].eq(10));
      assert(balances[1].eq(20));
      assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
    });

    it('events are emitted when craftables are minted', async () => {
      const {logs} = await craftable.mint(players[0], 10, {from: owner});

      const mintEvents = logs.filter(log => log.event === 'Mint');
      assert.equal(mintEvents.length, 1);
      assert.equal(mintEvents[0].args.player, players[0]);
      assert(mintEvents[0].args.amount.eq(10));

      const transferEvents = logs.filter(log => log.event === 'Transfer');
      assert.equal(transferEvents.length, 1);
      assert.equal(transferEvents[0].args.from, zeroAddress);
      assert.equal(transferEvents[0].args.to, players[0]);
      assert(transferEvents[0].args.value.eq(10));
    });

    it('craftables can be minted multiple times', async () => {
      await craftable.mint(players[0], 10, {from: owner});
      await craftable.mint(players[0], 20, {from: owner});

      const balance = await craftable.balanceOf(players[0]);
      assert(balance.eq(30));
    });

    it('non-owners cannot mint craftables', async () => {
      await expectPromiseThrow(craftable.mint(players[0], 10, {from: players[0]}));
      await expectPromiseThrow(craftable.mint(players[1], 10, {from: players[0]}));

      const balances = await Promise.all(players.map(player => craftable.balanceOf(player)));
      assert(balances.every(balance => balance.eq(0)));
    });
  });

  describe('Burning', () => {
    it('the owner can burn craftables of players selectively', async () => {
      await craftable.mint(players[0], 10, {from: owner});
      await craftable.mint(players[1], 20, {from: owner});

      await craftable.burn(players[0], 5, {from: owner});
      await craftable.burn(players[1], 2, {from: owner});

      const balances = await Promise.all(players.map(player => craftable.balanceOf(player)));

      assert(balances[0].eq(5));
      assert(balances[1].eq(18));
      assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
    });

    it('events are emitted when craftables are burned', async () => {
      await craftable.mint(players[0], 10, {from: owner});
      const {logs} = await craftable.burn(players[0], 5, {from: owner});

      const burnEvents = logs.filter(log => log.event === 'Burn');
      assert.equal(burnEvents.length, 1);
      assert.equal(burnEvents[0].args.player, players[0]);
      assert(burnEvents[0].args.amount.eq(5));
    });

    it('craftables can be burned multiple times', async () => {
      await craftable.mint(players[0], 20, {from: owner});

      await craftable.burn(players[0], 6, {from: owner});
      await craftable.burn(players[0], 4, {from: owner});

      const balance = await craftable.balanceOf(players[0]);
      assert(balance.eq(10));
    });

    it('craftables cannot be burned below zero', async () => {
      await expectPromiseThrow(craftable.burn(players[0], 1, {from: owner}));
    });

    it('non-owners cannot burn craftables', async () => {
      await craftable.mint(players[0], 10, {from: owner});
      await craftable.mint(players[1], 20, {from: owner});

      await expectPromiseThrow(craftable.burn(players[0], 5, {from: players[0]}));
      await expectPromiseThrow(craftable.burn(players[1], 12, {from: players[0]}));

      const balances = await Promise.all([craftable.balanceOf(players[0]), craftable.balanceOf(players[1])]);

      assert(balances[0].eq(10));
      assert(balances[1].eq(20));
      assert(balances.slice(2, balances.length).every(balance => balance.eq(0)));
    });
  });
});
