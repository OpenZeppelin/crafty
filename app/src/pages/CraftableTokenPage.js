import React from 'react'
import { observe, computed, observable, action } from 'mobx'
import { observer, inject } from 'mobx-react'
import { asyncComputed } from 'computed-async-mobx'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'
import WithWeb3Context from '../components/WithWeb3Context'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'

import CraftableToken from '../models/CraftableToken'

@inject('store')
@observer
class CraftableTokenPage extends React.Component {
  componentDidMount () {
    // auto dispose
    observe(this.disposers, (change) => {
      if (change.type === 'del') {
        debugger
        change.oldValue()
      }
    })
  }

  componentWillUnmount () {
    this.disposers.forEach(d => d())
  }

  @computed get disposers () {

    // watch token.ingredients
  }

  approvals = asyncComputed([], 1000, async () => {
    const token = this.token
  })

  @computed get token () {
    const address = this.props.match.params.address
    const web3 = this.props.store.web3Context.web3

    if (!web3) { return null }
    if (!web3.utils.isAddress(address)) { return null }

    return new CraftableToken(web3, address)
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
                  <h3>{this.token.name.get()}</h3>
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

        {this.token &&
          <div>
            <SectionHeader>
              Craft &#34;{this.token.name.get()}&#34;
            </SectionHeader>
          </div>
        }

        <WithWeb3Context read write render={() => (
          <div>
            <Subtitle>
              You must approve Crafty to spend tokens from your balance.
            </Subtitle>
            <div className='grid-container'>
              <div className='grid-x grid-margin-x'>
                {/* {this.form.$('approvals').map(f =>
                  <Input
                    key={'test'}
                    field={f.$('approved')}
                  />
                )} */}
              </div>
            </div>
          </div>
        )} />

        <Footer />
      </div>
    )
  }
}

export default CraftableTokenPage
