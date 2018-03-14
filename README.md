# crafty

[![Build Status](https://travis-ci.org/nventuro/crafty.svg?branch=master)](https://travis-ci.org/nventuro/crafty)

A decentralized token crafting and trading game, running on the Ethereum network.

## Game

The game revolves around the [`Crafty`](https://github.com/nventuro/crafty/blob/master/contracts/Crafty.sol) and [`CraftableToken`](https://github.com/nventuro/crafty/blob/master/contracts/CraftableToken.sol) (craftable) contracts.

`Crafty` is the 'game' contract, and is the one players interact directly with. It allows acquisition of new basic craftables, and mixing of them to create more advanced ones. The game owner has the capability to add new craftables and recipes, but as of now the game is static, and the available craftables and their recipes are described by [the rules file](https://github.com/nventuro/crafty/tree/master/app/rules.json).

The `CraftableToken`s themselves are ERC20 tokens (minus the `name`, `symbol` and `decimals` fields), and can therefore be freely traded among players. These tokens are acquired by interacting with the `Crafty` contract, which has the authority to create new tokens, and destroy them when they are used as recipe ingredients.

Rinkeby and Ropsten deployed `Crafty` contracts can be interacted with [from here](https://nventuro.github.io/crafty/).

## Ideas

### Recipe voting
The `Crafty` owner can not only add new tokens after deploying the contract, but also new recipes. Ownership of `Crafty` could be transferred to a second smart contract, in charge of carrying out a voting process, in which players can propose new craftables and their recipes. The craftable tokens themselves could be used to vote, in order to prevent spam and prove a stake in the game.

### Time-throttled craftable generation + bundles
As of now, all that's required to obtain a craftable token is to request one. This mechanism could be modified so that only a certain number of craftables can be requested for free per time period (say, every 6 hours). Then, the option to buy bundles of random craftable tokens (using Ether) could be added. All of this Ether acquired by `Crafty` would be stored in a pot, which is gifted to whomever crafts the item at the top of the recipe tree. The pot amount would be made public and shown on the dApp, and events would be sent every time there's a winner.

This idea requires a known 'winning' item to exist, so either the recipe tree would have to be static, or the dynamic craftable and recipe addition mechanism would have to be more complex to always ensure this condition.

## Dependencies
- [npm](https://www.npmjs.com/): v5.6.0.

You can check if the dependencies are installed correctly by running the following command:

```
$ npm --version
5.6.0
```

## Build and Test
After installing the dependencies previously mentioned, clone the project repository and enter the root directory:

```
$ git clone https://github.com/nventuro/crafty.git
$ cd crafty
```

Next, build the project dependencies:

`$ npm install`

To make sure everything is set up correctly, the tests should be run:

`$ npm test`

## Deployment
First, a game contract needs to be deployed to an Ethereum network for the dApp to be able to interact with it. Using a local blockchain is recommended during development, since deployment is faster, allowing for faster iterations, though some aspects of its behavior are quite different from the real thing (both the testnets and mainnet).

### Local
First, the local blockchain needs to be started. We use [Ganache CLI](https://github.com/trufflesuite/ganache-cli) for this, running on a separate terminal:

`$ npx ganache-cli`

Ganache will print the mnemonic used to generate the first 10 addresses on the network, all of which will start with a hefty amount of Ether. Make sure to store this mnemonic, since it will be later needed by your Ethereum browser to use these addresses.

Once the local blockchain is up and running, the contracts should be deployed using [`truffle migrate`](http://truffleframework.com/docs/getting_started/migrations):

`$ npx truffle migrate --network local`

If the deployment is successful, Truffle will print the address of the deployed `Crafty` contract, which will be used by the dApp to interact with it. The first address produced by Ganache is the one used to deploy the `Crafty` contract, making it the contract owner, so keep this in mind if you intend to use any of the owner-related functionality.

### Testnet
Deployment on a testnet is a bit more involved, since it requires two extra steps:

1. Acquiring Ether. There are faucets for both [Rinkeby](https://faucet.rinkeby.io/) and [Ropsten](https://faucet.metamask.io): use these to have some Ether transfered to your account.
2. Connecting to a network node. To do this, we will use [INFURA](https://infura.io/): sign up on their website to obtain an API key.

Once both steps are complete, a `.env` file needs to be created on the root directory, containing both the INFURA API key and the 12-word mnemonic associated with the Ethereum account. [`env.sample`](https://github.com/nventuro/crafty/blob/master/env.sample) shows an example on how to do this. *DO NOT COMMIT OR SHARE THE `.env` FILE.*

After storing the configuration, the migration can be carried out, in the same manner as in the local case. Note that this process will take much longer than a local deployment.

`$ npx truffle migrate --network rinkeby`

### Front-end
The dApp has no back-end: all the front-end needs is to connect to a deployed `Crafty` contract. Because of this, deploying it is very simple.

First, the contract artifacts need be moved to the `app` directory, and the JavaScript sources bundled, etc. A single command takes care of this:

`$ npm run build`

Then, the address of the deployed `Crafty` contracts need to be added to [`app/contract-addresses.json`](https://github.com/nventuro/crafty/tree/master/app/contract-addresses.json) under their respective network id. For a local blockchain, use `'unknown'`.

Finally, all that's needed is to launch an HTTP server and have it serve the `app` directory. To test it locally, the easiest way is using [Python's SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html):

```
$ cd app
$ python -m SimpleHTTPServer
```

`SimpleHTTPServer` will then be reachable at `localhost:8000`.
