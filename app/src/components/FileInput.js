import React from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import Dropzone from 'react-dropzone'

const destroyPreview = (file, field) => (e) => {
  e.preventDefault()
  window.URL.revokeObjectURL(file.preview)
  // remove file from array
  const index = field.files.indexOf(file)
  action(() => field.files.splice(index, 1))()
}

export default observer(({ field }) => (
  <div className='file-input'>
    <label htmlFor={field.id}>
      {field.label}
    </label>
    <Dropzone
      className='dropzone'
      activeClassName='active'
      acceptClassName='accept'
      rejectClassName='reject'
      onClick={action(() => {
        field.set('')
        field.files = []
        destroyPreview(field.files, field)
        field.onFocus()
      })}
      onFileDialogCancel={action(() => {
        field.onBlur()
      })}
      onDragEnter={field.onFocus}
      onDragLeave={field.onBlur}
      onDrop={action((files) => {
        field.files = files
        if (files.length > 0) {
          const file = files[0]
          const reader = new FileReader()
          reader.onload = action(() => {
            // const buf = Buffer.from(reader.result)
            field.set(reader.result)
          })
          reader.readAsDataURL(file)
        }
      })}
      accept='image/*'
    >
      {(field.files && field.files.length > 0) &&
        <div>
          <img
            src={field.values()}
            alt='token'
          />
        </div>
      }
      {(!field.files || field.files.length === 0) &&
        [
          <button
            key='button'
            type='button'
            className='button'
          >
            Choose Image
          </button>,
          <p key='p'>Or drop one here.</p>,
        ]
      }
    </Dropzone>
  </div>
))
