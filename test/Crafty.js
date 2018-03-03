const _ = require('underscore');
const fs = require('fs');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const Crafty = artifacts.require('Crafty');

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function pascalify(str) {
  return str.replace('-', ' ').split(' ').reduce((accum, str) => accum.concat(capitalize(str)), '');
}

contract('Crafty', accounts => {
  let crafty = null;
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));
  const owner = accounts[0];
  const player = accounts[1];

  const basicItems = rules.basic.map(item => pascalify(item));
  const advItems = rules.recipes.map(rec => rec.result).map(item => pascalify(item));
  const items = basicItems.concat(advItems);

  beforeEach(async () => {
    await deployCrafty();
  });

  async function deployCrafty() {
    crafty = await Crafty.new({from: owner});

    await Promise.all(items.map(item => crafty.createItem(item)));
    await Promise.all(rules.recipes.map(rec =>
      Promise.all(rec.ingredients.map(ing =>
        crafty.addIngredient(pascalify(rec.result), pascalify(ing.name), ing.amount)
      ))
    ));
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
        return Promise.all(_.range(ing.amount).map(() => crafty.craftItem(pascalify(ing.name), {from: player})));
      }));

      // For each advanced ingredient, get its ingredients, and craft it
      await Promise.all(recipe.ingredients.filter(ing => !isBasic(ing)).map(ing => craft(rules.recipes.filter(rec_ => rec_.result === ing.name)[0])));

      await crafty.craftItem(pascalify(recipe.result), {from: player});
    }

    // Each recipe will be tested with a new contract, to ensure an empty starting inventory
    for (const recipe of rules.recipes) { // eslint-disable-line no-await-in-loop
      await deployCrafty();

      await craft(recipe);

      const result = pascalify(recipe.result);
      const resultAmount = await crafty.getItemAmount(result, {from: player});
      const othersAmount = await Promise.all(items.filter(item => item !== result).map(item => crafty.getItemAmount(item, {from: player})));

      assert(resultAmount.eq(1));
      assert(othersAmount.every(amount => amount.eq(0)));
    }
  });
});
