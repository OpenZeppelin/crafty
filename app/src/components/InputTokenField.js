import React from 'react'
import { observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'
import { asyncComputed } from '../util'

import Input from './Input'
import ERC20 from '../models/ERC20'

import './InputTokenField.css'

@inject('store')
@observer
class InputTokenField extends React.Component {
  @observable deleting = false

  static defaultProps = {
    editing: false,
  }

  inferredToken = asyncComputed(null, async () => {
    const web3 = this.props.store.web3Context.web3
    const tokenAddress = this.props.field.$('address').values()

    if (!web3.utils.isAddress(tokenAddress)) { return null }

    return new ERC20(tokenAddress)
  })

  @action
  _remove = () => {
    this.deleting = true
    setTimeout(() => {
      this.props.field.del()
    }, 251)
  }

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

    const label = this.inferredToken.current()
      ? `${this.inferredToken.current().shortName} (${this.inferredTokencurrentget().shortSymbol})`
      : 'Token Address'

    return (
      <div className='grid-x grid-margin-x'>
        <div className='cell auto'>
          <Input
            field={this.props.field.$('address')}
            label={label}
          />
        </div>
      </div>
    )
  }

  render () {
    const { token } = this.props

    return (
      <div className={`grid-x grid-margin-x align-middle input-token-field ${this.deleting ? 'deleting' : ''}`}>
        {this.props.editing &&
          <div className='cell shrink'>
            <button
              className='button inverted'
              onClick={this._remove}
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
