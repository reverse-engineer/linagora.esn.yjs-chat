'use strict';

angular.module('esn.chat')
  .directive('chatToggleElement', function($popover) {
      function link(scope, element) {
        var conf = {
          title: scope.name,
          trigger: 'manual',
          contentTemplate: '/chat/views/chat.html',
          placement: 'top'
        };
        var popover = $popover(element, conf);
        scope.toggleChat = function() {
          popover.toggle();
        };
      }
      return {
        restrict: 'E',
        replace: 'true',
        templateUrl: '/chat/views/button.html',
        link: link
      };
    }
  )
  .directive('chatMessageBubble', function($rootScope, $popover, easyrtcService, CHAT_POPOVER_DELAY) {

    function link(scope, element) {
      var popoverConfiguration = {
        placement: 'top',
        delay: CHAT_POPOVER_DELAY
      };

      var unregisterFn = $rootScope.$on('chat:message:received', function(event, data) {
        if (data.author === easyrtcService.myEasyrtcId) {
          popoverConfiguration.title = data.published;
          popoverConfiguration.content = data.message;
          var popover = $popover(element, popoverConfiguration);
          popover.toggle();
        }
      });

      scope.$on('$destroy', unregisterFn);
    }

    return {
      restrict: 'E',
      link: link
    };
  });
