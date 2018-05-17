import { computed } from 'mobx'
import BN from 'bn.js'

import CraftableTokenArtifact from '../artifacts/CraftableToken.json'
import RootStore from '../store/RootStore'
import ExtendedERC20 from './ExtendedERC20'

import {
  asyncComputed,
  collect,
} from '../util'

export default class CraftableToken extends ExtendedERC20 {
  constructor (at) {
    super(at)

    this.contract = new RootStore.web3Context.web3.eth.Contract(
      CraftableTokenArtifact.abi,
      at
    )
  }

  ingredientAddressesAndAmounts = asyncComputed(
    null,
    async () => {
      const totalRecipeSteps = new BN(await this.contract.methods.getTotalRecipeSteps().call())
      return collect(totalRecipeSteps.toNumber(), async (i) => {
        const res = await this.contract.methods.getRecipeStep(i).call()
        return {
          address: res[0],
          amount: RootStore.web3Context.web3.utils.toBN(res[1]),
        }
      })
    }
  )

  @computed get ingredientsAndAmounts () {
    if (this._ingredientsAndAmounts) {
      return this._ingredientsAndAmounts
    }

    if (this.ingredientAddressesAndAmounts.busy()) {
      return null
    }

    this._ingredientsAndAmounts = this.ingredientAddressesAndAmounts
      .current().map(i => ({
        token: new ExtendedERC20(i.address),
        amount: i.amount,
      }))

    return this._ingredientsAndAmounts
  }

  @computed get basicCraftable () {
    if (!this.ingredientsAndAmounts) {
      return false
    }

    return this.ingredientsAndAmounts.length === 0
  }
}
