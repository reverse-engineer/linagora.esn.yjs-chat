'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Directives', function() {

  beforeEach(function() {
    module('esn.chat');
    module('jadeTemplates');
  });

  describe('The chatMessageBubble directive', function() {
    var $rootScope, $compile, $popover, ChatMessage, called, config, $timeout;

    beforeEach(function() {
      called = 0;
      config = {};
    });

    beforeEach(module(function($provide) {
      $popover = function(element, popoverConfiguration) {
        return {
          toggle: function() {
            called++;
            config = popoverConfiguration
          }
        };
      };
      $provide.value('$popover', $popover);
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_, _ChatMessage_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      ChatMessage = _ChatMessage_;
      $timeout = _$timeout_;
    }));

    beforeEach(function() {
      var scope = $rootScope.$new();
      scope.attendee = {
        easyrtcid: '54321'
      };
      $compile('<chat-message-bubble/>')(scope);
    });

    it('should register chat:message:received with $rootScope and toggle popover if author is current attendee and close after $timeout', function() {
      var message = new ChatMessage({ author: '54321', authorAvatar: 'avatar', published: 'a new date', message: 'a new message' });
      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.equal(1);
      expect(config).to.deep.equal({
        placement: 'top',
        delay: { show: 100, hide: 200 },
        content: 'a new message',
        container: 'body',
        contentTemplate: '/chat/views/bubble.html'
      });
      $timeout.flush();
      expect(called).to.equal(2);
    });

    it('should do nothing if if author is not current attendee', function() {
      var message = new ChatMessage({ author: '12345', authorAvatar: 'avatar', published: Date.now(), message: 'a new message' });
      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.equal(0);
    });

  });

  describe('the chatMessageEditor directive', function() {

    var chatMock = {};
    var easyrtcid = 'easyrtcid';
    var avatar = {
      src: 'avatarSrc'
    };

    beforeEach(function () {
      var easyRTCService = {
        myEasyrtcid: function () {
          return easyrtcid;
        }
      };

      var localCameraScreenshotMock = {
        shoot: function () {
          return avatar;
        }
      };

      angular.mock.module(function ($provide) {
        $provide.value('easyRTCService', easyRTCService);
        $provide.value('chat', chatMock);
        $provide.value('localCameraScreenshot', localCameraScreenshotMock);
      });
    });

    beforeEach(inject(function ($rootScope, $compile) {
      this.scope = $rootScope.$new();
      $compile('<chat-message-editor></chat-message-editor>')(this.scope);
      $rootScope.$digest();
    }));

    describe('the createMessage function', function () {
      it('should create and send a message from ', function () {
        var msgContent = 'content';
        this.scope.messageContent = msgContent;

        chatMock.sendMessage = function (msg) {
          expect(msg.author).to.equal(easyrtcid);
          expect(msg.authorAvatar).to.deep.equal(avatar.src);
          expect(msg.message).to.equal(msgContent);
        };

        this.scope.createMessage();
        expect(this.scope.messageContent).to.equal('');
      });
    });
  });

  describe('The chatMessageAvatar directive', function() {

    beforeEach(function() {

      this.messageAvatarService = {};
      var self = this;

      module('jadeTemplates');
      angular.mock.module('esn.chat');

      angular.mock.module(function($provide) {
        $provide.value('messageAvatarService', self.messageAvatarService);
      });
    });

    beforeEach(inject(['$compile', '$rootScope', 'DEFAULT_AVATAR', function($c, $r, DEFAULT_AVATAR) {
      this.$compile = $c;
      this.$rootScope = $r;
      this.$scope = this.$rootScope.$new();
      this.DEFAULT_AVATAR = DEFAULT_AVATAR;

      this.initDirective = function(scope) {
        var html = '<chat-message-avatar chat-message="chatMessage"/>';
        var element = this.$compile(html)(scope);
        scope.$digest();
        return element;
      };
    }]));

    it('should not call messageAvatarService.generate when message.authorAvatar is defined', function(done) {
      this.$scope.chatMessage = {
        author: 1,
        authorAvatar: 123
      };

      this.messageAvatarService.generate = function() {
        done(new Error());
      };
      this.initDirective(this.$scope);
      this.$scope.$digest();
      done();
    });

    it('should call messageAvatarService.generate', function(done) {
      this.$scope.chatMessage = {
        author: 1
      };

      this.messageAvatarService.generate = function() {
        done();
      };
      this.initDirective(this.$scope);
      this.$scope.$digest();
    });

    it('should put the DEFAULT_AVATAR if messageAvatarService.generate fails', function() {
      this.$scope.chatMessage = {
        author: 1
      };

      this.messageAvatarService.generate = function(attendee, callback) {
        return callback(new Error());
      };
      var element = this.initDirective(this.$scope);
      this.$scope.$digest();
      var iscope = element.isolateScope();
      expect(iscope.avatar).to.equal(this.DEFAULT_AVATAR);
    });

    it('should put the DEFAULT_AVATAR if messageAvatarService.generate returns null', function() {
      this.$scope.chatMessage = {
        author: 1
      };

      this.messageAvatarService.generate = function(attendee, callback) {
        return callback();
      };
      var element = this.initDirective(this.$scope);
      this.$scope.$digest();
      var iscope = element.isolateScope();
      expect(iscope.avatar).to.equals(this.DEFAULT_AVATAR);
    });

    it('should put the avatar returned by messageAvatarService.generate', function() {
      this.$scope.chatMessage = {
        author: 1
      };
      var result = 'A';

      this.messageAvatarService.generate = function(attendee, callback) {
        return callback(null, result);
      };
      var element = this.initDirective(this.$scope);
      this.$scope.$digest();
      var iscope = element.isolateScope();
      expect(iscope.avatar).to.equals(result);
    });
  });

  describe('chatIcon', function() {
    var chat;
    var scope;
    var element;
    var rootScope;
    beforeEach(function() {
      module('esn.chat');
      module('jadeTemplates');
    });
    beforeEach(module(function($provide) {
      chat = {
        toggleWindow: function() {

        },
        unread: 0,
        opened: false
      };
      $provide.value('chat', chat);
    }));

    beforeEach(inject(function($compile, $rootScope) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      element = $compile('<chat-icon />')(scope);
      rootScope.$digest();
    }));

    it('Should call toggleWindow on click', function(done) {
      chat.toggleWindow = function() {
        done();
      };
      element.find('a').click();
      rootScope.$digest();
    });

    it('Should display number of messages unread when there are some', function(){
      chat.unread=5;
      chat.opened=false;
      rootScope.$digest();
      expect(element.find('.badge').hasClass('ng-hide')).to.be.false;
    });

    it('Should not display number of messages unread when there are none', function(){
      chat.unread=0;
      chat.opened=false;
      rootScope.$digest();
      expect(element.find('.badge').hasClass('ng-hide')).to.be.true;
    });

    it('Should not display number of messages unread when the panel is opened', function(){
      chat.unread=56;
      chat.opened=true;
      rootScope.$digest();
      expect(element.find('.badge').hasClass('ng-hide')).to.be.true;
    });

  });

  describe('The chatWindow directive', function() {
    beforeEach(function() {
      angular.mock.module(function($provide) {
        $provide.value('chat', {});
        $provide.value('chatMessageEditorDirective', function() {});
        $provide.value('chatMessageDisplayDirective', function() {});
      });
    });

    beforeEach(inject(function($rootScope, $compile, CHAT_WINDOW_SIZE) {
      this.scope = $rootScope.$new();
      this.$rootScope = $rootScope;
      this.CHAT_WINDOW_SIZE = CHAT_WINDOW_SIZE;
      this.chatWindow = $compile('<chat-window></chat-window>')(this.scope);
      $rootScope.$digest();
    }));

    it('should display the chat window when receiving chat:window:visibility with visible set to true', function() {
      this.$rootScope.$broadcast('chat:window:visibility', {visible: true});
      expect(this.chatWindow.hasClass('visible')).to.be.true;
    });

    it('should hide the chat window when receiving chat:window:visibility with visible set to false', function() {
      this.chatWindow.addClass('visible');
      this.$rootScope.$broadcast('chat:window:visibility', {visible: false});

      expect(this.chatWindow.hasClass('visible')).to.be.false;
    });

    it('should do nothing when sending visible true twice', function() {
      this.$rootScope.$broadcast('chat:window:visibility', {visible: true});
      this.$rootScope.$broadcast('chat:window:visibility', {visible: true});
      expect(this.chatWindow.hasClass('visible')).to.be.true;
    });

    it('should emit attendeesBarSize with the width when displaying', function(done) {
      var self = this;

      this.$rootScope.$on('attendeesBarSize', function(event, data) {
        expect(data).to.exist;
        expect(data.marginRight).to.equal(self.CHAT_WINDOW_SIZE.width + 'px');
        done();
      });

      this.$rootScope.$broadcast('chat:window:visibility', {visible: true});
    });

    it('should emit attendeesBarSize with width = 0 when closing', function(done) {
      this.$rootScope.$on('attendeesBarSize', function(event, data) {
        expect(data).to.exist;
        expect(data.marginRight).to.equal('0');
        done();
      });

      this.$rootScope.$broadcast('chat:window:visibility', {visible: false});
    });
  });
});
