const lint = require('mocha-eslint');

const paths = [
  'app/js/app.js',
  'app/js/layout.js',
  'migrations/*.js',
  'test/**/*.js'
];

const options = {
  formatter: 'stylish',
  alwaysWarn: true,
  strict: true,
  contextName: 'ESLint'
};

lint(paths, options);
