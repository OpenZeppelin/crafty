import Form from 'mobx-react-form'
import * as Validator from 'validatorjs'

const fields = [
  'name',
  'symbol',
  'description',
  'image',
  'inputs',
  'inputs[].address',
  'inputs[].amount',
]

const types = {
  'name': 'text',
  'symbol': 'text',
  'description': 'text',
  'image': 'file',
  'inputs': 'array',
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
  name: 'Name',
  symbol: 'Symbol',
  description: 'Describe Your Craftable Token',
  image: 'Image',
  inputs: 'Sacrificial Tokens',
  'inputs[].address': 'Click here or paste an ERC20 token address',
  'inputs[].amount': 'Amount required:',
}

const placeholders = {
  name: 'Party parrot.',
  symbol: 'PRRT',
  description: 'Party or die!',
  'inputs[].address': '0x0',
}

const rules = {
  name: 'required|string|between:4,42',
  symbol: 'required|string|between:2,10',
  description: 'required|string|between:10,400',
  image: 'required|string|max:1048000', // About 1MB
  'inputs': 'required|array|min:1',
  'inputs[].address': 'required|string|alpha_num|size:42',
  'inputs[].amount': 'required|numeric|min:0.01',
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

export default () => {
  const defaults = {
    inputs: [],
    'inputs[].amount': 1,
    'inputs[].address': '',
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
    defaults,
    initials,
    interceptors,
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: 250,
      validationDebounceOptions: { trailing: true },
    },
    plugins: {
      dvr: {
        package: Validator,
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
