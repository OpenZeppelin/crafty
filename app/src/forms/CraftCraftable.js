import Form from 'mobx-react-form'
import * as validatorjs from 'validatorjs'

const fields = [
  'approvals',
  'approvals[].address',
  'approvals[].pending',
  'approvals[].approved',
]

const types = {
  'approvals': 'array',
  'approvals[].address': 'text',
  'approvals[].pending': 'checkbox',
  'approvals[].approved': 'checkbox',
}

const values = {
  approvals: [],
}

const labels = {
  'approvals[].approved': 'Approved?',
}

const placeholders = {

}

const rules = {
  'approvals': 'required|array|min:1',
  'approvals[].address': 'required|string|alpha_num|size:42',
  'approvals[].pending': 'boolean',
  // @TODO(shrugs) - require not pending
  'approvals[].approved': 'required|boolean',
}

const defaults = {
  'approvals': [],
  'approvals[].address': '',
  'approvals[].pending': true,
  'approvals[].approved': false,
}

const extra = {
}

const initials = {
  ...defaults,
}

const observers = {
}

export default (opts = {}) => {
  return new Form({
    fields,
    types,
    values,
    labels,
    placeholders,
    rules,
    defaults,
    initials,
    extra,
    observers,
    ...opts,
  }, {
    plugins: {
      dvr: {
        package: validatorjs,
        extendInstance: ($validator) => {
          $validator.setAttributeFormatter((attr) => {
            if (attr.includes('.')) {
              const parts = attr.split('.')
              return parts[parts.length - 1]
            }

            return attr
          })
        },
      },
    },
  })
}
