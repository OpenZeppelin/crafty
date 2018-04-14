import React from 'react'
import { observer } from 'mobx-react'

import './CraftableTokenCard.css'

@observer
class CraftableTokenCard extends React.Component {
  render () {
    return (
      <div className={`${this.props.className} grid-y craftable-card with-border`}>
        <div className='cell small-8 grid-y align-center-middle'>
          <img
            className='cell shrink craftable-image'
            alt='the craftable token'
            src={this.props.token.imageUri.get()}
          />
        </div>
        <div className='cell small-4 craftable-text-container'>
          <div className='craftable-text with-border'>
            <h3>{this.props.token.shortName}</h3>
            <p>{this.props.token.shortDescription}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default CraftableTokenCard
