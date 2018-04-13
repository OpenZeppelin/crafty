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

  name = asyncComputed('Name', 1000, async () => {
    return 'Name'
    // return this.contract.name()
  })

  description = asyncComputed('Description', 1000, async () => {
    return 'Description'
    // return this.contract.description()
  })

  imageUri = asyncComputed('https://placem.at/things?w=200&h=200', 1000, async () => {
    return 'https://placem.at/things?w=200&h=200'
    // const metadataUri = await this.contract.tokenUri()
    // const res = await fetch(metadataUri)
    // const data = await res.json()
    // console.log(data)
    // return data.image
  })
}
