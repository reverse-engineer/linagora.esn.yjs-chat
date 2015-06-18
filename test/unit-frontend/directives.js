'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Directives', function() {

  beforeEach(function() {
    module('esn.chat');
    module('jadeTemplates');
  });

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
        myEasyrtcId: function() { return '12345'; }
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

    it('should register chat:message:received with $rootScope and toggle popover if author is not current user', function() {
      var message = new ChatMessage({ author: '54321', authorAvatar: 'avatar', published: 'a new date', message: 'a new message' });
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

    it('should do nothing if if author is current user', function() {
      var message = new ChatMessage({ author: '12345', authorAvatar: 'avatar', published: Date.now(), message: 'a new message' });
      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.be.false;
    });

  });

  describe('the chatMessageEditor directive', function() {

    var chatMock = {};
    var easyrtcid = 'easyrtcid';
    var avatar = {
      src: 'avatarSrc'
    };

    beforeEach(function() {
      var easyRTCService = {
        myEasyrtcid: function() {
          return easyrtcid;
        }
      };

      var localCameraScreenshotMock = {
        shoot: function() {
          return avatar;
        }
      };

      angular.mock.module(function($provide) {
        $provide.value('easyRTCService', easyRTCService);
        $provide.value('chat', chatMock);
        $provide.value('localCameraScreenshot', localCameraScreenshotMock);
      });
    });

    beforeEach(inject(function($rootScope, $compile) {
      this.scope = $rootScope.$new();
      $compile('<chat-message-editor></chat-message-editor>')(this.scope);
      $rootScope.$digest();
    }));

    describe('the createMessage function', function() {
      it('should create and send a message from ', function() {
        var msgContent = 'content';
        this.scope.messageContent = msgContent;

        chatMock.sendMessage = function(msg) {
          expect(msg.author).to.equal(easyrtcid);
          expect(msg.authorAvatar).to.deep.equal(avatar.src);
          expect(msg.message).to.equal(msgContent);
        };

        this.scope.createMessage();
        expect(this.scope.messageContent).to.equal('');
      });
    });
  });

});