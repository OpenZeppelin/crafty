const _ = require('underscore');
const fs = require('fs');

const expectPromiseThrow = require('./helpers/expectPromiseThrow');
const addItemsFromRules = require('../migrations/addItemsFromRules');

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

    describe('Adding items', () => {
      it('items can be added by the owner', async () => {
        await crafty.addItem('table', {from: owner});

        const item = await crafty.getItem('table');
        assert.notEqual(item, zeroAddress);
      });

      it('initial amount of new items is zero', async () => {
        await crafty.addItem('table', {from: owner});

        const amount = await crafty.getItemAmount('table', {from: player});
        assert(amount.eq(0));
      });

      it('items cannot be added by players', async () => {
        await expectPromiseThrow(crafty.addItem('table', {from: player}));
      });

      it('items can only be added once', async () => {
        await crafty.addItem('table', {from: owner});
        await expectPromiseThrow(crafty.addItem('table', {from: owner}));
      });

      it('multiple types of items can be added by the owner', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('chair', {from: owner});

        const tableItem = await crafty.getItem('table');
        assert.notEqual(tableItem, zeroAddress);

        const chairItem = await crafty.getItem('chair');
        assert.notEqual(chairItem, zeroAddress);
      });
    });

    describe('Adding ingredients', () => {
      // As of now, we have no way of checking if the ingredient was actually added,
      // so we consider a lack of contract errors a success.

      it('ingredients can be added by the owner', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('plank', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
      });

      it('ingredients cannot be added by players', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: player}));
      });

      it('multiple ingredients can be added by the owner', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('plank', {from: owner});
        await crafty.addItem('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});
      });

      it('ingredients must exist', async () => {
        await crafty.addItem('table', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: owner}));
      });

      it('the ingredients result must exist', async () => {
        await crafty.addItem('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'plank', 1, {from: owner}));
      });

      it('the ingredient must not be the result', async () => {
        await crafty.addItem('plank', {from: owner});

        await expectPromiseThrow(crafty.addIngredient('table', 'table', 1, {from: owner}));
      });
    });

    describe('Crafting', () => {
      it('items with no ingredients can be crafted', async () => {
        await crafty.addItem('table', {from: owner});

        await crafty.craftItem('table', {from: player});

        const amount = await crafty.getItemAmount('table', {from: player});
        assert(amount.eq(1));
      });

      it('items with ingredients cannot be crafted without the ingredients', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('plank', {from: owner});
        await crafty.addItem('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});

        await expectPromiseThrow(crafty.craftItem('table', {from: player}));
      });

      it('crafting items with ingredients destroys all the ingredients', async () => {
        await crafty.addItem('table', {from: owner});
        await crafty.addItem('plank', {from: owner});
        await crafty.addItem('stick', {from: owner});

        await crafty.addIngredient('table', 'plank', 1, {from: owner});
        await crafty.addIngredient('table', 'stick', 4, {from: owner});

        await crafty.craftItem('plank', {from: player});
        await Promise.all(_.range(4).map(() => crafty.craftItem('stick', {from: player})));

        await crafty.craftItem('table', {from: player});

        const tableAmount = await crafty.getItemAmount('table', {from: player});
        assert(tableAmount.eq(1));

        const plankAmount = await crafty.getItemAmount('plank', {from: player});
        assert(plankAmount.eq(0));

        const stickAmount = await crafty.getItemAmount('stick', {from: player});
        assert(stickAmount.eq(0));
      });
    });
  });

  describe('Official game', () => {
    const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));

    const basicItems = rules.basic;
    const advItems = rules.recipes.map(rec => rec.result);
    const items = basicItems.concat(advItems);

    beforeEach(async () => {
      await deployCraftyWithItems();
    });

    async function deployCraftyWithItems() {
      crafty = await Crafty.new({from: owner});
      await addItemsFromRules(crafty, rules);
    }

    it('player starts with no items', async () => {
      const amounts = await Promise.all(items.map(item => crafty.getItemAmount(item, {from: player})));
      assert(amounts.every(amount => amount.eq(0)));
    });

    it('basic items can be acquired', async () => {
      await Promise.all(basicItems.map(item => crafty.craftItem(item, {from: player})));

      const basicAmounts = await Promise.all(basicItems.map(item => crafty.getItemAmount(item, {from: player})));
      const advAmounts = await Promise.all(advItems.map(item => crafty.getItemAmount(item, {from: player})));

      assert(basicAmounts.every(amount => amount.eq(1)));
      assert(advAmounts.every(amount => amount.eq(0)));
    });

    it('advanced items cannot be acquired with no materials', () => {
      advItems.forEach(async item => {
        await expectPromiseThrow(crafty.craftItem(item, {from: player}));
      });
    });

    it('advanced items can be crafted', async () => {
      function isBasic(ingredient) {
        return rules.basic.indexOf(ingredient.name) !== -1;
      }

      async function craft(recipe) {
        // Get all basic ingredients
        await Promise.all(recipe.ingredients.filter(ing => isBasic(ing)).map(ing => {
          // For each ingredient, get the required amount
          return Promise.all(_.range(ing.amount).map(() => crafty.craftItem(ing.name, {from: player})));
        }));

        // For each advanced ingredient, get its ingredients, and craft it
        await Promise.all(recipe.ingredients.filter(ing => !isBasic(ing)).map(ing => craft(rules.recipes.filter(rec_ => rec_.result === ing.name)[0])));

        await crafty.craftItem(recipe.result, {from: player});
      }

      // Each recipe will be tested with a new contract, to ensure an empty starting inventory
      for (const recipe of rules.recipes) { // eslint-disable-line no-await-in-loop
        await deployCraftyWithItems();

        await craft(recipe);

        const result = recipe.result;
        const resultAmount = await crafty.getItemAmount(result, {from: player});
        const othersAmount = await Promise.all(items.filter(item => item !== result).map(item => crafty.getItemAmount(item, {from: player})));

        assert(resultAmount.eq(1));
        assert(othersAmount.every(amount => amount.eq(0)));
      }
    });
  });
});
