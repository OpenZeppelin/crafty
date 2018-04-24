import React from 'react'
import { observer } from 'mobx-react'
import BN from 'bn.js'

import Input from './Input'

const CraftingIngredientRow = observer(({ token, amount = new BN(0), field }) => (
  <div className='grid-x grid-padding-x align-middle'>
    <div className='cell auto'>
      <p>{token.shortName} ({token.shortSymbol})</p>
    </div>
    <div className='cell auto'>
      <p>x{amount.toString(10)}</p>
    </div>
    <div className='cell shrink'>
      <Input
        pending={field.$('pending').values()}
        field={field.$('approved')}
      />
    </div>
  </div>
))

export default CraftingIngredientRow
