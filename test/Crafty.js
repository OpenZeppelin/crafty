const _ = require('underscore');
const BigNumber = web3.BigNumber;
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

const Crafty = artifacts.require('Crafty');
const CraftableToken = artifacts.require('CraftableToken');

contract('Crafty', accounts => {
  let crafty = null;
  const deployer = accounts[0];
  const player = accounts[1];
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const basicMintedTokens = 100; // Multiple basic tokens are minted on each craft call

  async function getNewCraftable(ingredients, ingredientAmounts, fromAccount) {
    // We don't care about name, symbol or URI

    const receipt = await crafty.addCraftable('', '', '', ingredients, ingredientAmounts, {from: fromAccount});

    receipt.logs.length.should.equal(1);
    receipt.logs[0].event.should.equal('CraftableAdded');

    return CraftableToken.at(receipt.logs[0].args.addr);
  }

  beforeEach(async () => {
    crafty = await Crafty.new({from: deployer});
  });

  describe('Crafting', () => {
    it('no default craftables exist', async () => {
      await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(0);
    });

    it('craftables can be added by players', async () => {
      const basicCraftable = await getNewCraftable([], [], deployer);

      await getNewCraftable([basicCraftable.address], [1], player);

      await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(2);
    });

    it('players can always craft ingredient-less craftables', async () => {
      const basicCraftable = await getNewCraftable([], [], deployer);

      await basicCraftable.balanceOf(player).should.eventually.be.bignumber.equal(0);

      await crafty.craft(basicCraftable.address, {from: player});

      await basicCraftable.balanceOf(player).should.eventually.be.bignumber.equal(basicMintedTokens);
    });

    it('players cannot craft using ingredients without calling approve', async () => {
      const ingredient = await getNewCraftable([], [], deployer);
      await crafty.craft(ingredient.address, {from: player});
      await ingredient.balanceOf(player).should.eventually.be.bignumber.equal(basicMintedTokens);

      const craftable = await getNewCraftable([ingredient.address], [1], player);

      // craftable requires just one ingredient, so the crafting requirement has been met.
      // However since ingredient has not been approved for crafty to use as an ingredient,
      // the craft call will fail.
      await expectPromiseThrow(crafty.craft(craftable.address, {from: player}));
    });

    it('players can craft using ingredients if approve is called', async () => {
      // First, build a craftable that requires two ingredients
      const ingredients = await Promise.all([
        getNewCraftable([], [], deployer),
        getNewCraftable([], [], deployer)
      ]);
      const ingredientAmounts = [2, 3];
      ingredients.length.should.equal(ingredientAmounts.length);

      // Craft all ingredients - because each craft call mints multiple basic craftables,
      // there's no need to call it multiple times
      await Promise.all(ingredients.map(ingredient =>
        crafty.craft(ingredient.address, {from: player})
      ));

      // Check the balance of the ingredients has been updated
      const balances = await Promise.all(_.range(ingredients.length).map(i =>
        ingredients[i].balanceOf(player).then(balance => {
          return {required: ingredientAmounts[i], actual: balance};
        })
      ));

      balances.forEach(balance => {
        balance.actual.should.be.bignumber.equal(basicMintedTokens);
        balance.actual.should.be.bignumber.at.least(balance.required);
      });

      // Approve each token to be used by the game
      await Promise.all(ingredients.map(ingredient =>
        ingredient.approve(crafty.address, 100, {from: player})
      ));

      const craftable = await getNewCraftable(ingredients.map(ingredient => ingredient.address), ingredientAmounts, player);
      await crafty.craft(craftable.address, {from: player});

      await craftable.balanceOf(player).should.eventually.be.bignumber.equal(1);

      // Check the ingredients were consumed
      await Promise.all(_.range(ingredients.length).map(async i =>
        ingredients[i].balanceOf(player).should.eventually.be.bignumber.equal(basicMintedTokens - ingredientAmounts[i])
      ));
    });
  });

  describe('RBAC', () => {
    let adminRolename = '';

    before(async () => {
      adminRolename = await crafty.ROLE_ADMIN();
    });

    it('deployer is admin', async () => {
      await crafty.hasRole(deployer, adminRolename).should.eventually.be.true;
    });

    describe('Roles', () => {
      it('admins can appoint new admins', async () => {
        await crafty.hasRole(player, adminRolename).should.eventually.be.false;

        await crafty.addAdminRole(player, {from: deployer});

        await crafty.hasRole(player, adminRolename).should.eventually.be.true;
      });

      it('non-admins cannot appoint new admins', async () => {
        await expectPromiseThrow(crafty.addAdminRole(player, {from: player}));
      });
    });

    describe('Permissions', () => {
      it('admins can create basic craftables', async () => {
        const craftable = await getNewCraftable([], [], deployer);

        // The craftable will be stored at index 0 (because it is the first craftable)
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(craftable.address);
      });

      it('non-admins cannnot create basic craftables', async () => {
        await expectPromiseThrow(getNewCraftable([], [], player));
      });

      it('admins can delete craftables', async () => {
        const craftable = await getNewCraftable([], [], deployer);

        // The craftable will be stored at index 0 (because it is the first craftable)
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(craftable.address);

        await crafty.deleteCraftable(craftable.address, {from: deployer});

        // The craftable itself is not deleted, but its entry is zeroed-out in the game's storage
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(ZERO_ADDRESS);
      });

      it('non-admins cannnot delete craftables', async () => {
        const craftable = await getNewCraftable([], [], deployer);
        await expectPromiseThrow(crafty.deleteCraftable(craftable.address, {from: player}));
      });
    });
  });
});
