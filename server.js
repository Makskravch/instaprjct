const bs = require('browser-sync').create();

bs.init({
  server: {
    baseDir: 'app',
    routes: {
      '/libs': 'node_modules'
    }
  },

  files: [
    'app/css/**/*.css',
    'app/js/**/*.js',
    'app/**/*.html'
  ],

  open: true,

  middleware: [
    require('connect-history-api-fallback')()
  ]
});
