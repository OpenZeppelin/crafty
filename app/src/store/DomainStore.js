import { computed } from 'mobx'
import { asyncComputed } from 'computed-async-mobx'
import Crafty from '../models/Crafty'
import featured from '../featured.json'
import pMap from 'p-map'

export default class DomainStore {
  constructor (root) {
    this.root = root
  }

  @computed get crafty () {
    if (!this.root.web3Context.hasWeb3) {
      return null
    }

    try {
      return new Crafty(
        this.root.web3Context.web3,
        this.root.web3Context.network.id
      )
    } catch (error) {
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
    return this.crafty.craftableTokens.get()
  }

  @computed get featuredCraftableTokens () {
    const tokens = this.crafty.craftableTokens.get()
    return tokens.filter((t) => featured.includes(t.address))
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

  myCraftedTokens = asyncComputed([], 500, async () => {
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

  myRecipes = asyncComputed([], 500, async () => {
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
