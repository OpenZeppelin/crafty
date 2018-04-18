import { Field } from 'mobx-react-form'
import { observable, action, autorun } from 'mobx'

class AsyncField extends Field {
  @observable pending = false

  @action
  onChange = (e) => {
    // do not allow changes from UI like so:
    // this.value = e.target.value
    // instead, set pending and request that the value be changed
    this.pending = true
    const value = this.extra.requestChange(e.target.value)
    // 1-way sync from handler to value
    autorun(() => {
      this.value = value
    })
  }
}

export default AsyncField
