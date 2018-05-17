import React from 'react'
import { observer } from 'mobx-react'

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
          <h1>{token.shortName}</h1>
          <button className="approved-btn"><img src="./images/approved.svg" alt={field.$('pending').values() ? 'Pending approval' : ''}/></button>
        </div>
        <div className="craftable-ingredient-row">
          <div className="craftable-ingredient-required">
            <h6>REQUIRED</h6>
            <p>{valueFormatter(amount)} {token.shortSymbol}</p>
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
