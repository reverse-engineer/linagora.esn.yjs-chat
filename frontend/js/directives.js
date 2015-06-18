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
  })

  .directive('chatMessageEditor', ['ChatMessage', 'chat', 'easyRTCService', 'localCameraScreenshot', 'CHAT_AVATAR_SIZE',
    function(ChatMessage, chat, easyRTCService, localCameraScreenshot, CHAT_AVATAR_SIZE) {
      function link(scope) {
        scope.messageContent = '';

        scope.createMessage = function() {
          var avatar = localCameraScreenshot.shoot(CHAT_AVATAR_SIZE);

          var chatMsgData = {
            author: easyRTCService.myEasyrtcid(),
            authorAvatar: avatar ? avatar.src : null,
            published: Date.now(),
            message: scope.messageContent
          };
          chat.sendMessage(new ChatMessage(chatMsgData));
          scope.messageContent = '';
        };
      }

      return {
        restrict: 'E',
        templateUrl: '/chat/views/chat-message-editor.html',
        link: link
      };
    }]);
