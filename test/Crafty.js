const _ = require('underscore');
const BigNumber = web3.BigNumber;
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should();

const Crafty = artifacts.require('Crafty');
const CraftableToken = artifacts.require('CraftableToken');

contract('Crafty', accounts => {
  let crafty = null;
  const deployer = accounts[1];
  const admin = accounts[2];
  const player = accounts[3];
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const basicMintedTokens = 100; // Multiple basic tokens are minted on each craft call

  async function addNewCraftable(ingredients, ingredientAmounts, fromAddress) {
    // We don't care about name, symbol or URI
    const receipt = await crafty.addCraftable('', '', '', ingredients, ingredientAmounts, {from: fromAddress});

    receipt.logs.length.should.equal(1);
    receipt.logs[0].event.should.equal('CraftableAdded');

    return CraftableToken.at(receipt.logs[0].args.addr);
  }

  async function addPrecreatedCraftable(ingredients, ingredientAmounts, fromAddress) {
    const token = await CraftableToken.new({from: fromAddress});

    // Ownership is given to the crafty contract. We don't care about name, symbol or URI.
    const callData = encodeCall('initialize', ['address', 'string', 'string', 'string', 'address[]', 'uint256[]'], [crafty.address, '', '', '', ingredients, ingredientAmounts]);
    await token.sendTransaction({data: callData, from: fromAddress});

    const receipt = await crafty.addPrecreatedCraftable(token.address, {from: fromAddress});

    receipt.logs.length.should.equal(1);
    receipt.logs[0].event.should.equal('CraftableAdded');
    receipt.logs[0].args.addr.should.equal(token.address);

    return token;
  }

  beforeEach(async () => {
    crafty = await Crafty.new({from: deployer});

    const callData = encodeCall('initialize', ['address'], [admin]);
    await crafty.sendTransaction({data: callData, from: deployer});
  });

  describe('Crafting', () => {
    it('no default craftables exist', async () => {
      await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(0);
    });

    it('craftables with ingredients can be added by players', async () => {
      const basicCraftable = await addPrecreatedCraftable([], [], admin);

      await addNewCraftable([basicCraftable.address], [1], player);

      await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(2);
    });

    it('players can always craft ingredient-less craftables', async () => {
      const basicCraftable = await addPrecreatedCraftable([], [], admin);

      await basicCraftable.balanceOf(player).should.eventually.be.bignumber.equal(0);

      await crafty.craft(basicCraftable.address, {from: player});

      await basicCraftable.balanceOf(player).should.eventually.be.bignumber.equal(basicMintedTokens);
    });

    it('players cannot craft using ingredients without calling approve', async () => {
      const ingredient = await addPrecreatedCraftable([], [], admin);
      await crafty.craft(ingredient.address, {from: player});
      await ingredient.balanceOf(player).should.eventually.be.bignumber.equal(basicMintedTokens);

      const craftable = await addNewCraftable([ingredient.address], [1], player);

      // craftable requires just one ingredient, so the crafting requirement has been met.
      // However since ingredient has not been approved for crafty to use as an ingredient,
      // the craft call will fail.
      await expectPromiseThrow(crafty.craft(craftable.address, {from: player}));
    });

    it('players can craft using ingredients if approve is called', async () => {
      // First, build a craftable that requires two ingredients
      const ingredients = await Promise.all([
        addPrecreatedCraftable([], [], admin),
        addPrecreatedCraftable([], [], admin)
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

      const craftable = await addNewCraftable(ingredients.map(ingredient => ingredient.address), ingredientAmounts, player);
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

    it('the initial admin is admin', async () => {
      await crafty.hasRole(admin, adminRolename).should.eventually.be.true;
    });

    describe('Roles', () => {
      it('admins can appoint new admins', async () => {
        await crafty.hasRole(player, adminRolename).should.eventually.be.false;

        await crafty.addAdminRole(player, {from: admin});

        await crafty.hasRole(player, adminRolename).should.eventually.be.true;
      });

      it('non-admins cannot appoint new admins', async () => {
        await expectPromiseThrow(crafty.addAdminRole(player, {from: player}));
      });
    });

    describe('Permissions', () => {
      it('admins can create craftables with no ingredients', async () => {
        const craftable = await addPrecreatedCraftable([], [], admin);

        // The craftable will be stored at index 0 (because it is the first craftable)
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(craftable.address);
      });

      it('non-admins cannnot create craftables with no ingredients', async () => {
        await expectPromiseThrow(addPrecreatedCraftable([], [], player));
      });

      it('admins can delete craftables', async () => {
        const craftable = await addPrecreatedCraftable([], [], admin);

        // The craftable will be stored at index 0 (because it is the first craftable)
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(craftable.address);

        await crafty.deleteCraftable(0, {from: admin});

        // The craftable itself is not deleted, but its entry is zeroed-out in the game's storage
        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await crafty.getCraftable(0).should.eventually.equal(ZERO_ADDRESS);
      });

      it('admins cannot delete non-existent craftables', async () => {
        await addPrecreatedCraftable([], [], admin);

        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await expectPromiseThrow(crafty.deleteCraftable(2, {from: admin}));
      });

      it('non-admins cannnot delete craftables', async () => {
        await addPrecreatedCraftable([], [], admin);

        await crafty.getTotalCraftables().should.eventually.be.bignumber.equal(1);
        await expectPromiseThrow(crafty.deleteCraftable(0, {from: player}));
      });
    });
  });
});
