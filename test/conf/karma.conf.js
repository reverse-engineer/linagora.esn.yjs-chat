'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../../',

    files: [
      'test/conf/phantom-bind-polyfill.js',
      'frontend/components/jquery/dist/jquery.js',
      'frontend/components/angular/angular.js',
      'frontend/components/angular-mocks/angular-mocks.js',
      'frontend/components/chai/chai.js',
      'frontend/components/chai-spies/chai-spies.js',
      'frontend/components/awesome-yjs/frontend/js/angular-yjs.js',
      'frontend/components/Autolinker.js/dist/Autolinker.min.js',
      'test/module.js',
      'test/unit-frontend/**/*.js',
      'frontend/js/**/*.js',
      'frontend/views/*.jade'
    ],

    frameworks: ['mocha'],
    colors: true,
    singleRun: true,
    autoWatch: true,
    browsers: ['PhantomJS', 'Chrome', 'Firefox'],
    reporters: ['coverage', 'spec'],
    preprocessors: {
      'frontend/js/**/*.js': ['coverage'],
      'frontend/views/*.jade': ['ng-jade2module']

    },
    ngJade2ModulePreprocessor: {
      stripPrefix: 'frontend/',
      prependPrefix: '/chat/',
      jadeRenderConfig: {
        __: function(str) { return str; }
      },

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('templates')
      moduleName: 'jadeTemplates'
    },
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-coverage',
      'karma-spec-reporter',
      'karma-ng-jade2module-preprocessor'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit-frontend'
    },

    coverageReporter: {type: 'text', dir: '/tmp'}
  });
};
