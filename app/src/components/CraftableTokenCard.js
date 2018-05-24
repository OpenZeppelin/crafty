import React from 'react'
import { observer } from 'mobx-react'

import { Redirect } from 'react-router-dom'
import './CraftableTokenCard.css'

@observer
class CraftableTokenCard extends React.Component {
  static defaultProps = {
    withBalanceOfAddress: null,
  }

  constructor (props) {
    super(props)

    this.state = {
      clicked: false,
    }
  }

  render () {
    const { token, withBalanceOfAddress } = this.props
    const balance = withBalanceOfAddress &&
      token.balanceOf(withBalanceOfAddress).current()

    return (
      <div
        className={`${this.props.className} grid-y craftable-card`}
        onClick={() => this.setState({ clicked: true })}
      >
        {this.state.clicked &&
          <Redirect to={`/craft/${token.address}`} />
        }
        <div className='cell small-8 grid-y align-center-middle overflow-hidden'>
          <img
            className='cell shrink craftable-image'
            alt='the craftable token'
            src={token.image}
          />
        </div>
        <div className='cell small-4 craftable-text-container'>
          <div className='craftable-text'>
            <div>
              <h3>{token.shortName}</h3>
              <p>{token.shortDescription}</p>
            </div>
            <div className='right-aligned'>
              {withBalanceOfAddress &&
                <p className='balance-text'>Balance: {balance.toString(10)}</p>
              }
              {token.basicCraftable &&
                <img className='basic-img' src='./images/ethereum.svg' title='Basic' alt='basic'/>
              }
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default CraftableTokenCard
