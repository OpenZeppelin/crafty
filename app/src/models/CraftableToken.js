import { observable, computed } from 'mobx'
import { asyncComputed } from 'computed-async-mobx'
import CraftableTokenArtifact from '../artifacts/CraftableToken.json'

export default class CraftableToken {
  @observable contract = null

  constructor (web3, at) {
    this.contract = new web3.eth.Contract(
      CraftableTokenArtifact.abi,
      at
    )
  }

  @computed get address () {
    return this.contract._address
  }

  name = asyncComputed('...', 1000, async () => {
    return 'A Nice Sandwich'
    // return this.contract.name()
  })

  description = asyncComputed('...', 1000, async () => {
    return 'It\'s a delicious sandwich, what more could you ask for?'
    // return this.contract.description()
  })

  @computed get shortName () {
    return this.name.get().length > 40
      ? `${this.name.get().substring(0, 40)}…`
      : this.name.get()
  }

  @computed get shortDescription () {
    return this.description.get().length > 140
      ? `${this.description.get().substring(0, 140)}…`
      : this.description.get()
  }

  imageUri = asyncComputed('https://placem.at/things?w=200&h=200', 1000, async () => {
    return 'https://placem.at/things?w=200&h=200'
    // const metadataUri = await this.contract.tokenUri()
    // const res = await fetch(metadataUri)
    // const data = await res.json()
    // console.log(data)
    // return data.image
  })
}
