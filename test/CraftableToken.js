const _ = require('underscore');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const CraftableToken = artifacts.require('CraftableToken');

contract('CraftableToken', accounts => {
  const deployer = accounts[0];
  const players = accounts.slice(1, accounts.length);

  function newCraftable(ingredients = [], ingredientAmounts = []) {
    return CraftableToken.new(ingredients, ingredientAmounts, {from: deployer});
  }

  it('all initial balance is held by the deployer', async () => {
    const craftable = await newCraftable();

    const deployerBalance = await craftable.balanceOf(deployer);
    const playersBalances = await Promise.all(players.map(player => craftable.balanceOf(player)));
    const totalSupply = await craftable.totalSupply();

    assert(deployerBalance.eq(totalSupply));
    assert(playersBalances.every(balance => balance.eq(0)));
  });

  describe('Ingredients', () => {
    it('craftables can have no ingredients', async () => {
      const craftable = await newCraftable();
      const recipeSteps = await craftable.getTotalRecipeSteps();
      assert.equal(recipeSteps, 0);
    });

    it('all ingredients can be retrieved', async () => {
      const ingredientA = await newCraftable();
      const ingredientB = await newCraftable();

      const ingredients = [ingredientA.address, ingredientB.address];
      const amounts = [2, 4];

      const craftable = await newCraftable(ingredients, amounts);

      const recipeSteps = await craftable.getTotalRecipeSteps();
      assert(recipeSteps.eq(2));

      _.range(2).forEach(async i => {
        const [ingredient, amount] = await craftable.getRecipeStep(i);
        assert.equal(ingredient, ingredients[i]);
        assert(amount.eq(amounts[i]));
      });
    });

    it('ingredient amounts must be non-zero', async () => {
      const ingredientA = await newCraftable();
      const ingredientB = await newCraftable();

      const ingredients = [ingredientA.address, ingredientB.address];
      const amounts = [0, 4];

      await expectPromiseThrow(newCraftable(ingredients, amounts));
    });

    it('an amount must be specified for each ingredient', async () => {
      const ingredientA = await newCraftable();
      const ingredientB = await newCraftable();

      await expectPromiseThrow(newCraftable([ingredientA.address, ingredientB.address], [2]));
      await expectPromiseThrow(newCraftable([ingredientA.address], [2, 3]));
    });
  });
});
