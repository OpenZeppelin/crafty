import React from 'react'
import { computed } from 'mobx'
import { observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'

import Input from './Input'
import ExtendedERC20 from '../models/ExtendedERC20'

import './InputTokenField.css'

@inject('store')
@observer
class InputTokenField extends React.Component {
  @observable deleting = false

  static defaultProps = {
    editing: false,
  }

  @computed get inferredToken () {
    const web3 = this.props.store.web3Context.web3
    const tokenAddress = this.props.field.$('address').values()

    if (!web3.utils.isAddress(tokenAddress)) { return null }

    return new ExtendedERC20(tokenAddress)
  }

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

    const label = this.inferredToken ? this.inferredToken.label : 'Token Address'

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
        <div className='cell small-3'>
          <img
            className='cell shrink craftable-image'
            alt='the token'
            src={this.inferredToken ? this.inferredToken.image : 'https://s2.coinmarketcap.com/static/img/coins/128x128/2165.png'}
          />
        </div>
        <div className='cell small-4'>
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
