'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var AwesomeChatModule = new AwesomeModule('linagora.esn.yjs-chat', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.core.i18n', 'i18n')
  ],
  states: {
    lib: function(dependencies, callback) {
      var chat = require('./webserver/api/chat')(dependencies);

      return callback(null, {
        api: {
          chat: chat
        }
      });
    },
    deploy: function(dependencies, callback) {
      var application = require('./webserver/application')(dependencies);

      application.use('/', this.api.chat);

      var webserver = dependencies('webserver-wrapper');

      webserver.injectAngularModules('chat', [
        'app.js',
        'services.js',
        'controllers.js',
        'constants.js',
        'directives.js',
        'filters.js'
      ], ['truncate', 'esn.chat'], 'live-conference');
      webserver.injectCSS('chat', 'styles.css', 'live-conference');
      webserver.injectJS('chat', [
        '../components/angular-truncate/src/truncate.js',
        '../components/Autolinker.js/dist/Autolinker.min.js'
      ], 'live-conference');
      webserver.addApp('chat', application);

      return callback(null, {});
    },
    start: function(dependencies, callback) {
      callback();
    }
  }
});

module.exports = AwesomeChatModule;
