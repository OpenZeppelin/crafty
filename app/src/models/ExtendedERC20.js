import { computed } from 'mobx'

import ExtendedERC20Artifact from '../artifacts/ExtendedERC20.json'
import RootStore from '../store/RootStore'
import ERC20 from './ERC20'

import {
  asyncComputed
} from '../util'

const fallbackImage = 'https://s2.coinmarketcap.com/static/img/coins/128x128/2165.png'

export default class ExtendedERC20 extends ERC20 {
  constructor (at) {
    super(at)

    this.contract = new RootStore.web3Context.web3.eth.Contract(
      ExtendedERC20Artifact.abi,
      at
    )
  }

  metadata = asyncComputed(null, async () => {
    try {
      const metadataUri = await this.contract.methods.tokenURI().call()
      const res = await fetch(metadataUri)
      const data = await res.json()
      return data
    } catch (error) {
      // For contracts that are not ExtendedERC20's and don't support tokenURI()
      return null
    }
  })

  @computed get image () {
    if (this._image) {
      return this._image
    }

    if (this.metadata.busy()) {
      // Might have metadata, fallback until we know for sure
      return fallbackImage
    }

    if (this.metadata.current() !== null) {
      this._image = this.metadata.current().image
    } else {
      // No metadata
      const canonical = RootStore.config.canonicalAddressesAndImages.find(canon => canon.address.toLowerCase() === this.address.toLowerCase())
      if (canonical) {
        this._image = canonical.image
      } else {
        // Non-canonical, we have no info, so default to the fallback
        this._image = fallbackImage
      }
    }

    return this._image
  }

  @computed get description () {
    if (this.metadata.busy() || (this.metadata.current() === null)) {
      return `The ${this.name.current()} token`
    }
    return this.metadata.current().description
  }

  @computed get shortDescription () {
    return this.description.length > 140
      ? `${this.description.substring(0, 140)}…`
      : this.description
  }
}
