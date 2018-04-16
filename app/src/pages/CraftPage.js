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
}, {
  name: 'Aragon Network Token',
  symbol: 'ANT',
  address: '0xEC6d36A487d85CF562B7b8464CE8dc60637362AB',
}]

const fields = [
  'name',
  'symbol',
  'description',
  'rate',
  'image',
  'inputs',
  'inputs[].canonical',
  'inputs[].address',
  'inputs[].amount',
]

const types = {
  'name': 'text',
  'symbol': 'text',
  'description': 'text',
  'rate': 'number',
  'image': 'file',
  'inputs': 'array',
  'inputs[].canonical': 'checkbox',
  'inputs[].address': 'text',
  'inputs[].amount': 'number',
}

const values = {
  name: '',
  symbol: '',
  description: '',
  rate: 1,
  image: '',
  inputs: [],
}

const labels = {
  name: 'Your Craftable Token\'s Name',
  symbol: 'Your Craftable Token\'s Symbol',
  description: 'Describe Your Craftable Token',
  rate: 'How many Craftable Tokens are created with this recipe?',
  image: 'Your Craftable Token\'s Image',
  inputs: 'Sacrificial Tokens',
  'inputs[].canonical': 'Canonical Token?',
  'inputs[].address': 'Token',
  'inputs[].amount': 'How many are required?',
}

const placeholders = {
  name: 'A nice token.',
  symbol: 'TKN',
  description: 'This is a nice token.',
  'inputs[].address': '0x0',
}

const rules = {
  name: 'required|string|alpha_num|between:4,42',
  symbol: 'required|string|between:2,10',
  description: 'required|string|between:10,140',
  rate: 'required|integer|min:1',
  'inputs[].canonical': 'required|boolean',
  'inputs[].address': 'required|string|alpha_num|size:42',
  'inputs[].amount': 'required|integer|min:1',
}

const extra = {
  'inputs[].address': canonicalTokens.map(ct => ({
    k: ct.address,
    v: `${ct.name} (${ct.symbol})`,
  })),
}

const defaults = {
  'inputs[].canonical': true,
  'inputs[].amount': 1,
  'inputs[].address': extra['inputs[].address'][0].k,
}

const initials = {
  ...defaults,
}

@inject('store')
@observer
class CraftPage extends React.Component {
  constructor (props) {
    super(props)

    this.form = new MobxReactForm({
      fields, types, values, labels, placeholders, rules, extra, defaults, initials,
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

    this.form.$('inputs').onAdd({ preventDefault: () => {} })
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
    console.log(
      this.form.$('inputs')
        .map(t => t)
        .map(f => f.$('address').values())
    )
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
                onClick={this.form.$('inputs').onAdd}
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
