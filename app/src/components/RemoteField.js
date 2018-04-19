import Field from './Field'
import { observable, action, reaction } from 'mobx'

class RemoteField extends Field {
  @observable pending = true
  @observable requestedValue

  @action
  _syncRemoteValue = () => {
    const value = this.$extra.createValue(this)
    this.$extra.disposer = reaction(
      () => value.current(),
      () => {
        this.value = value.current()
        this.pending = false
      })
  }

  @action
  onChange = (e) => {
    // do not allow changes from UI like so:
    // this.value = e.target.value
    // instead, set pending and request that the value be changed
    this.pending = true
    // const value = this.extra.requestChange(e.target.value)
    // // 1-way sync from handler to value
    // autorun(() => {
    //   this.value = value
    // })
  }
}

export default RemoteField
