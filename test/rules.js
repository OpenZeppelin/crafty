const fs = require('fs');

describe('Rules', () => {
  const rules = JSON.parse(fs.readFileSync('./app/rules.json', 'utf8'));

  describe('Craftables', () => {
    it('exist', () => {
      assert.isAtLeast(rules.craftables.length, 1);
    });

    it('have string names', () => {
      rules.craftables.forEach(craftable => {
        assert.property(craftable, 'name');
        assert.typeOf(craftable.name, 'string');
      });
    });

    it('names are unique', () => {
      rules.craftables.forEach(craftable => {
        assert.lengthOf(rules.craftables.filter(_craftable => _craftable.name === craftable.name), 1);
      });
    });

    it('have a list of ingredients', () => {
      rules.craftables.forEach(craftable => {
        assert.property(craftable, 'ingredients');
        assert.instanceOf(craftable.ingredients, Array);
      });
    });

    it('ingredients have a string name and natural number amount', () => {
      rules.craftables.forEach(craftable => {
        craftable.ingredients.forEach(ingredient => {
          assert.property(ingredient, 'name');
          assert.typeOf(ingredient.name, 'string');

          assert.property(ingredient, 'amount');
          assert.typeOf(ingredient.amount, 'number');
          assert.isAtLeast(ingredient.amount, 1);
        });
      });
    });

    it('ingredient names are unique', () => {
      rules.craftables.forEach(craftable => {
        craftable.ingredients.forEach(ingredient => {
          assert.lengthOf(craftable.ingredients.filter(_ingredient => _ingredient.name === ingredient.name), 1);
        });
      });
    });

    it('are not their own ingredient', () => {
      rules.craftables.forEach(craftable => {
        assert.lengthOf(craftable.ingredients.filter(ingredient => ingredient.name === craftable.name), 0);
      });
    });

    it('results are attainable', () => {
      function assertAttainable(craftable) {
        // A craftable is attainable if it has no ingredients, or if all if its
        // ingredients are attainable

        if (craftable.ingredients.length === 0) {
          return;

        } else {
          const ingredientCraftables = craftable.ingredients.map(ingredient => rules.craftables.filter(_craftable => _craftable.name === ingredient.name));
          ingredientCraftables.forEach(ingredientCraftable => {
            assert.lengthOf(ingredientCraftable, 1);
            assertAttainable(ingredientCraftable[0]);
          });
        }
      }

      rules.craftables.forEach(craftable => {
        assertAttainable(craftable);
      });
    });
  });
});
