import React from 'react'
import { observer } from 'mobx-react'

import Input from './Input'

// <Input pending={field.$('pending').values()} field={field.$('approved')} />
const CraftingIngredientRow = observer(({ token, amount, balance, image, field }) => {
  const valueFormatter = token.valueFormatter

  return (
    <div className='ingredient-row align-middle'>
      <div className='grid-y'>
        <img
          className="token-img"
          alt='the ingredient token'
          src={image}
        />
      </div>
      <div className="craftable-ingredient-info">
        <div className="craftable-ingredient-row">
          <h1>{token.shortName} ({token.shortSymbol})</h1>
          <button className="approved-btn"><img src="./images/approved.svg" alt={field.$('pending').values() ? 'Pending approval' : ''}/></button>
        </div>
        <div className="craftable-ingredient-row">
          <div className="craftable-ingredient-required">
            <h6>REQUIRED</h6>
            <p>x{valueFormatter(amount)}</p>
          </div>
          <div className="craftable-ingredient-balance">
            <h6>BALANCE</h6>
            <p>
              {valueFormatter(balance)} {token.shortSymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CraftingIngredientRow
