import { computed } from 'mobx'

export default class ConfigStore {
  constructor (root) {
    this.root = root
    this.config = require('./config.json')
  }

  @computed get crafty () {
    if (!this.root.web3Context.hasNetwork) {
      return null
    }
    return this.config.networks[this.root.web3Context.network.id].crafty
  }

  @computed get canonicalAddressesAndImages () {
    if (!this.root.web3Context.hasNetwork) {
      return []
    }
    return this.config.networks[this.root.web3Context.network.id].canonicals
  }
}
