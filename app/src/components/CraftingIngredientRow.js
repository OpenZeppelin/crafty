import React from 'react'
import { observer } from 'mobx-react'

import Input from './Input'

const CraftingIngredientRow = observer(({ token, amount, balance, decimals, image, field }) => {
  const valueFormatter = token.valueFormatter

  return (
    <div className='grid-x grid-padding-x align-middle'>
      <div className='cell auto grid-y'>
        <p>{token.shortName} ({token.shortSymbol})</p>
        <p className='help-text'>
          {valueFormatter(balance)} {token.shortSymbol}
        </p>
        <img
          className='cell shrink craftable-image'
          alt='the ingredient token'
          src={image}
        />
      </div>
      <div className='cell auto'>
        <p>x{valueFormatter(amount)}</p>
      </div>
      <div className='cell shrink'>
        <Input
          pending={field.$('pending').values()}
          field={field.$('approved')}
        />
      </div>
    </div>
  )
})

export default CraftingIngredientRow
