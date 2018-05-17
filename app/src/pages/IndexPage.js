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
class IndexPage extends React.Component {
  render () {
    const { domain } = this.props.store
    return (
      <div>
        <Header>Welcome to the Crafting Game</Header>
        <Subtitle>
          <b>Build recipes</b> that turn ordinary ERC20 tokens
          into <b>craftable tokens</b> that can be <b>literally anything else.</b>
        </Subtitle>
        <SectionHeader>
          Featured Craftable Tokens
        </SectionHeader>
        <WithWeb3Context read render={() => (
          <CraftableTokenFeed
            emptyChildren={() => <EmptyState />}
            tokens={domain.featuredCraftableTokens}
            isLoading={domain.crafty.craftableTokenAddresses.busy()}
          />
        )} />
        <Footer />
      </div>
    )
  }
}

export default IndexPage
