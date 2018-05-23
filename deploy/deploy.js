const argv = require('minimist')(process.argv.slice(2));
const network = argv['network'];

const Crafty = artifacts.require('Crafty');
const DetailedMintableToken = artifacts.require('DetailedMintableToken');

const encodeCall = require('zos-lib/lib/helpers/encodeCall').default;

const axios = require('axios');
const capitalize = require('capitalize');
const colors = require('colors/safe');
const fs = require('fs');
const shell = require('shelljs');
const unvowel = require('unvowel');

const API = 'https://wrbirbjyzf.execute-api.us-east-2.amazonaws.com/api/crafty';

const adminAddress = web3.eth.accounts[1];

const canonicals = [
  {
    name: 'Aragon',
    symbol: 'ANT',
    decimals: 18
  }, {
    name: 'Augur',
    symbol: 'REP',
    decimals: 18
  }, {
    name: '0x',
    symbol: 'ZRX',
    decimals: 18
  }, {
    name: 'Decentraland',
    symbol: 'MANA',
    decimals: 18
  }
];

async function deploy() {
  console.log(`Deploying to network '${network}'`);

  console.log('- Deploying new contract implementations');
  exec(`zos push --network ${network}`);

  const crafty = deployCrafty();

  if (network !== 'mainnet') {
    await deployCanonicals();
  }

  await deployEmojis(crafty);

  console.log('Deployment successful!');
}

function deployCrafty() {
  console.log('- Deploying Crafty');

  // We create a proxy to the deployed crafty implementation
  exec(`zos create Crafty --init initialize --args "${adminAddress}" --network ${network}`);

  // We need to retrieve the address of the created proxy from the zos.[network].json file
  const packageData = JSON.parse(fs.readFileSync(`zos.${network}.json`, 'utf8'));
  const craftyProxies = packageData.proxies.Crafty;
  const crafty = Crafty.at(craftyProxies[craftyProxies.length - 1].address);

  console.log(`Crafty: ${crafty.address}`);
  console.log(`Admin: ${adminAddress}`);

  return crafty;
}

async function deployCanonicals() {
  console.log('- Deploying canonicals');

  for (let canonical of canonicals) { // eslint-disable-line no-await-in-loop
    const token = await DetailedMintableToken.new();
    const callData = encodeCall('initialize', ['address', 'string', 'string', 'uint8'], [adminAddress, canonical.name, canonical.symbol, canonical.decimals]);
    await token.sendTransaction({data: callData});
    console.log(`${canonical.name} (${canonical.symbol}): ${token.address}`);
  }
}

async function deployEmojis(crafty) {
  console.log('- Deploying emojis');

  const emojis = JSON.parse(fs.readFileSync('deploy/assets/emoji-tokens.json', 'utf8'));

  for (let emoji of emojis) { // eslint-disable-line no-await-in-loop
    const picture = fs.readFileSync(`deploy/assets/${emoji.picture}`);
    const imageResponse = await axios.post(`${API}/thumbnail`, {'image-base64': picture.toString('base64')});
    if (imageResponse.status !== 200) {
      throw new Error();
    }

    const rawName = emoji.picture.split(/\./)[0]; // Filename, minus extension
    const name = capitalize(rawName);
    const symbol = `EMJ-${unvowel.parse(rawName).toUpperCase()}`;

    const metadataResponse = await axios.post(`${API}/metadata`, {
      'name': name,
      'description': emoji.description,
      'image': imageResponse.data
    });

    if (metadataResponse.status !== 200) {
      throw new Error();
    }

    const address = exec(`zos create CraftableToken --init initialize --args ${crafty.address},\\"${name}\\",\\"${symbol}\\",\\"${metadataResponse.data}\\",[],[] --network ${network}`).trim();
    await crafty.addPrecreatedCraftable(address, {from: adminAddress});

    console.log(`${name} (${symbol}): ${address}`);

    // The API is throttled, so we need to sleep to prevent the deployment from going over that limit
    await sleep(500);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function exec(cmd) {
  console.log(colors.green(`${cmd}`));
  return shell.exec(cmd, {silent: true}).stdout;
}

module.exports = function (cb) {
  deploy().then(cb).catch(cb);
};
