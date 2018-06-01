import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import CraftableTokenFeed from '../components/CraftableTokenFeed'
import SectionHeader from '../components/SectionHeader'
import WithWeb3Context from '../components/WithWeb3Context'
import EmptyState from '../components/EmptyState'

@inject('store')
@observer
class IndexPage extends React.Component {
  link = (label, target) => {
    return (<a target='_blank' href={target} rel='noopener noreferrer'>{label}</a>)
  }

  render () {
    const { domain } = this.props.store
    return (
      <div>
        <Header></Header>
        <Subtitle>
          <h2><b>Crafty</b></h2>
# Help

Have you ever wondered what may happen if you combined an Aragon token and
fire? A fire-spewing eagle? We made Crafty to let the Ethereum community answer
this and other vital questions.

In Crafty, users can create new ERC20 tokens with a picture, and a short
description following EIP-1046. The only way to get these tokens is by crafting
them, which requires other ERC20 tokens to be spent as ingredients following a
recipe.

## Ethereum and the browser

To use Crafty you need to open it on an Ethereum browser like {this.link('Mist', 'https://github.com/ethereum/mist')}, or using a plugin for your normal
Internet browser like {this.link('MetaMask', 'https://metamask.io/')}.

Then, unlock your mainnet account.

Crafting tokens and creating new recipes is free; but you need to have ether
to pay for the execution of the transactions, and to purchase some of the
ingredient tokens that are not free.

If all of this is new to you, go to the {this.link('Ethereum website', 'https://ethereum.org/')} to learn more.

## Discover

Go to the *Discover* page to see all the available tokens that you can craft or
use as ingredients for your own recipes.

Here you will see some basic tokens, identified with an Ethereum logo on the
bottom right corner. These basic tokens require no ingredients, so you can
craft them even if you don't own any tokens yet. Click one of these basic
tokens to see it's details. On the details page, you will also find the
`Craft` button. Click it and accept the transacction on your wallet, and once
this transaction is confirmed you will be awarded with 100 units of the basic
token that you chose. Now you can use this basic token to craft other more
complex tokens.

Back on the *Discover* page, if you click one of the complex tokens you will
see the ingredients required to craft it. If you want this token, first make
sure to get the amount specified on the recipe for each of the ingredient
tokens. Then, approve all the tokens by clicking the check mark and finally
click the `Craft` button.

## Wallet

Go to the *Wallet* page to see the ballance of all tokens that you own, and
to see all the recipes that you have created.

## New Recipe

To experiment with your own craftable creations, go to the *New Recipe* page.
Here you can choose an image, name, symbol and description for your new token.
Then, add the ingredient tokens and their amounts, and click the *Create
recipe* button. Once the transaction is confirmed, it will be available on the
*Discover* page for you and others to craft.

## ZeppelinOS

We built Crafty at Zeppelin as a demo for the features of ZeppelinOS, an
operating system designed specifically for smart contracts. It provides an
on-chain set of upgradeable standard libraries, and an incentive structure
to continually upgrade and patch itself.

You can read more about the {this.link('implementation details of Crafty in the ZeppelinOS documentation site', 'https://docs.zeppelinos.org/docs/crafty.html')}.

## Frequently Asked Questions

### What is an ERC20 token?

Technically, a token is just a data structure stored on the Ethereum
blockchain that is linked to an address. The owner of this address owns the
tokens linked to it. Tokens generally have a value that comes from their
scarcity or because they allow the owner to participate on some Ethereum
project.

ERC20 is a standard that defines some common properties for tokens. Following
this standard it is possible to do interesting things with the tokens, like
managing all of them from a single wallet; or using them for a crazy project
that crafts combinations of them, Frankenstein style.

Read more about {this.link('ERC20 on the Ethereum EIP repository', 'https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md')}.

### What is EIP-1046?

EIP-1046 is a proposed extension to ERC20 that adds metadata, like image,
title, description, etc. We use these metadata to display the tokens, and to
define new recipes which are also ERC20 tokens.

### How to add a new basic token?

Basic tokens can only be added by the admins of Crafty. If you are missing a
token to build your super cool recipe, {this.link('file a bug on the Crafty project', 'https://github.com/zeppelinos/crafty/issues')}
requesting for it to be added.

### What is Zeppelin?

At Zeppelin we build key infrastructure to develop and operate smart contract
systems. We also conduct security audits of decentralized applications.

If you want to learn more about us, go to the {this.link('Zeppelin website', 'https://zeppelin.solutions/')}.

### Why ZeppelinOS?

ZeppelinOS provides new capabilities for applications built on the Ethereum
blockchain. On Crafty we are using ZeppelinOS for upgradeability (to fix and
improve the contracts over time), and to link the contracts to standard
libraries already deployed on the blockchain.

To learn more about these features, and to get started using them on your own
decentralized application, go to the {this.link('ZeppelinOS webste', 'https://zeppelinos.org/')}.
        </Subtitle>
        <SectionHeader>
          Frequently Asked Questions
        </SectionHeader>
        <Footer />
      </div>
    )
  }
}

export default IndexPage
