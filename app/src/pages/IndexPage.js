import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import CraftableTokenFeed from '../components/CraftableTokenFeed'
import SectionHeader from '../components/SectionHeader'

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
        {domain.crafty &&
          <CraftableTokenFeed
            tokens={domain.crafty.craftableTokens.get()}
          />
        }
        <Footer />
      </div>
    )
  }
}

export default IndexPage
