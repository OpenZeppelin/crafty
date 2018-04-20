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
    return {}
    // const metadataUri = await this.contract.methods.tokenUri()
    // const res = await fetch(metadataUri)
    // const data = await res.json()
    // return data
  })

  @computed get imageUri () {
    return 'https://placem.at/things?w=200&h=200'
    // return this.metadata.get().image
  }

  @computed get description () {
    return 'It\'s a delicious sandwich, what more could you ask for?'
    // return this.metadata.get().description
  }

  totalRecipeSteps = asyncComputed(
    new BN(0),
    async () =>
      new BN(
        await this.contract.methods.getTotalRecipeSteps().call()
      )
  )

  ingredientAddressesAndAmounts = asyncComputed(
    [],
    async () =>
      collect(this.totalRecipeSteps.current().toNumber(), async (i) => {
        const res = await this.contract.methods.getRecipeStep(i).call()
        return {
          address: res[0],
          amount: new BN(res[1]),
        }
      })
  )

  @computed get ingredients () {
    return this.ingredientAddressesAndAmounts.current().map(i =>
      new ERC20(i.address)
    )
  }
}
