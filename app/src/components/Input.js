import React from 'react'
import { observer } from 'mobx-react'

@observer
export default class InputField extends React.Component {
  onChange = (event) => {
    const v = this.props.type === 'checkbox'
      ? event.target.checked
      : event.target.value
    this.props.onChange(event.target.name, v)
  }

  render () {
    const input = this.props

    const uid = `${input.id}-${input.name}`

    return (
      <div style={{
        paddingBottom: input.type === 'checkbox'
          ? '0.5rem'
          : '0',
      }}>
        <label
          attr-type={input.type}
          htmlFor={uid}
        >
          {input.type !== 'checkbox' &&
            (input.label || input.name)
          }
          {input.type === 'textarea'
            ? <textarea
              id={uid}
              name={input.name || input.id}
              placeholder={input.placeholder}
              onChange={this.onChange}
              type={input.type}
              value={input.value}
            ></textarea>
            : <input
              id={uid}
              name={input.name || input.id}
              placeholder={input.placeholder}
              onChange={this.onChange}
              type={input.type}
              value={input.value}
              checked={input.type === 'checkbox' && input.value}
            />
          }
          {input.type === 'checkbox' &&
            (input.label || input.name)
          }
          {input.error &&
            <p className='help-text'>{input.error}</p>
          }
        </label>
      </div>
    )
  }
}

InputField.defaultProps = {
  type: 'text',
}
