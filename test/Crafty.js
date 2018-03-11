const _ = require('underscore');
const fs = require('fs');

const expectPromiseThrow = require('./helpers/expectPromiseThrow');
const addCraftablesFromRules = require('../migrations/addCraftablesFromRules');

const Crafty = artifacts.require('Crafty');

contract('Crafty', accounts => {
  let crafty = null;
  const owner = accounts[0];
  const player = accounts[1];
  const zeroAddress = '0x0000000000000000000000000000000000000000';

  describe('New game', () => {
    beforeEach(async () => {
      crafty = await Crafty.new({from: owner});
    });

    describe('Adding craftables', () => {
      it('non-added craftables cannot be retrieved', async () => {
        await expectPromiseThrow(crafty.getCraftable('table'));
      });

      it('craftables can be added by the owner', async () => {
        await crafty.addCraftable('table', {from: owner});

        const craftable = await crafty.getCraftable('table');
        assert.notEqual(craftable, zeroAddress);
      });

      it('initial amount of new craftables is zero', async () => {
        await crafty.addCraftable('table', {from: owner});

        const amount = await crafty.getAmount('table', {from: player});
        assert(amount.eq(0));
      });

      it('craftables cannot be added by players', async () => {
        await expectPromiseThrow(crafty.addCraftable('table', {from: player}));
      });

      it('craftables can only be added once', async () => {
        await crafty.addCraftable('table', {from: owner});
        await expectPromiseThrow(crafty.addCraftable('table', {from: owner}));
      });

      it('multiple types of craftables can be added by the owner', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('chair', {from: owner});

        const tableCraftable = await crafty.getCraftable('table');
        assert.notEqual(tableCraftable, zeroAddress);

        const chairCraftable = await crafty.getCraftable('chair');
        assert.notEqual(chairCraftable, zeroAddress);
      });
    });

    describe('Adding ingredients', () => {
      // As of now, we have no way of checking if the ingredient was actually added,
      // so we consider a lack of contract errors a success.

      it('ingredients can be added by the owner', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('plank', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
      });

      it('ingredients cannot be added by players', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: player}));
      });

      it('multiple ingredients can be added by the owner', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('plank', {from: owner});
        await crafty.addCraftable('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});
      });

      it('ingredients must exist', async () => {
        await crafty.addCraftable('table', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: owner}));
      });

      it('the ingredient\'s result must exist', async () => {
        await crafty.addCraftable('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: owner}));
      });

      it('the ingredient must not be the result', async () => {
        await crafty.addCraftable('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'table', 1, {from: owner}));
      });
    });

    describe('Crafting', () => {
      it('craftables with no ingredients can be crafted', async () => {
        await crafty.addCraftable('table', {from: owner});

        await crafty.craft('table', {from: player});

        const amount = await crafty.getAmount('table', {from: player});
        assert(amount.eq(1));
      });

      it('craftables with ingredients cannot be crafted without the ingredients', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('plank', {from: owner});
        await crafty.addCraftable('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});

        await expectPromiseThrow(crafty.craft('table', {from: player}));
      });

      it('crafting craftables with ingredients destroys all the ingredients', async () => {
        await crafty.addCraftable('table', {from: owner});
        await crafty.addCraftable('plank', {from: owner});
        await crafty.addCraftable('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});

        await crafty.craft('plank', {from: player});
        await Promise.all(_.range(4).map(() => crafty.craft('stick', {from: player})));

        await crafty.craft('table', {from: player});

        const tableAmount = await crafty.getAmount('table', {from: player});
        assert(tableAmount.eq(1));

        const plankAmount = await crafty.getAmount('plank', {from: player});
        assert(plankAmount.eq(0));

        const stickAmount = await crafty.getAmount('stick', {from: player});
        assert(stickAmount.eq(0));
      });
    });
  });

  describe('Official game', () => {
    const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));

    beforeEach(async () => {
      await deployCraftyWithCraftables();
    });

    async function deployCraftyWithCraftables() {
      crafty = await Crafty.new({from: owner});
      await addCraftablesFromRules(crafty, rules);
    }

    it('player starts with no craftables', async () => {
      const amounts = await Promise.all(rules.craftables.map(craftable => crafty.getAmount(craftable.name, {from: player})));
      assert(amounts.every(amount => amount.eq(0)));
    });

    it('all craftables can be crafted', async () => {
      async function craft(craftable) {
        // Craft the required amount of each ingredient
        await Promise.all(craftable.ingredients.map(ingredient => {
          // Assume the ingredient exists and is unique
          const ingredientCraftable = rules.craftables.filter(_craftable => _craftable.name === ingredient.name)[0];

          return Promise.all(_.range(ingredient.amount).map(() => craft(ingredientCraftable)));
        }));

        await crafty.craft(craftable.name, {from: player});
      }

      // Each craftable will be tested with a new contract, to ensure an empty starting inventory
      for (const craftable of rules.craftables) { // eslint-disable-line no-await-in-loop
        await deployCraftyWithCraftables();

        await craft(craftable);

        const resultAmount = await crafty.getAmount(craftable.name, {from: player});
        const othersAmount = await Promise.all(rules.craftables
          .filter(_craftable => _craftable.name !== craftable.name)
          .map(_craftable => crafty.getAmount(_craftable.name, {from: player})));

        assert(resultAmount.eq(1));
        assert(othersAmount.every(amount => amount.eq(0)));
      }
    });
  });
});
