import { observable, computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { asyncComputed } from 'computed-async-mobx'
import ERC20Artifact from '../artifacts/DetailedERC20.json'

export default class ERC20 {
  @observable contract = null

  constructor (web3, at) {
    this.web3 = web3
    this.contract = new web3.eth.Contract(
      ERC20Artifact.abi,
      at
    )
  }

  @computed get address () {
    return this.contract._address
  }

  name = asyncComputed('...', 1000, async () => {
    try {
      const name = await this.contract.methods.name().call()
      if (!name) { throw new Error() }
      return name
    } catch (error) {
      return 'Invalid Token'
    }
  })

  symbol = asyncComputed('...', 1000, async () => {
    try {
      const symbol = await this.contract.methods.symbol().call()
      if (!symbol) { throw new Error() }
      return symbol
    } catch (error) {
      return '⚠'
    }
  })

  @computed get shortName () {
    return this.name.get().length > 22
      ? `${this.name.get().substring(0, 14)}…`
      : this.name.get()
  }

  @computed get shortSymbol () {
    return this.symbol.get().length > 6
      ? `${this.symbol.get().substring(0, 6)}…`
      : this.symbol.get()
  }

  balanceOf = createTransformer(
    (address) => asyncComputed(
      new this.web3.utils.BN(0),
      500,
      async () => {
        return this.contract.methods.balanceOf(address).call()
      })
  )

  allowance = createTransformer(
    (address) => asyncComputed(
      new this.web3.utils.BN(0),
      500,
      async () => {
        return new this.web3.utils.BN(0)
        // return this.contract.methods.allowance(
        //   address,
        //   // @TODO(shrugs) - how to get crafty address here?
        //   this.store.crafty.address
        // )
      }
    )
  )
}
