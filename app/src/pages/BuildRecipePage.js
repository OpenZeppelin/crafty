import React from 'react'
import { action, observable, runInAction, when } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Input from '../components/Input'
import WithWeb3Context from '../components/WithWeb3Context'
import BlockingLoader from '../components/BlockingLoader'
import SectionLoader from '../components/SectionLoader'
import InputTokenField from '../components/InputTokenField'

import makeERC20 from '../models/ERC20'

import buildRecipeForm from '../forms/BuildRecipe'

import { uid } from '../util'

@inject('store')
@observer
class BuildRecipePage extends React.Component {
  @observable deploying = false
  @observable playing = false
  @observable totallyDone = false
  @observable tokenAddress
  @observable form = null

  constructor (props) {
    super(props)

    this._lazyInitForm()
  }

  _lazyInitForm = async () => {
    const start = Date.now()

    await when(() => !this.props.store.domain.isLoadingCanonicalTokens)
    const finished = Date.now()
    const diff = finished - start // ms

    const minimumDelay = 800
    const timeLeft = minimumDelay - diff
    const restDelay = Math.max(0, timeLeft)

    setTimeout(action(() => {
      this.form = buildRecipeForm(this.props.store.domain.canonicalTokensInfo)

      // add initial input
      this._addInput()
    }), restDelay)
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
      this.playing = true

      const crafty = this.props.store.domain.crafty
      const values = this.form.values()
      const ingredients = values.inputs.map(i => i.address)

      const ERC20 = makeERC20(this.props.store)

      // A bit hacky - we need to fetch the decimals for each token in order to calculate
      // the actual number of required tokens for each ingredient
      values.inputs.forEach(i => i.token = new ERC20(i.address))
      await when(() => values.inputs.every(i => {
        const decimals = i.token.decimals.current()
        if (decimals === null) {
          return false
        }

        // Due to a mobx restriction, we can't call current() in deploy, so we store this value
        i.decimals = decimals.toNumber()
        return true
      }))

      // The inputed amounts are then converted to token units using the decimals
      const amounts = values.inputs.map(i => Math.ceil(Number(i.amount) * (10 ** i.decimals)))

      const tokenMetadataURI = await this.uploadMetadata(values.name, values.description, values.image)

      const tokenAddress = await crafty.addCraftable(
        values.name,
        values.symbol,
        tokenMetadataURI,
        ingredients,
        amounts
      )
      runInAction(() => {
        this.tokenAddress = tokenAddress
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction(() => {
        this.deploying = false
      })
    }
  }

  async uploadMetadata (name, description, image) {
    const API = this.props.store.config.api

    // The image is stored as a base64 string, we remove the preffix to only send the encoded binary file
    const imageResponse = await axios.post(`${API}/thumbnail`, { 'image-base64': image.split(/,/)[1] })
    if (imageResponse.status !== 200) {
      throw new Error(`Unexpected API response: ${imageResponse.status}`)
    }

    // The image URL is then stored in the metadata
    const metadataResponse = await axios.post(`${API}/metadata`, {
      'name': name,
      'description': description,
      'image': imageResponse.data,
    })

    if (metadataResponse.status !== 200) {
      throw new Error(`Unexpected API response: ${metadataResponse.status}`)
    }

    return metadataResponse.data
  }

  render () {
    this.form && this.form.validate()
    return (
      <div>
        <Header/>
        {this.totallyDone &&
          <Redirect push to={`/craft/${this.tokenAddress}`} />
        }
        <BlockingLoader
          title='Deploying your Craftable Token'
          open={this.playing}
          canClose={!this.deploying}
          requestClose={this.closeLoader}
        />

        <WithWeb3Context read write render={() => (
          <div className='mosaic-background'>
            <SectionLoader
              loading={!this.form}
              render={() =>
                <div className='craftable-token-form'>
                  <Input field={this.form.$('image')} />
                  <div>
                    <div className='craft-form-card'>
                      <div className='grid-x grid-margin-x'>
                        <div className='cell small-12 medium-6'>
                          <Input field={this.form.$('name')} />
                        </div>
                        <div className='cell small-12 medium-6'>
                          <Input field={this.form.$('symbol')} />
                        </div>
                      </div>
                      <Input field={this.form.$('description')} />
                    </div>
                  </div>
                </div>
              }/>
            <div>
              <div className='grid-container medium'>
                <p className='black-bold-text'>Add Ingredients</p>
              </div>
            </div>
            <div className='recipe-background'>
              <SectionLoader
                loading={!this.form}
                render={() =>
                  <div className='grid-container'>
                    <div className='grid-x grid-margin-x'>
                      {this.form.$('inputs').map((field, index) =>
                        <InputTokenField
                          key={index}
                          field={field}
                          editing />
                      )}
                      <div className='small-12 medium-6 large-4'>
                        <button
                          className='one-more-token-button'
                          onClick={this._addInput}
                        > + ADD ANOTHER INGREDIENT </button>
                      </div>
                    </div>
                  </div>
                } />
            </div>
            <div className='recipe-submit-container'>
              <SectionLoader
                loading={!this.form}
                render={() =>
                  <div className='grid-x grid-margin-x align-center'>
                    <div className='cell shrink grid-y align-center'>
                      {!this.form.isValid && this.form.error}
                      <button
                        className='btn'
                        onClick={this.deploy}
                        disabled={this.playing || !this.form.isValid || !this._canDeploy()}
                      >
                      CREATE RECIPE
                      </button>
                      {!this._canDeploy() &&
                      <p className='cell help-text'>
                        {'We can\'t find the crafty contract! Are you on the right network?'}
                      </p>
                      }
                    </div>
                  </div>
                } />
            </div>
          </div>
        )} />
        <Footer />
      </div>
    )
  }
}

export default BuildRecipePage
