import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { Provider } from 'mobx-react'
import createStore from './store/createStore'

ReactDOM.render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
