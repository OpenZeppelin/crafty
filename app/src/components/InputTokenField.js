import React from 'react'
import { computed, observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'

import Input from './Input'
import extendedERC20WithStore from '../models/ExtendedERC20'
import Autocomplete from 'react-autocomplete'

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
    const ExtendedERC20 = extendedERC20WithStore(this.props.store)

    if (!web3.utils.isAddress(tokenAddress)) { return null }

    return new ExtendedERC20(tokenAddress)
  }

  _onSelect = (value) => {
    this.props.field.$('address').value = value
    this.props.field.container().validate()
  }

  _onChange = (e, value) => {
    this.props.field.$('address').value = value
    this.props.field.container().validate()
  }

  @action
  _remove = () => {
    this.deleting = true
    setTimeout(() => {
      this.props.field.del()
    }, 251)
  }

  render () {
    return (
      <div className={`small-12 medium-6 large-4 new-recipe-grid-col ${this.deleting ? 'deleting' : ''}`}>
        <div className='ingredient-row new-recipe-row align-middle input-token-field'>
          <div>
            <img
              className='token-img'
              alt='the token'
              src={this.inferredToken
                ? this.inferredToken.image
                : 'https://s2.coinmarketcap.com/static/img/coins/128x128/2165.png'
              }
            />
          </div>
          <div className='craftable-ingredient-info new-recipe-ingredient'>
            <div>
              {this._renderTokenSelector()}
            </div>
            <div className='ammount-field'>
              <Input field={this.props.field.$('amount')} />
            </div>
            {this.props.editing &&
              <div>
                <button
                  className='remove-btn'
                  onClick={this._remove}
                >
                  <img
                    src='/images/delete.svg'
                    alt='Remove'
                  />
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  _renderTokenSelector = () => {
    const tokens = this.props.store.domain.craftableTokens
      .concat(this.props.store.domain.canonicalTokens)
      .sort((lhs, rhs) => lhs.label > rhs.label)

    return (
      <div className='grid-x grid-margin-x'>
        <div className='cell auto token-field'>
          <label>{this.inferredToken ? this.inferredToken.label : 'Token Address'}</label>
          <Autocomplete
            inputProps={{
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'off',
            }}
            menuStyle={{
              borderRadius: '3px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
              background: 'white',
              padding: '2px 0',
              fontSize: '90%',
              position: 'fixed',
              overflow: 'auto',
              maxHeight: '35%',
              zIndex: '5000000',
            }}
            items={tokens.map(token => {
              return { id: token.address, label: token.label }
            })}
            shouldItemRender={(item, value) => item.label.toLowerCase().includes(value.toLowerCase())}
            getItemValue={item => item.id}
            renderItem={(item, highlighted) =>
              <div
                key={item.id}
                style={{ backgroundColor: highlighted ? '#eee' : '#fff' }}
              >
                {item.label}
              </div>
            }
            value={this.props.field.$('address').value}
            onSelect={this._onSelect}
            onChange={this._onChange}
          />
          <p className='help-text normal-margin-ugh'>
            {this.props.field.$('address').error || <span>&nbsp;</span>}
          </p>
        </div>
      </div>
    )
  }
}

export default InputTokenField
