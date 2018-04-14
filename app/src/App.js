import React, { Component } from 'react'
import { configure } from 'mobx'
import { observer, inject } from 'mobx-react'
import CraftableTokenCard from './components/CraftableTokenCard'
import IndexPage from './pages/IndexPage'

configure({ enforceActions: true })

@inject('store')
@observer
class App extends Component {
  render () {
    const { web3Context } = this.props.store
    return (
      <div>
        <IndexPage />
        <p>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {!web3Context.web3 &&
          <p>No web3 injected at all</p>
        }
        {web3Context.web3 && !web3Context.currentAddress &&
          <p>web3 injected but locked</p>
        }
        {web3Context.web3 && web3Context.currentAddress &&
          <div>
            <p>
              NetworkId: {web3Context.network.id}
            </p>
            <p>
              NetworkDesc: {web3Context.network.description}
            </p>
            <p>
              Is Metamask?: {this.props.store.ui.isMetaMask ? 'true' : 'false'}
            </p>
            <p>
              Current Address: {web3Context.currentAddress}
            </p>
            {!this.props.store.domain.crafty &&
              <p>No Crafty avalable</p>
            }
            {this.props.store.domain.crafty &&
              <div>
                <p>Crafty: {this.props.store.domain.crafty.address}</p>
                {this.props.store.domain.crafty.craftableTokens.get().map(t =>
                  <CraftableTokenCard key={t.address} token={t} />
                )}
              </div>
            }
          </div>
        }
        {this.props.store.ui.error &&
          <code>
            {this.props.store.ui.error.toString()}
          </code>
        }
      </div>
    )
  }
}

export default App
