'use strict';

angular.module('esn.chat')
  .controller('chatController', function($log, $scope, chatAPI) {
    $scope.chatName = 'Let\'s Chat!';

    chatAPI.getChat().then(function(response) {
      $scope.number = response.data.info;
    }, function(err) {
      $log.error(err);
    });
  });
