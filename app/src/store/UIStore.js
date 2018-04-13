import { observable } from 'mobx'

export default class UIStore {
  @observable state = 'loading'
  @observable error = null
  @observable isMetaMask = false

  constructor (root) {
    this.root = root
  }
}
