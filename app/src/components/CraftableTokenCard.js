import React from 'react'
import { observer } from 'mobx-react'

@observer
class CraftableTokenCard extends React.Component {
  render () {
    return (
      <div>
        <img src={this.props.token.imageUri.get()} />
        <p>Name: {this.props.token.name.get()}</p>
        <p>Desc: {this.props.token.description.get()}</p>
      </div>
    )
  }
}

export default CraftableTokenCard
