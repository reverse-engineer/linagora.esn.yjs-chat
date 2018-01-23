'use strict';

/* eslint-disable no-process-env, no-console */
module.exports = function(grunt) {
  var CI = grunt.option('ci');

  var testArgs = (function() {
    var opts = ['test', 'chunk'];
    var args = {};

    opts.forEach(function(optName) {
      var opt = grunt.option(optName);

      if (opt) {
        args[optName] = '' + opt;
      }
    });

    return args;
  })();

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      all: {
        src: [
          'Gruntfile.js',
          'test/**/*.js',
          'frontend/js/**/*.js',
          'backend/**/*.js'
        ]
      },
      quick: {
        src: []
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= eslint.all.src %>']
      },
      quick: {
        src: ['<%= eslint.quick.src %>']
      }
    },
    puglint: {
      all: {
        options: {
          config: {
            disallowAttributeInterpolation: true,
            disallowLegacyMixinCall: true,
            validateExtensions: true,
            validateIndentation: 2
          }
        },
        src: [
          'frontend/**/*.pug'
        ]
      }
    },
    run_grunt: {
      all: {
        options: {
          log: true,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          args: testArgs,
          process: function(res) {
            if (res.fail) {
              grunt.config.set('esn.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('esn.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          }
        },
        src: ['Gruntfile-tests.js']
      },
      frontend: {
        options: {
          log: true,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          process: function(res) {
            if (res.fail) {
              grunt.config.set('esn.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('esn.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          },
          task: ['test-frontend']
        },
        src: ['Gruntfile-tests.js']
      },
      unit_backend: {
        options: {
          log: true,
          args: testArgs,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          process: function(res) {
            if (res.fail) {
              grunt.config.set('unit.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('unit.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          },
          task: ['test-unit-backend']
        },
        src: ['Gruntfile-tests.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-puglint');
  grunt.loadNpmTasks('grunt-run-grunt');

  grunt.loadTasks('tasks');

  grunt.registerTask('test-unit-backend', ['run_grunt:unit_backend']);
  grunt.registerTask('test-frontend', ['run_grunt:frontend']);
  grunt.registerTask('test', ['linters', 'run_grunt:frontend', 'test-unit-backend']);
  grunt.registerTask('linters', 'Check code for lint', ['eslint:all', 'lint_pattern:all', 'puglint:all']);

  /**
   * Usage:
   *   grunt linters-dev              # Run linters against files changed in git
   *   grunt linters-dev -r 51c1b6f   # Run linters against a specific changeset
   */
  grunt.registerTask('linters-dev', 'Check changed files for lint', ['prepare-quick-lint', 'eslint:quick', 'lint_pattern:quick']);

  grunt.registerTask('default', ['test']);
};
