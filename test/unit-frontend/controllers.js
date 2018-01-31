'use strict';

/* global chai: false */
var expect = chai.expect;

describe('the chatController controller', function() {
  var $controller, $rootScope, $scope, chat = {messages: []};

  beforeEach(function() {
    module('esn.chat');

    angular.mock.module(function($provide) {
      $provide.value('chat', chat);
    });
  });
  beforeEach(inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  it('should expose the chat.messages array into the scope', function() {
    $controller('chatController', {
      chat: chat,
      $scope: $scope
    });
    expect($scope.messages).to.equal(chat.messages);
  });

  it('should expose the close() method into the scope', function() {
    $controller('chatController', {
      chat: chat,
      $scope: $scope
    });
    expect($scope.close).to.be.a('function');
  });

  describe('close() method', function() {
    it('should call chat.toggleWindow() method', function(done) {
      $controller('chatController', {
        chat: chat,
        $scope: $scope
      });
      chat.toggleWindow = done;
      $scope.close();
    });
  });

  it('should bind the chat:message:received on scope', function(done) {
    $scope.$on = function(evt, callback) {
      expect(evt).to.equal('chat:message:received');
      expect(callback).to.be.a('function');
      done();
    };
    $controller('chatController', {
      chat: chat,
      $scope: $scope
    });
  });

  describe('chat:message:received callback', function() {
    it('should call $applyAsync on scope', function(done) {
      $scope.$applyAsync = done;
      $controller('chatController', {
        chat: chat,
        $scope: $scope
      });
      $rootScope.$broadcast('chat:message:received', {});
    });
  });

});
