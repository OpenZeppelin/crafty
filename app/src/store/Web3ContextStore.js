import { observable, flow, action, transaction } from 'mobx'
import Web3 from 'web3'

const networkDescById = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  42: 'Kovan',
}

const defaultNetwork = {
  id: null,
  description: '',
}

export default class Web3ContextStore {
  @observable currentAddress = null
  @observable web3 = null
  @observable network = defaultNetwork

  constructor (root) {
    this.root = root

    setImmediate(() => {
      transaction(() => {
        this._getAndSetWeb3()
      })
    })
  }

  _getAndSetWeb3 = action(() => {
    if (typeof window.web3 === 'undefined') {
      this.network = defaultNetwork
      this.web3 = null
      this.currentAddress = null
      clearInterval(this.stopPollingInfo)
      setTimeout(this._getAndSetWeb3, 1000)
      return
    }

    if (!this.web3) {
      // only if we haven't instantiated
      // Create a new web3 object using the current provider
      this.web3 = new Web3(window.web3.currentProvider)
    }

    if (this.web3.currentProvider.isMetaMask) {
      this.root.ui.isMetaMask = true
    }

    this._getAndSetInfo(5000)
  })

  _getAndSetInfo = flow(function *(interval = 1000) {
    try {
      const id = yield this.web3.eth.net.getId()
      const description = networkDescById[id] || `Non-Canonical Network ${id}`
      this.network.id = id
      this.network.description = description

      const accounts = yield this.web3.eth.getAccounts()
      this.currentAddress = accounts[0] || null
    } catch (error) {
      console.log(error)
      this.root.ui.error = new Error('Could not get info from MetaMask')
    }

    setTimeout(this._getAndSetInfo, interval)
  }.bind(this))
}
