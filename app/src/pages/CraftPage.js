import React from 'react'
import { observer, inject } from 'mobx-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Subtitle from '../components/Subtitle'
import SectionHeader from '../components/SectionHeader'

@inject('store')
@observer
class CraftPage extends React.Component {
  render () {
    return (
      <div>
        <Header>Build a Craftable Token</Header>
        <Subtitle>
          Here you can <b>create your own craftable token</b>.
          Choose the sacrificial ERC20 tokens and then describe your creation.
        </Subtitle>
        <SectionHeader>
          <code>01.</code> Sacrificial Tokens
        </SectionHeader>

        <SectionHeader>
          <code>02.</code> Describe Your New Craftable Token
        </SectionHeader>

        <SectionHeader>
          <code>03.</code> Deploy
        </SectionHeader>

        <Footer />
      </div>
    )
  }
}

export default CraftPage
