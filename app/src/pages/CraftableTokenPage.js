import React from 'react'
import { observable, computed, when, runInAction } from 'mobx'
import { observer, inject } from 'mobx-react'
import { asyncComputed } from '../util'
import some from 'lodash/some'
import keyBy from 'lodash/keyBy'
import BN from 'bn.js'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'
import WithWeb3Context from '../components/WithWeb3Context'
import EmptyState from '../components/EmptyState'
import SectionLoader from '../components/SectionLoader'

import CraftableToken from '../models/CraftableToken'
import RootStore from '../store/RootStore'

import craftCraftableForm from '../forms/CraftCraftable'
import CraftingIngredientRow from '../components/CraftingIngredientRow'

@inject('store')
@observer
class CraftableTokenPage extends React.Component {
  @observable form = null

  constructor (props) {
    super(props)

    this._lazyLoadForm()
  }

  componentWillUnmount () {
    // this.stopSyncingToForm()
  }

  _lazyLoadForm = async () => {
    await when(() => this.token)
    // we have token, so let's render its ingredients
    await when(() => this.token.ingredients.length)
    // now we have ingredients so let's create the form with defaults

    runInAction(() => {
      this.form = craftCraftableForm({
        values: {
          approvals: this.token.ingredients.map(i => ({
            address: i.address,
            approved: false,
          })),
        },
      })

      console.log(this.form.values(), this.form.$('approvals').values())
    })

    await when(() => !this.isLoadingApprovals)
    // we've generated observable approval info
    // so @TODO attach it to the form values
  }

  @computed get ingredientsByAddress () {
    return keyBy(this.token.ingredients, (i) => i.address)
  }

  @computed get approvalsInfo () {
    return this.allowances.current().map(a => ({
      busy: a.busy(),
      approved: a.current().gt(new BN(0)),
    }))
  }

  allowances = asyncComputed([], async () => {
    if (!this.token) { return [] }

    return this.token.ingredients.map(i =>
      i.allowance({
        owner: RootStore.web3Context.currentAddress,
        spender: RootStore.domain.crafty.address,
      })
    )
  })

  @computed get isLoadingApprovals () {
    const anyBusy = this.approvalsInfo.map(ai => ai.busy)
    return this.approvalsInfo.length === 0 || some(anyBusy)
  }

  @computed get token () {
    const address = this.props.match.params.address
    const web3 = this.props.store.web3Context.web3

    if (!web3) { return null }
    if (!web3.utils.isAddress(address)) { return null }

    return new CraftableToken(address)
  }

  @computed get allApproved () {
    return false
  }

  _approvalText = () => {
    return this.allApproved
      ? 'You\'ve approved all of the relevant token contracts, nice!'
      : 'You must approve Crafty to spend tokens from your balance.'
  }

  render () {
    return (
      <div>
        <Header>Craft a Token</Header>
        {!this.token &&
          <div className='grid-container'>
            <div className='grid-x grid-margin-x'>
              <div className='cell auto'>
                <EmptyState />
              </div>
            </div>
          </div>
        }

        <WithWeb3Context read render={() => (
          <div className='grid-container'>
            <div className='grid-x grid-margin-x'>
              <div key='img' className='cell small-12 medium-shrink'>
                <img
                  src={this.token.imageUri}
                  alt='the token'
                />
              </div>
              <div key='text' className='cell small-12 medium-auto grid-y'>
                <div className='cell shrink'>
                  <h3>{this.token.name.current()}</h3>
                </div>
                <div className='cell auto grid-x align-middle'>
                  <p className='cell'>{this.token.description}</p>
                </div>
              </div>
              <div key='content' className='cell'>
              </div>
            </div>

          </div>
        )} />

        <SectionHeader>
          Craft &#34;{
            this.token
              ? this.token.name.current()
              : 'Loading...'
          }&#34;
        </SectionHeader>

        <WithWeb3Context read write render={() => (
          <SectionLoader
            loading={!this.form}
            render={() =>
              <div>
                <Subtitle>
                  {this._approvalText()}
                </Subtitle>
                <div className='grid-container'>
                  <div className='grid-x grid-margin-x'>
                    {this.form.$('approvals').map(f =>
                      <CraftingIngredientRow
                        key={f.id}
                        token={this.ingredientsByAddress[f.$('address').values()]}
                        field={f}
                      />
                    )}
                  </div>
                </div>
              </div>
            }
          />
        )} />

        <Footer />
      </div>
    )
  }
}

export default CraftableTokenPage
