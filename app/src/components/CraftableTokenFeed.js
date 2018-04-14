import React from 'react'
import { observer } from 'mobx-react'

import CraftableTokenCard from './CraftableTokenCard'

const CraftableTokenFeed = observer(({ tokens }) => (
  <div className='grid-container'>
    <div className='grid-x grid-margin-x'>
      {tokens && tokens.map(t =>
        <CraftableTokenCard
          key={t.address}
          className='cell medium-6 large-4'
          token={t}
        />
      )}
    </div>
  </div>
))

export default CraftableTokenFeed
