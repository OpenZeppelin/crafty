import React from 'react'
import { observer } from 'mobx-react'

import Input from './Input'

const CraftingIngredientRow = observer(({ token, field }) => (
  <div className='grid-x grid-padding-x'>
    <div className='cell'>
      <p>${token.shortName} (${token.shortSymbol})</p>
    </div>
    <div className='cell'>
      <Input
        field={field.$('approved')}
      />
    </div>
  </div>
))

export default CraftingIngredientRow
