import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { Provider } from 'mobx-react'
import RootStore from './store/RootStore'

import 'foundation-sites/dist/css/foundation.min.css'
import './index.css'

ReactDOM.render(
  <Provider store={RootStore}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
