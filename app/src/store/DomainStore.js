import { computed } from 'mobx'
import { asyncComputed } from '../util'
import pMap from 'p-map'

import featured from '../featured.json'

export default class DomainStore {
  constructor (root) {
    this.root = root
  }

  @computed get crafty () {
    if (!this.root.web3Context.hasWeb3) {
      return null
    }

    if (!this.Crafty) {
      this.Crafty = require('../models/Crafty').default
    }

    try {
      return new this.Crafty(
        this.root.web3Context.web3,
        this.root.web3Context.network.id
      )
    } catch (error) {
      console.log(error)
      return null
    }
  }

  @computed get hasCrafty () {
    return !!this.crafty
  }

  @computed get canRead () {
    return this.root.web3Context.canRead &&
      this.hasCrafty
  }

  @computed get craftableTokens () {
    return this.crafty.craftableTokens
  }

  @computed get featuredCraftableTokens () {
    return this.craftableTokens
      .filter((t) => featured.includes(t.address))
  }

  /**
   * returns whether or not the web3 context is setup and we see crafty, etc
   */
  @computed get canDoAllActions () {
    return this.root.web3Context.hasWeb3 &&
      this.root.web3Context.hasNetwork &&
      this.root.web3Context.isUnlocked &&
      this.hasCrafty
  }

  myCraftedTokens = asyncComputed([], async () => {
    const me = this.root.web3Context.currentAddress
    const allCraftabletokens = this.craftableTokens

    const allTokens = await pMap(allCraftabletokens, async (token) => {
      const balance = await token.balanceOf(me)
      return {
        token,
        balance,
      }
    }, { concurrency: 10 })
    // const myTokens = allTokens.filter(tc => tc.balance.gt(0))

    return allTokens.map(tc => tc.token)
    // return myTokens.map(tc => tc.token)
  })

  myRecipes = asyncComputed([], async () => {
    const me = this.root.web3Context.currentAddress
    const allCraftabletokens = this.craftableTokens

    const allTokens = await pMap(allCraftabletokens, async (token) => {
      // const creator = await token.creator()
      const creator = me
      return {
        token,
        creator,
      }
    }, { concurrency: 10 })

    return allTokens
      .filter(tc => tc.creator === me)
      .map(tc => tc.token)
  })
}
