import React from 'react'
import { action, observable, runInAction, when, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import _ from 'lodash'

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

const BuildRecipeForm = observer(({
  form,
  addInput,
  deploy,
  playing,
  canDeploy,
}) => {
  return (
    <WithWeb3Context read write render={() => (
      <div className='mosaic-background'>
        <SectionLoader
          loading={!form}
          render={() =>
            <div className='craftable-token-form'>
              <Input field={form.$('image')} />
              <div>
                <div className='craft-form-card'>
                  <div className='grid-x grid-margin-x'>
                    <div className='cell small-12 medium-6'>
                      <Input field={form.$('name')} />
                    </div>
                    <div className='cell small-12 medium-6'>
                      <Input field={form.$('symbol')} />
                    </div>
                  </div>
                  <Input field={form.$('description')} />
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
            loading={!form}
            render={() =>
              <div className='grid-container'>
                <div className='grid-x grid-margin-x'>
                  {form.$('inputs').map((field, index) =>
                    <InputTokenField
                      key={index}
                      field={field}
                      editing />
                  )}
                  <div className='small-12 medium-6 large-4'>
                    <button
                      className='one-more-token-button'
                      onClick={addInput}
                    > + ADD ANOTHER INGREDIENT </button>
                  </div>
                </div>
              </div>
            } />
        </div>
        <div className='recipe-submit-container'>
          <SectionLoader
            loading={!form}
            render={() =>
              <div className='grid-x grid-margin-x align-center'>
                <div className='cell shrink grid-y align-center'>
                  <button
                    className='btn'
                    onClick={deploy}
                    disabled={playing || !form.isValid || !canDeploy}
                  >
                      CREATE RECIPE
                  </button>
                  {!canDeploy &&
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
  )
})

const Thing = inject('store')(observer(({
  form,
  totallyDone,
  tokenAddress,
  playing,
  deploying,
  closeLoader,
  addInput,
  deploy,
  canDeploy,
}) => {
  return (
    <div>
      <Header/>
      {totallyDone &&
          <Redirect to={`/craft/${tokenAddress}`} />
      }
      <BlockingLoader
        title='Deploying your Craftable Token'
        open={playing}
        canClose={!deploying}
        requestClose={closeLoader}
      />

      <BuildRecipeForm
        form={form}
        addInput={addInput}
        deploy={deploy}
        playing={playing}
        canDeploy={canDeploy}
      />

      <Footer />
    </div>
  )
}))

@inject('store')
@observer
class BuildRecipePage extends React.Component {
  @observable deploying = false
  @observable playing = false
  @observable totallyDone = false
  @observable tokenAddress
  @observable form = (() => {
    const form = buildRecipeForm()
    form.$('inputs').add({ id: uid() })
    form.$('inputs').observe(({ path, field }) => {
      const values = field.values()
      values.reverse()
      const fields = field.fields.values()
      const count = _.countBy(_.map(values, v => v.address))
      _.forEach(count, (v, k) => {
        if (v > 1) {
          // there's a duplicate at k
          let field
          for (const f of fields) {
            console.log(k, f.$('address').values())
            if (f.$('address').values() === k) {
              field = f
              break
            }
          }
          if (field) {
            console.log('invalidating field', field.path)
            field.$('address').invalidate('Already included!')
          }
        }
      })
    })
    return form
  })()

  // has Crafty?
  @computed get canDeploy () {
    return !!this.props.store.domain.crafty
  }

  _addInput = () => {
    const form = this.form
    form.$('inputs').add({ id: uid() })
  }

  @action
  closeLoader = () => {
    this.playing = false
    this.totallyDone = true
  }

  @action
  deploy = async () => {
    const form = this.form
    if (!this.canDeploy) { return }
    this.deploying = true

    try {
      this.playing = true

      const crafty = this.props.store.domain.crafty
      const values = form.values()
      const ingredients = values.inputs.map(i => i.address)

      const ERC20 = makeERC20(this.props.store)

      // A bit hacky - we need to fetch the decimals for each token in order to calculate
      // the actual number of required tokens for each ingredient
      values.inputs.forEach(i => { i.token = new ERC20(i.address) })
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
    return (
      <Thing
        form={this.form}
        totallyDone={this.totallyDone}
        tokenAddress={this.tokenAddress}
        playing={this.playing}
        deploying={this.deploying}
        closeLoader={this.closeLoader}
        addInput={this._addInput}
        deploy={this.deploy}
        canDeploy={this.canDeploy}
      />
    )
  }
}

export default BuildRecipePage
