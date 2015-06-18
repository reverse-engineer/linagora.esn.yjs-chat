'use strict';

angular.module('esn.chat')

  .directive('chatMessageBubble', function($timeout, $rootScope, $popover, CHAT_POPOVER_DELAY, CHAT_HIDE_TIMEOUT) {

    function link(scope, element) {
      var popoverConfiguration = {
        placement: 'top',
        delay: CHAT_POPOVER_DELAY,
        container: 'body',
        contentTemplate: '/chat/views/bubble.html',
        animation: 'am-flip-x'
      };

      scope.$on('chat:message:received', function(event, data) {
        if ((scope.attendee && data.author === scope.attendee.easyrtcid)) {
          popoverConfiguration.content = data.message;
          var popover = $popover(element, popoverConfiguration);
          popover.toggle();
          $timeout(popover.toggle, CHAT_HIDE_TIMEOUT);
        }
      });
    }

    return {
      restrict: 'EA',
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
    }])

    .directive('chatMessageDisplay', [function() {

      return {
        restrict: 'E',
        templateUrl: '/chat/views/message.html',
        scope: {
          chatMessage: '='
        }
      };
    }])

    .directive('chatMessageAvatar', ['messageAvatarService', 'DEFAULT_AVATAR', function(messageAvatarService, DEFAULT_AVATAR) {

      function link($scope) {

        if ($scope.chatMessage.authorAvatar) {
          $scope.avatar = $scope.chatMessage.authorAvatar;
          return;
        }

        messageAvatarService.generate($scope.chatMessage.author, function(err, avatar) {
          $scope.avatar = err || !avatar ? DEFAULT_AVATAR : avatar;
        });
      }

      return {
        restrict: 'E',
        templateUrl: '/chat/views/avatar.html',
        scope: {
          chatMessage: '='
        },
        link: link
      };
    }])

  .directive('chatIcon', ['chat', function(chat) {
    function link(scope) {
      scope.chat = chat;
    }
    return {
      restrict: 'E',
      link: link,
      replace: true,
      templateUrl: '/chat/views/button.html'
    };
  }])

  .directive('chatWindow', function($rootScope, CHAT_WINDOW_SIZE) {
    function link(scope, element, attrs) {
      var width = CHAT_WINDOW_SIZE.width;
      var height = CHAT_WINDOW_SIZE.height;

      function showChatWindow(width, height) {
        width = Math.min(100, Math.max(0, width));
        height = Math.min(100, Math.max(0, height));
        element.css('width', width + '%');
        element.css('height', height + '%');
        element.addClass('visible');
        $rootScope.$emit('attendeesBarSize', {width: width + 2});
      }

      function hideChatWindow() {
        element.css('width', '0');
        element.css('height', '0');
        element.removeClass('visible');
        $rootScope.$emit('attendeesBarSize', {width: 0});
      }

      scope.$on('chat:window:visibility', function(evt, data) {
        if (data.visible) {
          showChatWindow(width, height);
        } else {
          hideChatWindow();
        }
      });
    }
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/chat/views/chat.html',
      link: link
    };
  });
