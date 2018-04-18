const _ = require('underscore');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const Crafty = artifacts.require('Crafty');
const CraftableToken = artifacts.require('CraftableToken');

contract('Crafty', accounts => {
  let crafty = null;
  const owner = accounts[0];
  const player = accounts[1];

  async function getCraftableFromAddTX(tx) {
    const receipt = await tx;

    assert.equal(receipt.logs.length, 1);
    assert.equal(receipt.logs[0].event, 'CraftableAdded');

    return CraftableToken.at(receipt.logs[0].args.addr);
  }

  beforeEach(async () => {
    crafty = await Crafty.new({from: owner});
  });

  describe('Crafting', () => {
    it('no default craftables exist', async () => {
      const totalCraftables = await crafty.getTotalCraftables();
      assert.equal(totalCraftables, 0);
    });

    it('craftables can be added by players', async () => {
      await crafty.addCraftable([], [], {from: player});

      const totalCraftables = await crafty.getTotalCraftables();
      assert.equal(totalCraftables, 1);
    });

    it('players can always craft ingredient-less craftables', async () => {
      const craftable = await getCraftableFromAddTX(crafty.addCraftable([], []));

      const initialBalance = await craftable.balanceOf(player);
      assert(initialBalance.eq(0));

      await crafty.craft(craftable.address, {from: player});

      const finalBalance = await craftable.balanceOf(player);
      assert(finalBalance.eq(1));
    });

    it('players cannot craft using ingredients without calling approve', async () => {
      const ingredient = await getCraftableFromAddTX(crafty.addCraftable([], []));
      await crafty.craft(ingredient.address, {from: player});

      const ingredientBalance = await ingredient.balanceOf(player);
      assert(ingredientBalance.eq(1));

      const craftable = await getCraftableFromAddTX(crafty.addCraftable([ingredient.address], [1]));

      // craftable requires just one ingredient, so the crafting requirement has been met,
      // but since ingredient has not been approved for crafty to use as an ingredient,
      // the craft call will fail.
      expectPromiseThrow(crafty.craft(craftable.address, {from: player}));
    });

    it('players can craft using ingredients if approve is called', async () => {
      // First, build a craftable that requires two ingredients
      const ingredients = await Promise.all([
        getCraftableFromAddTX(crafty.addCraftable([], [])),
        getCraftableFromAddTX(crafty.addCraftable([], []))
      ]);
      const ingredientAmounts = [2, 3];
      assert.equal(ingredients.length, ingredientAmounts.length);

      // Craft all ingredients
      await Promise.all(_.range(ingredients.length).map(i =>
        Promise.all(_.times(ingredientAmounts[i], () =>
          crafty.craft(ingredients[i].address, {from: player})
        ))
      ));

      // Check the balance of the ingredients has been updated
      await Promise.all(_.range(ingredients.length).map(async i => {
        const balance = await ingredients[i].balanceOf(player);
        assert(balance.eq(ingredientAmounts[i]));
      }));

      // Approve each token to be used by the game
      await Promise.all(ingredients.map(ingredient =>
        ingredient.approve(crafty.address, 100, {from: player})
      ));

      const craftable = await getCraftableFromAddTX(crafty.addCraftable(ingredients.map(ingredient => ingredient.address), ingredientAmounts));
      await crafty.craft(craftable.address, {from: player});

      const craftableBalance = await craftable.balanceOf(player);
      assert(craftableBalance.eq(1));

      // Check the ingredients were consumed
      await Promise.all(_.range(ingredients.length).map(async i => {
        const balance = await ingredients[i].balanceOf(player);
        assert(balance.eq(0));
      }));
    });
  });
});
