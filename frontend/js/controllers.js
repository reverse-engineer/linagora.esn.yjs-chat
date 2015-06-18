'use strict';

angular.module('esn.chat')
  .controller('chatController', ['$log', '$scope', function($log, $scope) {
    $scope.chatName = 'Let\'s Chat!';
  }]);
