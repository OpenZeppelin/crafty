module.exports = async function (crafty, rules) {
  // The owner of the contract is the only one that can add craftables and ingredients
  const owner = await crafty.owner();

  // Add all basic craftables
  await Promise.all(rules.basic.map(craftable => crafty.addCraftable(craftable, {from: owner})));

  // Add all recipe results
  await Promise.all(rules.recipes.map(rec => crafty.addCraftable(rec.result, {from: owner})));

  // Add all ingredients of each recipe
  await Promise.all(rules.recipes.map(rec =>
    Promise.all(rec.ingredients.map(ing =>
      crafty.addIngredient(rec.result, ing.name, ing.amount, {from: owner})
    ))
  ));
};
