import React from 'react'
import { observer } from 'mobx-react'
import Dropzone from 'react-dropzone'
import { action } from 'mobx'

const destroyPreview = (file, field) => (e) => {
  e.preventDefault()
  window.URL.revokeObjectURL(file.preview)
  // remove file from array
  const index = field.files[0].indexOf(file)
  action(() => field.files[0].splice(index, 1))()
}

export default observer(({ field }) => (
  <label htmlFor={field.id}>
    {field.label}
    <Dropzone
      className='dropzone'
      accept='image/*'
      onDrop={(files) => {
        field.onDrop(files)
      }}
      ref={dropzone => field.state.extra({ dropzone })}
    >
      {(field.files && field.files[0].length > 0) &&
        <div>
          {field.files[0].map(file =>
            <button
              key={file.name}
              onClick={destroyPreview(file, field)}
            >
              <img
                src={file.preview}
                alt={file.name}
              />
            </button>)
          }
        </div>
      }
      {(!field.files || field.files[0].length === 0) &&
        <button
          type='button'
          className='button'
        >
          Choose Image
        </button>
      }
    </Dropzone>
  </label>
))
