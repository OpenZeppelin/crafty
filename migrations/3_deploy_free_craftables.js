const axios = require('axios');
const capitalize = require('capitalize');
const fs = require('fs');
const unvowel = require('unvowel');

const Crafty = artifacts.require('Crafty');

const API = 'https://wrbirbjyzf.execute-api.us-east-2.amazonaws.com/api/crafty';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function (deployer) {
  const crafty = await Crafty.deployed();

  const emojis = JSON.parse(fs.readFileSync('migrations/assets/emoji-tokens.json', 'utf8'));

  for (let emoji of emojis) {
    const picture = fs.readFileSync(`migrations/assets/${emoji.picture}`)
    const imageResponse = await axios.post(`${API}/thumbnail`, {'image-base64': picture.toString('base64')});
    if (imageResponse.status != 200) {
      throw new Error();
    }

    const rawName = emoji.picture.split(/\./)[0]; // Filename, minus extension
    const name = capitalize(rawName);
    const symbol = `EMJ-${unvowel.parse(rawName).toUpperCase()}`;

    const metadataResponse = await axios.post(`${API}/metadata`, {
      'name': name,
      'description': emoji.description,
      'image': imageResponse.data
    })

    if (metadataResponse.status != 200) {
      throw new Error();
    }

    console.log(`Deploying ${symbol}`);
    await crafty.addCraftable(name, symbol, metadataResponse.data, [], []);

    // The API is throttled, so we need to sleep to prevent the deployment from going over that limit
    await sleep(500);
  }
};
