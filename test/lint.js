const lint = require('mocha-eslint');

const paths = [
  'app/js/app.js',
  'app/js/layout.js',
  'test/**/*.js',
];

const options = {
  formatter: 'stylish',
  alwaysWarn: true,
  strict: true,
  timeout: 5000,
  slow: 1000,
  contextName: 'ESLint'
};

lint(paths, options);
