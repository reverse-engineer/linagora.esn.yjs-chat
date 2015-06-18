'use strict';

angular.module('esn.chat')
  .controller('chatController', function($log, $scope, chat) {
    $scope.messages = chat.messages;
  });
