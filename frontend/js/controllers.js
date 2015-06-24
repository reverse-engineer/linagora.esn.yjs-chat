'use strict';

angular.module('esn.chat')
  .controller('chatController', function($scope, chat) {
    $scope.messages = chat.messages;

    $scope.close = function() {
      chat.toggleWindow();
    };

    $scope.$on('chat:message:received', function() {
      $scope.$applyAsync();
    });

  });
