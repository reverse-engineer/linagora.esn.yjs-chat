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
    if (!id) {
      throw new Error('id is required');
    }
    if (!jsArray) {
      throw new Error('jsArray is required');
    }
    if (!angular.isArray(jsArray)) {
      throw new Error('jsArray should be a javascript array');
    }
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
}]);
