const rewireMobX = require('react-app-rewire-mobx')
const rewirePolyfills = require('react-app-rewire-polyfills')

module.exports = function override (config, env) {
  config = rewireMobX(config, env)
  config = rewirePolyfills(config, env)

  return config
}
