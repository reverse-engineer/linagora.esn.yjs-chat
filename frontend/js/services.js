'use strict';

angular.module('chat')
  .factory('chatRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/chat/api');
      RestangularConfigurer.setFullResponse(true);
    });
  })
  .factory('chatAPI', function($log, chatRestangular) {
    function getChat() {
      return chatRestangular.one('info').get();
    }

    return {
      getChat: getChat
    };
  })
  .factory('ChatMessage', function() {

    function ChatMessage(object) {
      this.author = object.author;
      this.authorAvatar = object.authorAvatar;
      this.published = object.published;
      this.message = object.message;
    }

    return ChatMessage;
  });
