import React from 'react'
import { computed } from 'mobx'
import { observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'

import Input from './Input'
import ExtendedERC20 from '../models/ExtendedERC20'
import Autocomplete from 'react-autocomplete'

import RootStore from '../store/RootStore'

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

  render () {
    return (
      <div className={`small-12 medium-6 large-4 new-recipe-grid-col ${this.deleting ? 'deleting' : ''}`}>
        <div className="ingredient-row new-recipe-row align-middle input-token-field">
          <div>
            <img
              className='token-img'
              alt='the token'
              src={this.inferredToken ? this.inferredToken.image : 'https://s2.coinmarketcap.com/static/img/coins/128x128/2165.png'}
            />
          </div>
          <div className="craftable-ingredient-info new-recipe-ingredient">
            <div>
              {this._renderTokenSelector()}
            </div>
            <div className="ammount-field">
              <Input field={this.props.field.$('amount')} />
            </div>
            {this.props.editing &&
              <div>
                <button
                  className='remove-btn'
                  onClick={this._remove}
                >
                  <img
                    src="./images/delete.svg"
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
    const tokens = RootStore.domain.craftableTokens.concat(RootStore.domain.canonicalTokens).sort((lhs, rhs) => lhs.label > rhs.label)

    return (
      <div className='grid-x grid-margin-x'>
        <div className='cell auto token-field'>
          <label>{this.inferredToken ? this.inferredToken.label : 'Token Address'}</label>
          <Autocomplete
            items={tokens.map(token => {
              return { id: token.address, label: token.label }
            })}
            shouldItemRender={(item, value) => item.label.toLowerCase().includes(value.toLowerCase())}
            getItemValue={item => item.id}
            renderItem={(item, highlighted) =>
              <div
                key={item.id}
                style={{ backgroundColor: highlighted ? '#eee' : '#fff'}}
              >
                {item.label}
              </div>
            }
            {...this.props.field.$('address').bind()}
            onSelect={value => this.props.field.$('address').value = value}
          />
        </div>
      </div>
    )
  }
}

export default InputTokenField
