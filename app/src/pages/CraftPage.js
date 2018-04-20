import React from 'react'
import { action, observable, runInAction } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Redirect } from 'react-router-dom'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'
import Input from '../components/Input'
import WithWeb3Context from '../components/WithWeb3Context'
import BlockingLoader from '../components/BlockingLoader'

import InputTokenField from '../components/InputTokenField'

import createCraftableForm from '../forms/CreateCraftable'

import { uid } from '../util'

@inject('store')
@observer
class CraftPage extends React.Component {
  @observable deploying = false
  @observable playing = false
  @observable totallyDone = false
  @observable tokenAddress

  constructor (props) {
    super(props)

    this.form = createCraftableForm()

    // add initial input
    this._addInput()
  }

  _canDeploy = () => {
    const crafty = this.props.store.domain.crafty
    if (!crafty) { return false }

    return true
  }

  _addInput = () => {
    this.form.$('inputs').add({ id: uid() })
  }

  @action
  closeLoader = () => {
    this.playing = false
    this.totallyDone = true
  }

  @action
  deploy = async () => {
    if (!this._canDeploy()) { return }
    this.deploying = true

    try {
      const crafty = this.props.store.domain.crafty
      const values = this.form.values()
      const ingredients = values.inputs.map(i => i.address)
      const amounts = values.inputs.map(i => i.amount)

      const tokenAddress = await crafty.addCraftable(
        values.name,
        values.symbol,
        ingredients,
        amounts,
      )
      runInAction(() => {
        this.tokenAddress = tokenAddress
        this.totallyDone = true
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction(() => {
        this.deploying = false
      })
    }
  }

  render () {
    this.form.validate()
    return (
      <div>
        {this.totallyDone &&
          <Redirect to={`/craft/${this.tokenAddress}`} />
        }
        <BlockingLoader
          title='Deploying your Craftable Token'
          open={this.playing}
          canClose={!this.deploying}
          finishText='Done deploying! You can continue playing or return to the Crafting Game'
          requestClose={this.closeLoader}
        />
        <Header>Build a Craftable Token</Header>
        <Subtitle>
          Here you can <b>create your own craftable token</b>.
          Choose the sacrificial ERC20 tokens and then describe your creation.
        </Subtitle>
        <WithWeb3Context read write render={() => (
          <div>
            <SectionHeader>
              <code>01.</code> Sacrificial Tokens
            </SectionHeader>

            <div className='grid-container'>
              <div className='grid-x grid-margin-x'>
                <div className='cell auto'>
                  {this.form.$('inputs').map(field =>
                    <InputTokenField
                      key={field.id}
                      field={field}
                      editing
                    />
                  )}
                  <button
                    className='button'
                    onClick={this._addInput}
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
                  <Input field={this.form.$('image')} />
                  <div className='grid-x grid-margin-x'>
                    <div className='cell small-12 medium-6'>
                      <Input field={this.form.$('name')} />
                    </div>
                    <div className='cell small-12 medium-6'>
                      <Input field={this.form.$('symbol')} />
                    </div>
                  </div>
                  <Input field={this.form.$('description')} />
                  {/* <Input field={this.form.$('rate')} /> */}
                </div>
              </div>
            </div>

            <SectionHeader>
              <code>03.</code> Deploy
            </SectionHeader>

            <div className='grid-container'>
              <div className='grid-x grid-margin-x align-center'>
                <div className='cell text-center'>
                  {this.form.error}
                </div>
              </div>
              <div className='grid-x grid-margin-x align-center'>
                <div className='cell shrink grid-y align-center'>
                  <button
                    className='cell button inverted'
                    onClick={this.deploy}
                    disabled={!this.form.isValid || !this._canDeploy()}
                  >
                  Deploy em&#39;
                  </button>
                  {!this._canDeploy() &&
                <p className='cell help-text'>
                  {'We can\'t find the crafty contract! Are you on the right network?'}
                </p>
                  }

                </div>
              </div>
            </div>
          </div>
        )} />
        <Footer />
      </div>
    )
  }
}

export default CraftPage
