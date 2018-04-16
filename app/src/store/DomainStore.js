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
    if (!this.root.web3Context.web3) {
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

  @computed get craftableTokens () {
    return this.crafty.craftableTokens.get()
  }

  @computed get featuredCraftableTokens () {
    const tokens = this.crafty.craftableTokens.get()
    return tokens.filter((t) => featured.includes(t.address))
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
    }, { concurrency: 5 })
    // const myTokens = allTokens.filter(tc => tc.balance.gt(0))

    return allTokens.map(tc => tc.token)
    // return myTokens.map(tc => tc.token)
  })
}
