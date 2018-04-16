import React from 'react'
import { observer } from 'mobx-react'

const Input = observer(({ field, opts = {}, isSelect = false }) => (
  <div>
    {(() => {
      if (isSelect) {
        return [
          <label key='label' htmlFor={field.id}>
            {field.label}
          </label>,
          <select key='select' {...field.bind(opts)}>
            {(field.extra || []).map(o =>
              <option key={o.k} value={o.k}>{o.v}</option>)
            }
          </select>,
        ]
      }
      switch (field.type) {
      case 'textarea':
        return (
          <label htmlFor={field.id}>
            {field.label}
            <textarea {...field.bind(opts)}></textarea>
          </label>
        )
      case 'checkbox':
        return (
          <label htmlFor={field.id}>
            <input {...field.bind(opts)} />
            {field.label}
          </label>
        )
      default:
        return (
          <label htmlFor={field.id}>
            {field.label}
            <input {...field.bind(opts)} />
          </label>
        )
      }
    })()}
    {field.error &&
        <p className='help-text'>{field.error}</p>
    }
  </div>
))

export default Input
