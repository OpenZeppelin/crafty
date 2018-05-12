# crafty

[![Build Status](https://travis-ci.org/zeppelinos/crafty.svg?branch=master)](https://travis-ci.org/zeppelinos/crafty)

A decentralized token crafting and trading game, running on the Ethereum network.

## Game

The game revolves around the [`Crafty`](https://github.com/zeppelinos/crafty/blob/master/contracts/Crafty.sol) and [`CraftableToken`](https://github.com/zeppelinos/crafty/blob/master/contracts/CraftableToken.sol) contracts.

`Crafty` is the 'game' contract, and is the one players interact directly with. It allows acquisition of basic craftables to use as ingredients, creation of new craftables with recipes, and crafting of said community-created recipes.

The `CraftableToken`s themselves are ERC20 tokens, and can therefore be freely traded among players. These tokens are acquired by interacting with the `Crafty` contract, which has the ability to mint them.

## Dependencies
- [npm](https://www.npmjs.com/): v5.8.0.

You can check if the dependencies are installed correctly by running the following command:

```
$ npm --version
5.8.0
```

## Build and Test
After installing the dependencies previously mentioned, clone the project repository and enter the root directory:

```
$ git clone https://github.com/zeppelinos/crafty.git
$ cd crafty
```

Next, build the project dependencies:

`$ npm install`

To make sure everything is set up correctly, the tests should be run:

`$ npm test`

## Setup
First, a game contract needs to be deployed to an Ethereum network for the dApp to be able to interact with it. Using a local blockchain is recommended during development, since deployment is faster, allowing for faster iterations, though some aspects of its behavior are quite different from the real thing (both the testnets and mainnet). Both local blockchains and testnets, however, require some setup.

### Local
We use [Ganache CLI](https://github.com/trufflesuite/ganache-cli) to run the local blockchain, by executing (on a separate terminal):

`$ npx ganache-cli`

Ganache will print the mnemonic used to generate the first 10 addresses on the network, all of which will start with a hefty amount of Ether. Make sure to store this mnemonic, since it will be later needed by your Ethereum browser to use these addresses.

### Testnet
Setting up a testnet is a bit more involved, since it requires two steps:

1. Acquiring Ether. There are faucets for both [Ropsten](https://faucet.metamask.io) and [Rinkeby](https://faucet.rinkeby.io/): use these to have some Ether transfered to your account.
2. Connecting to a network node. These can be either an owned node (for which a hostname and port need to be provided), or an [INFURA](https://infura.io/) node (sign up on their website to obtain an API key). Using INFURA is recommended for beginners, since it's easier to setup.

Once both steps are complete, a `.env` file needs to be created on the root directory, containing the secret data required to connect to the node of your choice. [`env.sample`](https://github.com/zeppelinos/crafty/blob/master/env.sample) shows an example on how to do this. Do **NOT** commit or share the `.env` file.

### Contracts deployment
Once the connection to a node has been setup, the contracts can be deployed using:

`$ npm run deploy --network ropsten`

During deployment, the addresses of all deployed contracts will be printed. These should be used to create the configuration file for the app, which is stored in `app/src/store/config.json`. Do not commit this file, since it contains configuration info specific to a deployment. A sample config file exists in [`app/src/store/config.example.json`](https://github.com/zeppelinos/crafty/tree/master/app/src/store/config.example.json).

### Back-end

The back-end is a simple [Chalice](https://github.com/aws/chalice/) application, for which AWS credentials with access to API Gateway and Lambda need to be setup. After that, the API can be deployed by executing:

`$ chalice deploy`

The URL of the API must also be added to the `app/src/store/config.json` file.

### Front-end
The first time the front-end is setup, its dependencies need to be installed:

```
$ cd app
app $ npm install
```

Before the front-end can be deployed, the artifacts of the different contracts need to be copied to its directory. This can be achieved by running:

```
$ npm run build
$ npm run copy-artifacts
```

Also, the configuration file needs to be created with the addresses of the different contracts and the URL of the API, as described in the respective sections.

The front-end itself is a [React](https://reactjs.org/) app, which uses [Babel](https://babeljs.io/) to transpile and [webpack](https://webpack.js.org/) to build a bundle. All of these steps, plus an automatic creation of a server at `localhost:3000` can be executed by running:

`app $ npm run start`

A command is also available to update the contract artifacts and launch the app in a single step:

`$ npm run app`
