import React from 'react'

import { asyncComputed } from 'computed-async-mobx'
import { observer, inject } from 'mobx-react'
import { action } from 'mobx'

import './InputTokenField.css'
import Input from './Input'
import ERC20 from '../models/ERC20'

const canonicalTokens = [{
  name: 'ZEP',
  symbol: 'ZEP',
  address: '0xEC6d36A487d85CF562B7b8464CE8dc60637362AC',
}]

@inject('store')
@observer
class InputTokenField extends React.Component {
  static defaultProps = {
    editing: false,
  }

  @action
  _update = (k, v) => {
    this.props.value[k] = v
  }

  _onSelect = (e) => {
    this._update(e.target.name, e.target.value)
  }

  inferredToken = asyncComputed(null, 500, async () => {
    const web3 = this.props.store.web3Context.web3
    const tokenAddress = this.props.value.address
    if (!web3.utils.isAddress(tokenAddress)) { return null }
    return new ERC20(web3, tokenAddress)
  })

  _renderTokenSelector = () => {
    if (this.props.value.canonical) {
      return (
        <label htmlFor='canonicalSelect'>
          Canonical Token
          <select
            name='address'
            onChange={this._onSelect}
          >
            <option value=''>Select a Token</option>
            {canonicalTokens.map(t =>
              <option
                key={t.address}
                value={t.address}
              >
                {t.symbol} ({t.name})
              </option>
            )}
          </select>
        </label>
      )
    }

    const label = this.inferredToken.get()
      ? `${this.inferredToken.get().shortName} (${this.inferredToken.get().shortSymbol})`
      : 'Token Address'

    return (
      <div className='grid-x grid-margin-x'>
        <div className='cell auto'>
          <Input
            name='address'
            label={label}
            placeholder='0x0'
            value={this.props.value.address}
            onChange={this._update}
            error={this.props.errors.first(`inputs.${this.props.tokenId}.address`)}
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
              onClick={() => this.props.onRemove(this.props.tokenId)}
            >
              remove
            </button>
          </div>
        }
        {this.props.editing &&
          <div className='cell small-2'>
            <Input
              id={this.props.tokenId}
              name='canonical'
              type='checkbox'
              label='Canonical Token?'
              value={this.props.value.canonical}
              onChange={this._update}
            />
          </div>
        }
        <div className='cell small-5'>
          {this._renderTokenSelector()}
        </div>
        <div className='cell auto'>
          <Input
            id={this.props.tokenId}
            name='amount'
            type='number'
            label='How many tokens are required?'
            value={this.props.value.amount}
            onChange={this._update}
            error={this.props.errors.first(`inputs.${this.props.tokenId}.amount`)}
          />
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
