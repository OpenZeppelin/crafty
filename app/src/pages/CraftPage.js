import React from 'react'
import { observable, action, computed, toJS } from 'mobx'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'
import Input from '../components/Input'

import Validator from 'validatorjs'
import InputTokenField from '../components/InputTokenField'

const rules = {
  name: 'required|string|alpha_num|between:4,42',
  symbol: 'required|string|between:2,10',
  description: 'required|string|between:10,140',
  rate: 'required|integer|min:1',
  inputs: 'array',
  'inputs.*.address': 'required|string|alpha_num|size:42',
  'inputs.*.amount': 'required|integer|min:1',
}

@inject('store')
@observer
class CraftPage extends React.Component {
  @observable data = {
    name: '',
    symbol: '',
    description: '',
    rate: '1',
    inputs: [],
  }

  constructor (props) {
    super(props)

    this._addToken()
  }

  @computed get validation () {
    const v = new Validator(toJS(this.data), rules)
    v.check() // force check -_-
    return v
  }

  @computed get passes () {
    return this.validation.passes()
  }

  @computed get fails () {
    return this.validation.fails()
  }

  @computed get errors () {
    return this.validation.errors
  }

  @action
  _update = (k, v) => {
    this.data[k] = v
  }

  _updateUpperCase = (k, v) => {
    this._update(k, v.toUpperCase())
  }

  @action
  _addToken = () => {
    this.data.inputs.push({
      canonical: true,
      address: '',
      amount: '1',
    })
  }

  @action
  _removeToken = (tokenId) => {
    this.data.inputs.splice(tokenId, 1)
  }

  _canDeploy = () => {
    const crafty = this.props.store.domain.crafty
    if (!crafty) { return false }

    return true
  }

  deploy = async () => {
    if (!this._canDeploy()) { return }
    this.loading = true

    try {
      const crafty = this.props.store.domain.crafty
      const ingredients = this.data.inputs.map(i => i.address)
      const amounts = this.data.inputs.map(i => i.amount)

      await crafty.contract.methods.addCraftable(
        ingredients,
        amounts,
        this.data.name,
        this.data.symbol,
        this.data.rate,
      ).send()
    } catch (error) {
      console.error(error)
    } finally {
      this.loading = false
    }
  }

  render () {
    return (
      <div>
        <Header>Build a Craftable Token</Header>
        <Subtitle>
          Here you can <b>create your own craftable token</b>.
          Choose the sacrificial ERC20 tokens and then describe your creation.
        </Subtitle>
        <SectionHeader>
          <code>01.</code> Sacrificial Tokens
        </SectionHeader>

        <div className='grid-container'>
          <div className='grid-x grid-margin-x'>
            <div className='cell auto'>
              {this.data.inputs.map((input, i) =>
                <InputTokenField
                  key={i}
                  value={input}
                  tokenId={i}
                  onRemove={this._removeToken}
                  editing
                  errors={this.errors}
                />
              )}
              <button
                className='button'
                onClick={this._addToken}
              >
                + Add Token
              </button>
            </div>
          </div>
        </div>

        <SectionHeader>
          <code>02.</code> Describe Your New Craftable Token
        </SectionHeader>

        <div className='grid-container'>
          <div className='grid-x grid-margin-x'>
            <div className='cell auto'>
              <div className='grid-x grid-margin-x'>
                <div className='cell small-12 medium-6'>
                  <Input
                    id='name'
                    name='name'
                    label="Your Craftable Token's Name"
                    placeholder='A nice token.'
                    value={this.data.name}
                    onChange={this._update}
                    error={this.errors.first('name')}
                  />
                </div>
                <div className='cell small-12 medium-6'>
                  <Input
                    id='symbol'
                    name='symbol'
                    label="Your Craftable Token's Symbol"
                    placeholder='TKN'
                    value={this.data.symbol}
                    onChange={this._updateUpperCase}
                    error={this.errors.first('symbol')}
                  />
                </div>
              </div>
              <Input
                id='description'
                name='description'
                type='textarea'
                label='Describe Your Craftable Token'
                placeholder='A nice token.'
                value={this.data.description}
                onChange={this._update}
                error={this.errors.first('description')}
              />
              <Input
                id='rate'
                name='rate'
                label='How many Craftable Tokens are created with this recipe?'
                type='number'
                value={this.data.rate}
                onChange={this._update}
                error={this.errors.first('rate')}
              />
            </div>
          </div>
        </div>

        <SectionHeader>
          <code>03.</code> Deploy
        </SectionHeader>

        <div className='grid-container'>
          <div className='grid-x grid-margin-x align-center'>
            <div className='cell shrink'>
              <button
                className='button'
                onClick={this.deploy}
                disabled={this.fails || !this._canDeploy()}
              >
                Deploy em&#39;
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }
}

export default CraftPage
