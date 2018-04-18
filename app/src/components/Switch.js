import React from 'react'
import { observer } from 'mobx-react'

const Switch = observer(({ field, className = '' }) => {
  return (
    <div className='switch-container'>
      <p>{field.label} {field.pending && '...'}</p>
      <div className={`switch ${className}`}>
        <input
          {...field.bind()}
          className='switch-input'
        />
        <label htmlFor={field.id} className='switch-paddle'>
          {field.values()
            ? <span className='switch-active' aria-hidden='true'>Yes</span>
            : <span className='switch-inactive' aria-hidden='true'>No</span>
          }
        </label>
      </div>
    </div>
  )
})

export default Switch
