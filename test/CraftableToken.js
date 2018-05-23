const _ = require('underscore');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

const CraftableToken = artifacts.require('CraftableToken');

contract('CraftableToken', accounts => {
  const deployer = accounts[0];
  const players = accounts.slice(1, accounts.length);
  const name = 'CraftableTest';
  const symbol = 'CRFT';
  const tokenURI = 'http://hosting.com/CraftableToken.json';

  async function newCraftable(ingredients = [], ingredientAmounts = []) {
    const token = await CraftableToken.new({from: deployer});

    const callData = encodeCall('initialize', ['address', 'string', 'string', 'string', 'address[]', 'uint256[]'], [deployer, name, symbol, tokenURI, ingredients, ingredientAmounts]);
    await token.sendTransaction({data: callData, from: deployer});

    return token;
  }

  it('metadata is stored', async () => {
    const craftable = await newCraftable();

    await craftable.name().should.eventually.equal(name);
    await craftable.symbol().should.eventually.equal(symbol);
    await craftable.decimals().should.eventually.be.bignumber.equal(0);
    await craftable.tokenURI().should.eventually.equal(tokenURI);
  });

  it('all players start with no balance', async () => {
    const craftable = await newCraftable();

    await Promise.all(players.map(player =>
      craftable.balanceOf(player).should.eventually.be.bignumber.equal(0)
    ));

    await craftable.totalSupply().should.eventually.be.bignumber.equal(0);
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

      await Promise.all(_.range(2).map(async i => {
        const [ingredient, amount] = await craftable.getRecipeStep(i);
        ingredient.should.be.bignumber.equal(ingredients[i]);
        amount.should.be.bignumber.equal(amounts[i]);
      }));
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

    it('ingredients cannot be repeated', async () => {
      const ingredient = await newCraftable();

      await expectPromiseThrow(newCraftable([ingredient.address, ingredient.address], [2, 3]));
    });
  });
});
