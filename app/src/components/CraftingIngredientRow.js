import React from 'react'
import { observer } from 'mobx-react'

import Input from './Input'

const CraftingIngredientRow = observer(({ token, amount, balance, decimals, image, field }) => (
  <div className='grid-x grid-padding-x align-middle'>
    <div className='cell auto grid-y'>
      <p>{token.shortName} ({token.shortSymbol})</p>
      <p className='help-text'>
        {(balance / (10 ** decimals)).toString(10)} {token.shortSymbol}
      </p>
      <img
        className='cell shrink craftable-image'
        alt='the ingredient token'
        src={image}
      />
    </div>
    <div className='cell auto'>
      <p>x{(amount / (10 ** decimals)).toString(10)}</p>
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
