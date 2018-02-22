const fs = require('fs');

describe('Rules', () => {
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));

  describe('Basic items', () => {
    it('exist', () => {
      assert.isAtLeast(rules.basic.length, 1);
    });

    it('are strings', () => {
      rules.basic.forEach(item => {
        assert.typeOf(item, 'string');
      });
    });

    it('are unique', () => {
      rules.basic.forEach(item => {
        assert.strictEqual(rules.basic.filter(item_ => item_ === item).length, 1);
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

    it('results are not basic items', () => {
      rules.recipes.forEach(rec => {
        assert.strictEqual(rules.basic.filter(res => res === rec.result).length, 0);
      });
    });

    it('have ingredients', () => {
      rules.recipes.forEach(rec => {
        assert.isAtLeast(rec.ingredients.length, 1);
      });
    });

    it('results are not ingredients', () => {
      rules.recipes.forEach(rec => {
        assert.strictEqual(rec.ingredients.filter(ing => ing.name === rec.result).length, 0);
      });
    });

    it('ingredients are unique', () => {
      rules.recipes.forEach(rec => {
        rec.ingredients.forEach(ing => {
          assert.strictEqual(rec.ingredients.filter(_ing => _ing.name === ing.name).length , 1);
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
      function isAttainable(item) {
        // An item is attainable if it is a basic item, or the result of a recipe
        // with attainable ingredients

        if (rules.basic.indexOf(item) === -1) {
          return true;

        } else {
          const resultRecipe = rules.recipes.filter(rec => rec.result === item);

          if (resultRecipe.length > 0) {
            assert.strictEqual(resultRecipe.length, 1);
            return resultRecipe[0].ingredients.map(ing => ing.name).every(isAttainable);

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
