import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { configure } from 'mobx'
import { observer, inject } from 'mobx-react'
import IndexPage from './pages/IndexPage'
import DiscoverPage from './pages/DiscoverPage'
import CraftPage from './pages/CraftPage'

configure({ enforceActions: true })

@inject('store')
@withRouter
@observer
class App extends Component {
  render () {
    return (
      <div>
        {this.props.store.ui.error &&
          <code>
            {this.props.store.ui.error.toString()}
          </code>
        }
        <Switch>
          <Route exact path='/' component={IndexPage} />
          <Route exact path='/discover' component={DiscoverPage} />
          <Route exact path='/craft' component={CraftPage} />
          {/* <CraftableTokenPage /> */}
        </Switch>
      </div>
    )
  }
}

export default App
