import { computed } from 'mobx'
import { asyncComputed } from '../util'
import some from 'lodash/some'
import pMap from 'p-map'

import Test1Token from '../artifacts/Test1Token.json'
import Test2Token from '../artifacts/Test2Token.json'
import Test3Token from '../artifacts/Test3Token.json'
import featured from '../featured.json'
import ERC20 from '../models/ERC20'

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

  get canonicalTokens () {
    // we need to stop this method from creating new ERC20 objects
    // every time it's called
    // because it resets the observables for all
    // of the dependent properties like name, symbol
    if (this._canonicalTokens) {
      return this._canonicalTokens
    }

    const networkId = this.root.web3Context.network.id
    if (!networkId) { return [] }

    const tokenArtifacts = [Test1Token, Test2Token, Test3Token]
    this._canonicalTokens = tokenArtifacts.map(ct =>
      new ERC20(ct.networks[networkId].address)
    )

    return this._canonicalTokens
  }

  @computed get canonicalTokensInfo () {
    return this.canonicalTokens.map(ct => ct.info)
  }

  // are any of the canonical token things busy?
  @computed get isLoadingCanonicalTokens () {
    const anyBusy = this.canonicalTokensInfo.map(ct => ct.busy)
    return this.canonicalTokensInfo.length === 0 || some(anyBusy)
  }
}
