import React from 'react'
import { observer } from 'mobx-react'

import CraftableTokenCard from './CraftableTokenCard'

import './CraftableTokenFeed.css'

const CraftableTokenFeed = observer(({
  tokens,
  isLoading = false,
  emptyChildren = () => null,
  withBalanceOfAddress = null,
}) => (
  <div className='grid-container craftable-token-feed'>
    <div className='grid-x grid-margin-x'>
      {tokens && tokens.map(t =>
        <CraftableTokenCard
          key={t.address}
          className='cell medium-6 large-3'
          token={t}
          withBalanceOfAddress={withBalanceOfAddress}
        />
      )}
      {isLoading &&
        <p>Loading</p>
      }
      {(!tokens || tokens.length === 0) && emptyChildren()}
    </div>
  </div>
))

export default CraftableTokenFeed
