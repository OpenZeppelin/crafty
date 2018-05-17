const _ = require('underscore');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const CraftableToken = artifacts.require('CraftableToken');

contract('CraftableToken', accounts => {
  const deployer = accounts[0];
  const players = accounts.slice(1, accounts.length);
  const name = 'CraftableTest';
  const symbol = 'CRFT';
  const tokenURI = 'http://hosting.com/CraftableToken.json';

  function newCraftable(fromAddress, ingredients = [], ingredientAmounts = []) {
    return CraftableToken.new(name, symbol, tokenURI, ingredients, ingredientAmounts, {from: fromAddress});
  }

  it('creator is stored', async () => {
    // Doing this using await Promise.all(accounts.map) fails: the same address is
    // assigned to some contracts. We suspect this may be due to a bug in ganache-cli.
    for (let address of accounts) { // eslint-disable-line no-await-in-loop
      const craftable = await newCraftable(address);
      await craftable.creator().should.eventually.equal(address);
    }
  });

  it('metadata is stored', async () => {
    const craftable = await newCraftable(deployer);

    await craftable.name().should.eventually.equal(name);
    await craftable.symbol().should.eventually.equal(symbol);
    await craftable.decimals().should.eventually.be.bignumber.equal(0);
    await craftable.tokenURI().should.eventually.equal(tokenURI);
  });

  it('all players start with no balance', async () => {
    const craftable = await newCraftable(deployer);

    await Promise.all(players.map(player =>
      craftable.balanceOf(player).should.eventually.be.bignumber.equal(0)
    ));

    await craftable.totalSupply().should.eventually.be.bignumber.equal(0);
  });

  describe('Ingredients', () => {
    it('craftables can have no ingredients', async () => {
      const craftable = await newCraftable(deployer);
      await craftable.getTotalRecipeSteps().should.eventually.be.bignumber.equal(0);
    });

    it('all ingredients can be retrieved', async () => {
      const ingredientA = await newCraftable(deployer);
      const ingredientB = await newCraftable(deployer);

      const ingredients = [ingredientA.address, ingredientB.address];
      const amounts = [2, 4];

      const craftable = await newCraftable(deployer, ingredients, amounts);

      await craftable.getTotalRecipeSteps().should.eventually.be.bignumber.equal(2);

      await Promise.all(_.range(2).map(async i => {
        const [ingredient, amount] = await craftable.getRecipeStep(i);
        ingredient.should.be.bignumber.equal(ingredients[i]);
        amount.should.be.bignumber.equal(amounts[i]);
      }));
    });

    it('ingredient amounts must be non-zero', async () => {
      const ingredientA = await newCraftable(deployer);
      const ingredientB = await newCraftable(deployer);

      const ingredients = [ingredientA.address, ingredientB.address];
      const amounts = [0, 4];

      await expectPromiseThrow(newCraftable(deployer, ingredients, amounts));
    });

    it('an amount must be specified for each ingredient', async () => {
      const ingredientA = await newCraftable(deployer);
      const ingredientB = await newCraftable(deployer);

      await expectPromiseThrow(newCraftable(deployer, [ingredientA.address, ingredientB.address], [2]));
      await expectPromiseThrow(newCraftable(deployer, [ingredientA.address], [2, 3]));
    });

    it('ingredients cannot be repeated', async () => {
      const ingredient = await newCraftable(deployer);

      await expectPromiseThrow(newCraftable(deployer, [ingredient.address, ingredient.address], [2, 3]));
    });
  });
});
