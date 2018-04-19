import { observable, computed } from 'mobx'
import BN from 'bn.js'
import pMap from 'p-map'
import range from 'lodash/range'
import { asyncComputed } from 'computed-async-mobx'
import CraftyArtifact from '../artifacts/Crafty.json'
import CraftableToken from '../models/CraftableToken'
import RootStore from '../store/RootStore'

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

  addCraftable = async (...args) => {
    const receipt = await this.contract.methods.addCraftable(
      ...args
    ).send({
      from: RootStore.web3Context.currentAddress,
    })

    if (!receipt.events || !receipt.events.CraftableAdded) {
      throw new Error('no events found!')
    }

    return receipt.events.CraftableAdded.returnValues.addr
  }

  @computed get address () {
    return this.contract._address
  }

  totalCraftables = asyncComputed(
    new BN(0),
    1000,
    async () => {
      return new BN(
        await this.contract.methods.getTotalCraftables().call()
      )
    })

  craftableTokenAddresses = asyncComputed([], 1000, async () => {
    const totalCraftables = this.totalCraftables.get().toNumber()
    const addresses = await pMap(
      range(totalCraftables),
      async (i) => {
        return this.contract.methods.getCraftable(i).call()
      }, { concurrency: 10 })

    return addresses
  })

  craftableTokens = asyncComputed([], 1000, async () => {
    return this.craftableTokenAddresses.get()
      .map(a => new CraftableToken(this.web3, a))
  })
}
