'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Directives', function() {

  beforeEach(module('esn.chat'));

  describe('The chatMessageBubble directive', function() {
    var $rootScope, $compile, $popover, ChatMessage, called, config, easyrtcService;

    beforeEach(function() {
      called = false;
      config = {};
    });

    beforeEach(module(function($provide) {
      $popover = function(element, popoverConfiguration) {
        return {
          toggle: function() {
            called = true;
            config = popoverConfiguration
          }
        };
      };
      easyrtcService = {
        myEasyrtcId: '12345'
      };
      $provide.value('$popover', $popover);
      $provide.value('easyrtcService', easyrtcService);
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_, _ChatMessage_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      ChatMessage = _ChatMessage_;
    }));

    beforeEach(function() {
      var scope = $rootScope.$new();
      $compile('<chat-message-bubble/>')(scope);
    });

    it('should register chat:message:received with $rootScope and toggle popover', function() {
      var message = new ChatMessage({ author: '12345', authorAvatar: 'avatar', published: 'a new date', message: 'a new message' });
      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.be.true;
      expect(config).to.deep.equal({
        placement: 'top',
        delay: { show: 1000, hide: 200 },
        content: 'a new message',
        title: 'a new date'
      });
    });

    it('should do nothing if the easyrtcid does not match', function() {
      var message = new ChatMessage({ author: '54321', authorAvatar: 'avatar', published: Date.now(), message: 'a new message' });
      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.be.false;
    });

  });

});