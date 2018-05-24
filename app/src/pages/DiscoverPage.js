import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import CraftableTokenFeed from '../components/CraftableTokenFeed'
import SectionHeader from '../components/SectionHeader'
import WithWeb3Context from '../components/WithWeb3Context'
import EmptyState from '../components/EmptyState'

@inject('store')
@observer
class DiscoverPage extends React.Component {
  render () {
    const { domain } = this.props.store
    return (
      <div>
        <Header>Discover Craftable Tokens</Header>
        <Subtitle>
          {'Here are the tokens, have fun!'}
        </Subtitle>
        <SectionHeader>
          All Craftable Tokens
        </SectionHeader>
        <WithWeb3Context read render={() => (
          <CraftableTokenFeed
            emptyChildren={() => <EmptyState />}
            tokens={domain.craftableTokens}
            isLoading={domain.crafty.craftableTokenAddresses.busy()}
          />
        )} />
        <Footer />
      </div>
    )
  }
}

export default DiscoverPage
