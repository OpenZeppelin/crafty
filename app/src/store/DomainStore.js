import { computed } from 'mobx'
import Crafty from '../models/Crafty'
import featured from '../featured.json'

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
    console.log(featured)
    return tokens.filter((t) => featured.includes(t.address))
  }
}
