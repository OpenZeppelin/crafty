import { computed } from 'mobx'
import BN from 'bn.js'

import CraftableTokenArtifact from '../artifacts/CraftableToken.json'
import RootStore from '../store/RootStore'
import ERC20 from './ERC20'

import {
  asyncComputed,
  collect,
} from '../util'

export default class CraftableToken extends ERC20 {
  constructor (at) {
    super(at)

    this.contract = new RootStore.web3Context.web3.eth.Contract(
      CraftableTokenArtifact.abi,
      at
    )
  }

  creator = asyncComputed('0x0', async () =>
    this.contract.methods.creator().call()
  )

  @computed get shortDescription () {
    return this.description.length > 140
      ? `${this.description.substring(0, 140)}…`
      : this.description
  }

  metadata = asyncComputed({}, async () => {
    const metadataUri = await this.contract.methods.tokenURI().call()
    const res = await fetch(metadataUri)
    const data = await res.json()
    return data
  })

  @computed get imageUri () {
    if (this.metadata.busy()) {
      return 'https://placem.at/things?w=200&h=200'
    }
    return this.metadata.current().image
  }

  @computed get description () {
    if (this.metadata.busy()) {
      return ''
    }
    return this.metadata.current().description
  }

  ingredientAddressesAndAmounts = asyncComputed(
    null,
    async () => {
      const totalRecipeSteps = new BN(await this.contract.methods.getTotalRecipeSteps().call());
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
      return null;
    }

    this._ingredientsAndAmounts = this.ingredientAddressesAndAmounts
      .current().map(i => ({
        token: new ERC20(i.address),
        amount: i.amount,
      }))

    return this._ingredientsAndAmounts
  }
}
