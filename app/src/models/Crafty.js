import { observable, computed } from 'mobx'
import { asyncComputed } from 'computed-async-mobx'
import CraftyArtifact from '../artifacts/Crafty.json'
import CraftableToken from '../models/CraftableToken'

export default class Crafty {
  @observable contract = null

  constructor (web3, networkId) {
    this.web3 = web3
    try {
      this.contract = new web3.eth.Contract(
        CraftyArtifact.abi,
        CraftyArtifact.networks[networkId].address
      )
    } catch (error) {
      throw error
    }
  }

  @computed get address () {
    return this.contract._address
  }

  craftableTokenAddresses = asyncComputed([], 1000, async () => {
    return ['0xEC6d36A487d85CF562B7b8464CE8dc60637362AC']
    // return this.contract.craftables()
  })

  craftableTokens = asyncComputed([], 1000, async () => {
    return this.craftableTokenAddresses.get()
      .map(a => new CraftableToken(this.web3, a))
  })
}
