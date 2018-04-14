import React from 'react'
import { observer } from 'mobx-react'

import { Redirect } from 'react-router-dom'
import './CraftableTokenCard.css'

@observer
class CraftableTokenCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      clicked: false,
    }
  }

  render () {
    return (
      <div
        className={`${this.props.className} grid-y craftable-card with-border`}
        onClick={() => this.setState({ clicked: true })}
      >
        {this.state.clicked &&
          <Redirect to={`/craft/${this.props.token.address}`} />
        }
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
