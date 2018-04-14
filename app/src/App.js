import React, { Component } from 'react'
import { configure } from 'mobx'
import { observer, inject } from 'mobx-react'
import IndexPage from './pages/IndexPage'

configure({ enforceActions: true })

@inject('store')
@observer
class App extends Component {
  render () {
    return (
      <div>
        <IndexPage />
        {this.props.store.ui.error &&
          <code>
            {this.props.store.ui.error.toString()}
          </code>
        }
      </div>
    )
  }
}

export default App
