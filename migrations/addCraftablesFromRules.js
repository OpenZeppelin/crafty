module.exports = async function (crafty, rules) {
  // The owner of the contract is the only one that can add craftables and ingredients
  const owner = await crafty.owner();

  // We could do this in parallel, but that causes truffle migrations to
  // sometimes fail

  // Add all basic craftables
  for (const craftable of rules.basic) { // eslint-disable-line no-await-in-loop
    await crafty.addCraftable(craftable, {from: owner});
  }

  // Add all recipe results
  for (const recipe of rules.recipes) { // eslint-disable-line no-await-in-loop
    await crafty.addCraftable(recipe.result, {from: owner});
    for (const ingredient of recipe.ingredients) { // eslint-disable-line no-await-in-loop
      await crafty.addIngredient(recipe.result, ingredient.name, ingredient.amount, {from: owner});
    }
  }
};
