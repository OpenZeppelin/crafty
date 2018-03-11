module.exports = async function (crafty, rules) {
  // The owner of the contract is the only one that can add craftables and ingredients
  const owner = await crafty.owner();

  // Add all craftables and their ingredients. This assumes the reules are laid
  // out in order (i.e., no craftable appears before any of its ingredients)

  for (const craftable of rules.craftables) { // eslint-disable-line no-await-in-loop
    await crafty.addCraftable(craftable.name, {from: owner});
    for (const ingredient of craftable.ingredients) { // eslint-disable-line no-await-in-loop
      await crafty.addIngredient(craftable.name, ingredient.name, ingredient.amount, {from: owner});
    }
  }
};
