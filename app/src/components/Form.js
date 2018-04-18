import { Form } from 'mobx-react-form'

import AsyncField from './AsyncField'

class MyForm extends Form {
  makeField (props) {
    const isAsync = props.props.$extra &&
      !!props.props.$extra.async

    if (isAsync) {
      return new AsyncField(props)
    }

    return super.makeField(props)
  }
}

export default MyForm
