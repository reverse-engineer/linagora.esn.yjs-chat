'use strict';

angular.module('esn.chat')

  .directive('chatMessageBubble', function($timeout, $rootScope, $popover, chat, CHAT_POPOVER_DELAY, CHAT_HIDE_TIMEOUT) {
    var canBeDisplayed = true;

    function link(scope, element) {
      var popoverConfiguration = {
        placement: 'top',
        delay: CHAT_POPOVER_DELAY,
        container: 'body',
        template: '/chat/views/bubble.html',
        animation: 'am-flip-x',
        scope: scope
      };

      scope.$on('chat:message:received', function(event, data) {
        if (canBeDisplayed && (scope.attendee && data.author === scope.attendee.rtcid)) {
          popoverConfiguration.content = data.message;
          var popover = $popover(element.parent(), popoverConfiguration);

          popover.$promise.then(popover.toggle);
          $timeout(popover.destroy, CHAT_HIDE_TIMEOUT);
        }
      });

      scope.$on('chat:window:visibility', function(evt, data) {
        canBeDisplayed = !data.visible;
      });

      scope.openChatBox = function() {
        if (canBeDisplayed) {
          chat.toggleWindow();
        }
      };
    }

    return {
      restrict: 'EA',
      link: link
    };
  })

  .directive('chatMessageEditor', ['ChatMessage', 'chat', 'webRTCService', 'localCameraScreenshot', 'CHAT_AVATAR_SIZE', 'currentConferenceState',
    function(ChatMessage, chat, webRTCService, localCameraScreenshot, CHAT_AVATAR_SIZE, currentConferenceState) {

      function getMyDisplayName() {
        return webRTCService.myRtcid().then(function(myId) {
          var myself = currentConferenceState.getAttendeeByRtcid(myId);

          return (myself && myself.displayName) ? myself.displayName : null;
        });
      }

      function link(scope, element) {
        scope.messageContent = '';

        scope.createMessage = function() {
          var avatar = localCameraScreenshot.shoot(CHAT_AVATAR_SIZE);
          webRTCService.myRtcid().then(function(myId) {
            var chatMsgData = {
              author: myId,
              authorAvatar: avatar ? avatar.src : null,
              published: Date.now(),
              message: scope.messageContent,
              displayName: getMyDisplayName()
            };

            chat.sendMessage(new ChatMessage(chatMsgData));
            scope.messageContent = '';
          });
        };

        scope.$on('chat:window:visibility', function(event, data) {
          if (data.visible) {
            element.find('.chat_input').focus();
          }
        });
      }

      return {
        restrict: 'E',
        templateUrl: '/chat/views/chat-message-editor.html',
        link: link
      };
    }])

    .directive('chatMessageDisplay', ['webRTCService', function(webRTCService) {

      return {
        restrict: 'E',
        templateUrl: '/chat/views/message.html',
        scope: {
          chatMessage: '='
        },

        link: function($scope) {
          webRTCService.myRtcid().then(function(myId) {
            $scope.myself = myId === $scope.chatMessage.author;
          });
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
    function link(scope, element) {
      scope.$on('chat:window:visibility', function(evt, data) {
        if (data.visible) {
          element.addClass('visible');
          $rootScope.$emit('attendeesBarSize', {marginRight: CHAT_WINDOW_SIZE.width + 'px'});
        } else {
          element.removeClass('visible');
          $rootScope.$emit('attendeesBarSize', {marginRight: '0'});
        }
      });
    }

    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/chat/views/chat.html',
      link: link
    };
  })
  .directive('chatAutoScroll', function() {

    var offByOneError = 1;

    function getScrollDistanceFromBottom(element) {
      return element.prop('scrollHeight') - element.height() - element.scrollTop();
    }

    function shouldSuspendAutoScroll(element) {
      return getScrollDistanceFromBottom(element) > offByOneError;
    }

    function scrollToBottom(element) {
      element.scrollTop(element.prop('scrollHeight'));
    }

    function link(scope, element) {
      var suspended = false;

      element.on('scroll', function() {
        suspended = shouldSuspendAutoScroll(element);
      });

      scope.$watch('messages.length', function() {
        if (!suspended) {
          scope.$evalAsync(function() {
            scrollToBottom(element);
          });
        }
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  });
