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
  );
