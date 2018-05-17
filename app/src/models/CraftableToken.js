import { computed } from 'mobx'
import BN from 'bn.js'

import CraftableTokenArtifact from '../artifacts/CraftableToken.json'
import extendedERC20WithStore from './ExtendedERC20'

import {
  asyncComputed,
  collect,
} from '../util'

export default (rootStore) => {
  const ExtendedERC20 = extendedERC20WithStore(rootStore)
  return class CraftableToken extends ExtendedERC20 {
    constructor (at) {
      super(at)

      this.contract = new rootStore.web3Context.web3.eth.Contract(
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
            amount: rootStore.web3Context.web3.utils.toBN(res[1]),
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
}
