import React from 'react'
import { observer } from 'mobx-react'

import Loader from './Loader'

const Switch = observer(({ pending = false, field, className = '' }) => {
  return (
    <div className='switch-container'>
      <p>{field.label} {field.pending && '...'}</p>
      <div className={`switch ${className} input-container`}>
        {pending &&
          <Loader tiny />
        }
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
