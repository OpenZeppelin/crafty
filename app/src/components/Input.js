import React from 'react'
import { observer } from 'mobx-react'

import FileInput from './FileInput'
import Switch from './Switch'

const Input = observer(({ field, label, isSelect = false }) => (
  <div>
    {(() => {
      if (isSelect) {
        return [
          <label key='label' htmlFor={field.id}>
            {label || field.label}
          </label>,
          <select key='select' {...field.bind()}>
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
            {label || field.label}
            <textarea {...field.bind()}></textarea>
          </label>
        )
      case 'checkbox':
        return (
          <Switch
            field={field}
          />
        )
      case 'file':
        return (
          <FileInput
            field={field}
          />
        )
      default:
        return (
          <label htmlFor={field.id}>
            {label || field.label}
            <input {...field.bind()} />
          </label>
        )
      }
    })()}
    <p className='help-text'>
      {field.error || <span>&nbsp;</span>}
    </p>
  </div>
))

export default Input
