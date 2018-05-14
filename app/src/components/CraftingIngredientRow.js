import React from 'react'
import { observer } from 'mobx-react'

import Input from './Input'

const CraftingIngredientRow = observer(({ token, amount, balance, decimals, image, field }) => (
  <div className='ingredient-row align-middle'>
    <div className='grid-y'>
      <img
        alt='the ingredient token'
        src={image}
      />
    </div>
    <div>
      <div>
        <p>{token.shortName} ({token.shortSymbol})</p>
        <Input
          pending={field.$('pending').values()}
          field={field.$('approved')}
        />
      </div>
      <div className='shrink'>
        <p className='help-text'>
          {(balance / (10 ** decimals)).toString(10)} {token.shortSymbol}
        </p>
        <p>x{(amount / (10 ** decimals)).toString(10)}</p>
      </div>
    </div>
  </div>
))

export default CraftingIngredientRow
