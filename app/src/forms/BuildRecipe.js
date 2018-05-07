import Form from 'mobx-react-form'
import * as validatorjs from 'validatorjs'

const fields = [
  'name',
  'symbol',
  'description',
  'image',
  'inputs',
  'inputs[].id',
  'inputs[].canonical',
  'inputs[].address',
  'inputs[].amount',
]

const types = {
  'name': 'text',
  'symbol': 'text',
  'description': 'text',
  'image': 'file',
  'inputs': 'array',
  'inputs[].canonical': 'checkbox',
  'inputs[].address': 'text',
  'inputs[].amount': 'number',
}

const values = {
  name: '',
  symbol: '',
  description: '',
  inputs: [],
}

const labels = {
  name: 'Your Craftable Token\'s Name',
  symbol: 'Your Craftable Token\'s Symbol',
  description: 'Describe Your Craftable Token',
  image: 'Your Craftable Token\'s Image',
  inputs: 'Sacrificial Tokens',
  'inputs[].canonical': 'Canonical Token?',
  'inputs[].address': 'Token',
  'inputs[].amount': 'How many are required?',
}

const placeholders = {
  name: 'A nice token.',
  symbol: 'TKN',
  description: 'This is a nice token.',
  'inputs[].address': '0x0',
}

const rules = {
  name: 'required|string|between:4,42',
  symbol: 'required|string|between:2,10',
  description: 'required|string|between:10,400',
  image: 'required|string',
  'inputs': 'required|array|min:1',
  'inputs[].id': 'required|string',
  'inputs[].canonical': 'required|boolean',
  'inputs[].address': 'required|string|alpha_num|size:42',
  'inputs[].amount': 'required|integer|min:1',
}

const observers = {
  'inputs[].canonical': [{
    key: 'value',
    call: ({ form, field, change }) => {
      const willBeCanonical = change.newValue
      const addressPath = field.path.replace('canonical', 'address')
      if (willBeCanonical) {
        form.$(addressPath).reset()
      } else {
        form.$(addressPath).set('')
        form.$(addressPath).resetValidation()
      }
      return change
    },
  }],
}

const interceptors = {
  'symbol': [{
    key: 'value',
    call: ({ change }) => {
      return {
        ...change,
        newValue: change.newValue.toUpperCase(),
      }
    },
  }],
}

export default (canonicalTokensInfo) => {
  const extra = {
    'inputs[].address': canonicalTokensInfo.map(ct => ({
      k: ct.address,
      v: `${ct.name} (${ct.symbol})`,
    })),
  }

  const defaults = {
    inputs: [],
    'inputs[].canonical': true,
    'inputs[].amount': 1,
    'inputs[].address': extra['inputs[].address'][0].k,
  }

  const initials = {
    ...defaults,
  }

  return new Form({
    fields,
    types,
    values,
    labels,
    placeholders,
    rules,
    extra,
    defaults,
    initials,
    observers,
    interceptors,
  }, {
    plugins: {
      dvr: {
        package: validatorjs,
        extendInstance: ($validator) => {
          $validator.setAttributeNames({
            'name': 'name',
            'symbol': 'symbol',
            'description': 'description',
            'image': 'image',
            'inputs': 'inputs',
          })

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
