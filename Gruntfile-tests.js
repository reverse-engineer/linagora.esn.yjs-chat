'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      options: {
        separator: ';'
      }
    },

    splitfiles: {
      options: {
        chunk: 10
      },
      backend: {
        options: {
          common: ['test/unit-backend/all.js'],
          target: 'mochacli:backend'
        },
        files: {
          src: ['test/unit-backend/**/*.js']
        }
      }
    },
    mochacli: {
      options: {
        require: ['chai', 'mockery'],
        reporter: 'spec',
        timeout: process.env.TEST_TIMEOUT || 2000
      },
      backend: {
        options: {
          files: ['test/unit-backend/all.js', grunt.option('test') || 'test/unit-backend/**/*.js']
        }
      }
    },
    karma: {
      unit: {
        configFile: './test/conf/karma.conf.js',
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-karma');

  grunt.loadTasks('tasks');

  grunt.registerTask('test-unit-backend', 'run the backend unit tests (to be used with .only)', ['splitfiles:backend']);
  grunt.registerTask('test-backend', 'run both the unit & midway tests', ['test-unit-backend']);
  grunt.registerTask('test-frontend', 'Run the frontend tests', ['karma:unit']);

  grunt.registerTask('test', ['test-frontend', 'test-backend']);
  grunt.registerTask('default', ['test']);
};
