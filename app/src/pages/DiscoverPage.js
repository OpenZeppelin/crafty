import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import CraftableTokenFeed from '../components/CraftableTokenFeed'
import SectionHeader from '../components/SectionHeader'

@inject('store')
@observer
class DiscoverPage extends React.Component {
  render () {
    const { domain } = this.props.store
    return (
      <div>
        <Header>Discover Craftable Tokens</Header>
        <Subtitle>
          {'Here\'s literally all of the craftable tokens we can find, have fun.'}
        </Subtitle>
        <SectionHeader>
          All Craftable Tokens
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

export default DiscoverPage
