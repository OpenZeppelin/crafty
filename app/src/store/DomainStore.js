import { computed } from 'mobx'
import { promiseComputed, pFilter } from '../util'
import some from 'lodash/some'
import BN from 'bn.js'

import featured from '../featured.json'
import extendedERC20WithStore from '../models/ExtendedERC20'

import craftyWithStore from '../models/Crafty'

export default class DomainStore {
  constructor (root) {
    this.root = root
    this.Crafty = craftyWithStore(root)
    this.ExtendedERC20 = extendedERC20WithStore(root)
  }

  @computed get crafty () {
    // why is this specific memoization necessary??
    if (this._crafty) { return this._crafty }
    // this fn is dependend on hasWeb3 and the web3 object
    // the web3 object is memoized, so this function is as well
    if (!this.root.web3Context.hasWeb3) {
      return null
    }
    const web3 = this.root.web3Context.web3

    try {
      this._crafty = new this.Crafty(web3)
      return this._crafty
    } catch (error) {
      console.error(error)
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

  myCraftedTokens = promiseComputed([], async () => {
    const me = this.root.web3Context.currentAddress
    const allCraftableTokens = this.craftableTokens

    return pFilter(allCraftableTokens, async (token) => {
      try {
        const res = await token.contract.methods.balanceOf(me).call()
        const balance = new BN(res)
        return balance.gt(new BN(0))
      } catch (error) {
        console.error(error)
        return false
      }
    })
  })

  myRecipes = promiseComputed([], async () => {
    const me = this.root.web3Context.currentAddress
    const allCraftableTokens = this.craftableTokens

    return pFilter(allCraftableTokens, async (token) => {
      try {
        const creator = await token.contract.methods.creator().call()
        return creator === me
      } catch (error) {
        console.error(error)
        return false
      }
    })
  })

  get canonicalTokens () {
    if (this._canonicalTokens) {
      return this._canonicalTokens
    }

    const networkId = this.root.web3Context.network.id
    if (!networkId) { return [] }

    this._canonicalTokens = this.root.config.canonicalAddressesAndImages.map(ct =>
      new this.ExtendedERC20(ct.address)
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
