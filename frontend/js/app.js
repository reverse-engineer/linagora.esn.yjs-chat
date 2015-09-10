'use strict';

angular.module('esn.chat', ['op.live-conference', 'yjs', 'ngAnimate', 'op.dynamicDirective'])
.config(function(dynamicDirectiveServiceProvider) {
  var dd = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'div', [{name: 'chat-message-bubble', value: 'chat-message-bubble'}], -100);
  var dd2 = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'chat-icon', undefined, -100);
  var dd3 = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'chat-window', undefined, -100);
  dynamicDirectiveServiceProvider.addInjection('attendee-video', dd);
  dynamicDirectiveServiceProvider.addInjection('live-conference-control-bar-items', dd2);
  dynamicDirectiveServiceProvider.addInjection('conference-video', dd3);
});
