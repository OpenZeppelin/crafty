import React from 'react'
import { observer, inject } from 'mobx-react'
import { asyncComputed } from 'computed-async-mobx'

import Input from './Input'
import ERC20 from '../models/ERC20'

import './InputTokenField.css'

@inject('store')
@observer
class InputTokenField extends React.Component {
  static defaultProps = {
    editing: false,
  }

  inferredToken = asyncComputed(null, 500, async () => {
    const web3 = this.props.store.web3Context.web3
    const tokenAddress = this.props.field.$('address').values()
    if (!web3.utils.isAddress(tokenAddress)) { return null }
    return new ERC20(web3, tokenAddress)
  })

  _renderTokenSelector = () => {
    if (this.props.field.$('canonical').values()) {
      return (
        <div className='grid-x grid-margin-x'>
          <div className='cell auto'>
            <Input
              field={this.props.field.$('address')}
              isSelect
            />
          </div>
        </div>

      )
    }

    const label = this.inferredToken.get()
      ? `${this.inferredToken.get().shortName} (${this.inferredToken.get().shortSymbol})`
      : 'Token Address'

    return (
      <div className='grid-x grid-margin-x'>
        <div className='cell auto'>
          <Input
            field={this.props.field.$('address')}
            opts={{ label }}
          />
        </div>
      </div>
    )
  }

  render () {
    const { token } = this.props

    return (
      <div className='grid-x grid-margin-x align-middle input-token-field'>
        {this.props.editing &&
          <div className='cell shrink'>
            <button
              className='button inverted'
              onClick={this.props.field.onDel}
            >
              remove
            </button>
          </div>
        }
        {this.props.editing &&
          <div className='cell small-2'>
            <Input field={this.props.field.$('canonical')} />
          </div>
        }
        <div className='cell small-5'>
          {this._renderTokenSelector()}
        </div>
        <div className='cell auto'>
          <Input field={this.props.field.$('amount')} />
        </div>
        {!this.props.editing &&
          <div className='cell small-3'>
            <input type='checkbox' value={token.approved} />
          </div>
        }
      </div>
    )
  }
}

export default InputTokenField
