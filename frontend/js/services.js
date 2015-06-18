'use strict';

angular.module('esn.chat')
  .factory('ChatMessage', function() {

    function ChatMessage(object) {
      this.author = object.author;
      this.authorAvatar = object.authorAvatar;
      this.published = object.published;
      this.message = object.message;
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

      var y = yjsService().y;

      yjsService().connector.whenSynced(function() {
        var ylist = y.val(id);
        if (!ylist) {
          ylist = new $window.Y.List(jsArray);
          y.val(id, ylist);
        }
        ylist.observe(onChange(jsArray));
        callback(ylist);
      });
    }
    return mapToYList;
  }])
  .factory('chat', ['$rootScope', 'yjsService', 'yArraySynchronizer',
    function($rootScope, yjsService, yArraySynchronizer) {

      function sendMessage(chatMessage) {
        if (!chatMessage) {
          throw new Error('No message provided');
        }
        ret.yMessages.push(chatMessage);
        $rootScope.$emit('chat:message:sent', chatMessage);
      }

      function toggleWindow() {
        ret.opened = !ret.opened;
        ret.unread = ret.opened ? 0 : ret.unread;
        $rootScope.$emit('chat:window:visibility', {visible: ret.opened});
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

        ret.yMessages.observe(function(events) {
          events.forEach(function(event) {
            if (event.type === 'insert') {
              $rootScope.$emit('chat:message:received', event.value);
              ret.unread = ret.opened ? 0 : ret.unread + 1;
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
    }]);
