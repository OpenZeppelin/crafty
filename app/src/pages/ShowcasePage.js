import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import CraftableTokenFeed from '../components/CraftableTokenFeed'
import SectionHeader from '../components/SectionHeader'

@inject('store')
@observer
class ShowcasePage extends React.Component {
  render () {
    const { match, store } = this.props
    const { domain } = store
    return (
      <div>
        <Header>My Craftable Tokens</Header>
        <Subtitle>
          Here are all of your Craftable Tokens and Recipes
        </Subtitle>
        <SectionHeader>
          My Craftable Tokens
        </SectionHeader>
        {domain.crafty &&
          <CraftableTokenFeed
            tokens={domain.myCraftedTokens.get()}
            withBalanceOfAddress={match.params.address}
          />
        }

        <SectionHeader>
          My Recipes
        </SectionHeader>

        <Footer />
      </div>
    )
  }
}

export default ShowcasePage
