const _ = require('underscore');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const CraftableToken = artifacts.require('CraftableToken');

contract('CraftableToken', accounts => {
  const deployer = accounts[0];
  const players = accounts.slice(1, accounts.length);
  const name = 'CraftableTest';
  const symbol = 'CRFT';
  const tokenURI = 'http://hosting.com/CraftableToken.json';

  function newCraftable(ingredients = [], ingredientAmounts = []) {
    return CraftableToken.new(name, symbol, tokenURI, ingredients, ingredientAmounts, {from: deployer});
  }

  it('metadata is stored', async () => {
    const craftable = await newCraftable();

    await craftable.name().should.eventually.equal(name);
    await craftable.symbol().should.eventually.equal(symbol);
    await craftable.decimals().should.eventually.be.bignumber.equal(0);
    await craftable.tokenURI().should.eventually.equal(tokenURI);
  });

  it('all initial balance is held by the deployer', async () => {
    const craftable = await newCraftable();

    await craftable.balanceOf(deployer).should.eventually.be.bignumber.equal(await craftable.totalSupply());
    await Promise.all(players.map(player =>
      craftable.balanceOf(player).should.eventually.be.bignumber.equal(0)
    ));
  });

  describe('Ingredients', () => {
    it('craftables can have no ingredients', async () => {
      const craftable = await newCraftable();
      await craftable.getTotalRecipeSteps().should.eventually.be.bignumber.equal(0);
    });

    it('all ingredients can be retrieved', async () => {
      const ingredientA = await newCraftable();
      const ingredientB = await newCraftable();

      const ingredients = [ingredientA.address, ingredientB.address];
      const amounts = [2, 4];

      const craftable = await newCraftable(ingredients, amounts);

      await craftable.getTotalRecipeSteps().should.eventually.be.bignumber.equal(2);

      _.range(2).forEach(async i => {
        const [ingredient, amount] = await craftable.getRecipeStep(i);
        ingredient.should.be.bignumber.equal(ingredients[i]);
        amount.should.be.bignumber.equal(amounts[i]);
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
