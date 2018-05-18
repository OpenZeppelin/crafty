import React from 'react'
import { observer } from 'mobx-react'

const CraftingIngredientRow = observer(({ token, amount, balance, image, field }) => {
  const valueFormatter = token.valueFormatter

  const approved = field.$('approved').values()
  const pending = field.$('pending').values()
  const hasEnough = balance.gte(amount)
  let status = ''
  if (!approved) {
    status = 'Not Approved ➡'
  } else if (pending) {
    status = '...'
  } else if (!hasEnough) {
    status = 'Balance Too Low'
  }

  let imgSrc = '/images/unapproved.svg'
  if (approved) {
    imgSrc = '/images/approved.svg'
  } else if (pending) {
    imgSrc = '/images/pending.svg'
  }

  return (
    <div className='ingredient-row align-middle'>
      <div className='grid-y'>
        <img
          className='token-img'
          alt='the ingredient token'
          src={image}
        />
      </div>
      <div className='craftable-ingredient-info'>
        <div className='craftable-ingredient-row craftable-ingredient-title-row'>
          <h1>{token.shortName}</h1>
          <p className='help-text status'>{status}</p>
          <button
            className='approved-btn'
            onClick={() => { field.$('approved').set(true) }}
            disabled={field.$('pending').values()}
          >
            <img
              src={imgSrc}
              alt={field.$('pending').values() ? 'Pending approval' : ''}
            />
          </button>
        </div>
        <div className='craftable-ingredient-row'>
          <div className='craftable-ingredient-required'>
            <h6>REQUIRED</h6>
            <p>{valueFormatter(amount)} {token.shortSymbol}</p>
          </div>
          <div className='craftable-ingredient-balance'>
            <h6>BALANCE</h6>
            <p
              style={{
                color: hasEnough ? '' : 'red',
              }}
            >
              {valueFormatter(balance)} {token.shortSymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CraftingIngredientRow
