'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var AwesomeChatModule = new AwesomeModule('linagora.esn.chat', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'webserver.wrapper', 'webserver-wrapper')
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
        'directives.js'
      ], 'chat', 'live-conference');
      webserver.injectCSS('chat', 'styles.css', 'live-conference');
      webserver.addApp('chat', application);

      return callback(null, {});
    },
    start: function(dependencies, callback) {
      callback();
    }
  }
});

module.exports = AwesomeChatModule;
