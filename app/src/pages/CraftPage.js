import React from 'react'
import { action } from 'mobx'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'
import Input from '../components/Input'

import MobxReactForm from 'mobx-react-form'
import validatorjs from 'validatorjs'
import InputTokenField from '../components/InputTokenField'

const canonicalTokens = [{
  name: 'Zeppelin OS',
  symbol: 'ZEP',
  address: '0xEC6d36A487d85CF562B7b8464CE8dc60637362AC',
}]

const fields = {
  name: {
    name: 'name',
    label: 'Your Craftable Token\'s Name',
    placeholder: 'A nice token.',
    value: '',
    rules: 'required|string|alpha_num|between:4,42',
  },
  symbol: {
    name: 'symbol',
    label: 'Your Craftable Token\'s Symbol',
    placeholder: 'TKN',
    value: '',
    rules: 'required|string|between:2,10',
  },
  description: {
    name: 'description',
    type: 'textarea',
    label: 'Describe Your Craftable Token',
    placeholder: 'This is a nice token.',
    rules: 'required|string|between:10,140',
  },
  rate: {
    name: 'rate',
    type: 'number',
    label: 'How many Craftable Tokens are created with this recipe?',
    placeholder: '1',
    value: '1',
    rules: 'required|integer|min:1',
  },
  image: {
    name: 'image',
    type: 'file',
    label: 'Your Craftable Token\'s Image',
  },
  inputs: {
    name: 'inputs',
    type: 'array',
    label: 'Sacrificial Tokens',
    value: [],
  },
  'inputs[].canonical': {
    name: 'canonical',
    type: 'checkbox',
    label: 'Canonical Token?',
    value: true,
    rules: 'required|boolean',
  },
  'inputs[].address': {
    name: 'address',
    type: 'text',
    label: 'Token Address',
    placeholder: '0x0',
    value: '',
    rules: 'required|string|alpha_num|size:42',
    extra: canonicalTokens.map(ct => ({
      k: ct.address,
      v: `${ct.name} (${ct.symbol})`,
    })),
  },
  'inputs[].amount': {
    name: 'amount',
    type: 'number',
    label: 'How many are required?',
    placeholder: '1',
    value: '1',
    rules: 'required|integer|min:1',
  },
}

@inject('store')
@observer
class CraftPage extends React.Component {
  constructor (props) {
    super(props)

    this.form = new MobxReactForm({
      fields,
    }, {
      plugins: { dvr: validatorjs },
    })

    this.form.$('symbol')
      .intercept(({ form, field, change }) => {
        return {
          ...change,
          newValue: change.newValue.toUpperCase(),
        }
      })
    // this._addToken()
  }

  @action
  _addToken = (e) => {
    this.form.$('inputs').onAdd(e, {
      canonical: true,
      address: '',
      amount: '',
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
              {this.form.$('inputs').map((input, i) =>
                <InputTokenField
                  key={i}
                  field={input}
                  editing
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
                  <Input field={this.form.$('name')} />
                </div>
                <div className='cell small-12 medium-6'>
                  <Input field={this.form.$('symbol')} />
                </div>
              </div>
              <Input field={this.form.$('description')} />
              <Input field={this.form.$('rate')} />
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
                onClick={this.form.onSubmit}
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
