import React from 'react'
import { observer } from 'mobx-react'

const CraftingIngredientRow = observer(({ token, amount, balance, image, field }) => {
  const valueFormatter = token.valueFormatter

  const approved = field.$('approved').values()
  const pending = field.$('pending').values()
  const hasEnough = balance.gte(amount)

  let borderColor = ''
  if (!approved) {
    borderColor = 'orange-row'
  } else if (!hasEnough) {
    borderColor = 'red-row'
  }

  let imgSrc = '/images/unapproved.svg'
  if (pending) {
    imgSrc = '/images/pending.svg'
  } else if (approved) {
    imgSrc = '/images/approved.svg'
  }

  return (
    <div className={`ingredient-row align-middle ${borderColor}`}>
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
            <p style={{ color: hasEnough ? '' : 'red' }}>
              {valueFormatter(balance)} {token.shortSymbol}
            </p>
          </div>
        </div>
      </div>
      {!hasEnough && <p className='low-balance-alert'>YOU DONT HAVE ENOUGH FOUNDS</p>}
      {!approved && !pending && <p className='approve-token-alert'>PLEASE APPROVE THIS TOKEN</p>}
      {pending && <p className='pending-approval-alert'>APPROVAL PENDING</p>}
    </div>
  )
})

export default CraftingIngredientRow
