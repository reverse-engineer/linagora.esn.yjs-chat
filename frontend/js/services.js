'use strict';

angular.module('esn.chat')
  .factory('ChatMessage', function() {

    function ChatMessage(object) {
      this.author = object.author;
      this.authorAvatar = object.authorAvatar;
      this.published = object.published;
      this.message = object.message;
      this.displayName = object.displayName;
    }

    return ChatMessage;
  })
  .factory('yArraySynchronizer', ['yjsService', '$window', function(yjsService, $window) {

    function onChange(jsArray) {
      return function(events) {
        events.forEach(function(event) {
          var type = event.type,
              value = event.value,
              position = event.position;
          if (type === 'delete') {
            jsArray.splice(position, 1);
          } else if (type === 'insert') {
            jsArray.splice(position, 0, value);
          } else if (type === 'update') {
            jsArray[position] = value;
          }
        });
      };
    }

    function mapToYList(id, jsArray, callback) {
      callback = callback || function() {};

      var y = yjsService.y;

      yjsService.connector.whenSynced(function() {
        var ylist = y.val(id);
        var onChangeObserver = onChange(jsArray);

        y.observe(function(events) {

          events.filter(function(event) {
            return event.name === 'chat:messages';
          }).forEach(function() {
            var newYList = y.val('chat:messages');

            if (ylist !== newYList) {
              for (var i = jsArray.length - 1; i >= 0; i--) {
                newYList.insert(0, jsArray[i]);
              }

              ylist = newYList;
              ylist.observe(onChangeObserver);
              callback(ylist);
            }

          });
        });

        if (!ylist) {
          ylist = new $window.Y.List(jsArray);
          y.val(id, ylist);
        }

        ylist.observe(onChangeObserver);
        callback(ylist);
      });
    }
    return mapToYList;
  }])
  .factory('yListToMessages', ['ChatMessage', function(ChatMessage) {
    return function yListToMessages(ylist, messages) {
      var ymsgs = ylist.val();
      ymsgs.forEach(function(msg) {
        messages.push(new ChatMessage(msg));
      });
    };
  }])
  .factory('chat', ['$rootScope', 'yjsService', 'yArraySynchronizer', 'yListToMessages',
    function($rootScope, yjsService, yArraySynchronizer, yListToMessages) {

      function sendMessage(chatMessage) {
        if (!chatMessage) {
          throw new Error('No message provided');
        }

        (ret.yMessages || ret.messages).push(chatMessage);
        $rootScope.$broadcast('chat:message:sent', chatMessage);
      }

      function toggleWindow() {
        ret.opened = !ret.opened;
        ret.unread = ret.opened ? 0 : ret.unread;
        $rootScope.$broadcast('chat:window:visibility', {visible: ret.opened});
      }

      var ret = {
        yMessages: null,
        messages: [],
        opened: false,
        unread: 0,
        toggleWindow: toggleWindow,
        sendMessage: sendMessage
      };

      var callback = function(yList) {
        ret.yMessages = yList;
        // yJS will send us back the messages we sent before being connected to peers
        // that's why we flush messages
        ret.messages.splice(0, ret.messages.length);
        yListToMessages(ret.yMessages, ret.messages);
        $rootScope.$applyAsync();

        ret.yMessages.observe(function(events) {
          events.forEach(function(event) {
            if (event.type === 'insert') {
              $rootScope.$broadcast('chat:message:received', event.value);
              if (ret.opened) {
                ret.unread = 0;
              } else {
                ret.unread++;
              }
            } else if (event.type === 'update') {
              // Don't do anything for now!
            } else if (event.type === 'delete') {
              // Don't do anything for now!
            }
          });
        });
      };

      yArraySynchronizer('chat:messages', ret.messages, callback);

      return ret;
    }])

    .factory('messageAvatarService', ['newCanvas', 'currentConferenceState', 'attendeeColorsService', 'drawHelper', 'CHAT_AVATAR_SIZE', 'DEFAULT_AVATAR', function(newCanvas, currentConferenceState, attendeeColorsService, drawHelper, CHAT_AVATAR_SIZE, DEFAULT_AVATAR) {

      function generate(author, callback) {

        var attendee = currentConferenceState.getAttendeeByEasyrtcid(author);
        if (!attendee || !attendee.avatar) {
          return callback(null, DEFAULT_AVATAR);
        }

        currentConferenceState.getAvatarImageByIndex(attendee.index, function(err, image) {
          if (err) {
            return callback(null, DEFAULT_AVATAR);
          }

          var canvas = newCanvas(CHAT_AVATAR_SIZE, CHAT_AVATAR_SIZE),
              context = canvas.getContext('2d');

          context.fillStyle = attendeeColorsService.getColorForAttendeeAtIndex(attendee.index);
          context.fillRect(0, 0, CHAT_AVATAR_SIZE, CHAT_AVATAR_SIZE);
          drawHelper.drawImage(context, image, 0, 0, CHAT_AVATAR_SIZE, CHAT_AVATAR_SIZE);

          return callback(null, canvas.toDataURL());
        });
      }

      return {
        generate: generate
      };

    }]);
