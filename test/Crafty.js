const _ = require('underscore');
const fs = require('fs');
const expectPromiseThrow = require('./helpers/expectPromiseThrow');

const Crafty = artifacts.require('Crafty');

contract('Crafty', accounts => {
  let crafty = null;
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));
  const player = accounts[0];

  describe('Rules', () => {
    describe('Resources', () => {
      it('exist', () => {
        assert.isAtLeast(rules.resources.length, 1);
      });

      it('are strings', () => {
        rules.resources.forEach(res => {
          assert.typeOf(res, 'string');
        });
      });

      it('are unique', () => {
        rules.resources.forEach(res => {
          assert.strictEqual(rules.resources.filter(res_ => res_ === res).length, 1);
        });
      });
    });

    describe('Recipes', () => {
      it('exist', () => {
        assert.isAtLeast(rules.recipes.length, 1);
      });

      it('results are strings', () => {
        rules.recipes.forEach(rec => {
          assert.typeOf(rec.result, 'string');
        });
      });

      // Multiple recipes for the same result (different ingredients) could be later added
      it('results are unique', () => {
        rules.recipes.forEach(rec => {
          assert.strictEqual(rules.recipes.filter(rec_ => rec_.result === rec.result).length, 1);
        });
      });

      it('results are not resources', () => {
        rules.recipes.forEach(rec => {
          assert.strictEqual(rules.resources.filter(res => res === rec.result).length, 0);
        });
      });

      it('have ingredients', () => {
        rules.recipes.forEach(rec => {
          assert.isAtLeast(rec.ingredients.length, 1);
        });
      });

      it('results are not ingredients', () => {
        rules.recipes.forEach(rec => {
          assert.strictEqual(rec.ingredients.filter(ing => ing.resource === rec.result).length, 0);
        });
      });

      it('ingredients are unique', () => {
        rules.recipes.forEach(rec => {
          rec.ingredients.forEach(ing => {
            assert.strictEqual(rec.ingredients.filter(_ing => _ing.resource === ing.resource).length , 1);
          });
        });
      });

      it('ingredient amounts are natural numbers', () => {
        rules.recipes.forEach(rec => {
          rec.ingredients.forEach(ing => {
            assert.isTrue(Number.isInteger(ing.amount) && ing.amount > 0);
          });
        });
      });

      it('results are attainable', () => {
        function isAttainable(res_) {
          // A resource is attainable if it is a basic resource, or the result of a recipe
          // with attainable ingredients

          if (rules.resources.indexOf(res_) === -1) {
            return true;

          } else {
            const resultRecipe = rules.recipes.filter(rec_ => rec_.result === res_);

            if (resultRecipe.length > 0) {
              assert.strictEqual(resultRecipe.length, 1);
              return resultRecipe[0].ingredients.map(_ing => _ing.resource).every(isAttainable);

            } else {
              return false;
            }
          }
        }

        rules.recipes.forEach(rec => {
          assert.isTrue(isAttainable(rec.result));
        });
      });
    });
  });

  describe('Contract', () => {
    beforeEach(async () => {
      crafty = await Crafty.new();
    });

    it('player starts with no resources', async () => {
      const resources = await crafty.resourcesOf(player, rules.resources[0]);
      assert(resources.eq(0));
    });

    it('resources increase by acquiring them', async () => {
      await crafty.getResource(rules.resources[0]);

      const balance = await crafty.resourcesOf(player, rules.resources[0]);
      assert(balance.eq(1));
    });

    it('resources can be acquired multiple times', async () => {
      Promise.all(_.range(5).map(() => {
        crafty.getResource(rules.resources[0]);
      }));

      const balance = await crafty.resourcesOf(player, rules.resources[0]);
      assert(balance.eq(5));
    });

    it('multiple resource types can be acquired', async () => {
      await Promise.all(rules.resources.map(res => crafty.getResource(res)));

      const balances = await Promise.all(rules.resources.map(res => crafty.resourcesOf(player, res)));
      balances.forEach(balance => {
        assert(balance.eq(1));
      });
    });

    it('invalid resources cannot be aquired', async () => {
      await expectPromiseThrow(crafty.getResource(''));
    });
  });
});
