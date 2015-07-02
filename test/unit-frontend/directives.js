'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Directives', function() {

  beforeEach(function() {
    module('esn.chat');
    module('jadeTemplates');
  });

  describe('The chatMessageBubble directive', function() {
    var scope, $rootScope, $compile, $popover, ChatMessage, called, config, $timeout, chat, chatCalled;

    beforeEach(function() {
      called = 0;
      chatCalled = 0;
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
      chat = {
        toggleWindow: function() {
          chatCalled++;
        }
      };
      $provide.value('chat', chat);
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_, _ChatMessage_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      ChatMessage = _ChatMessage_;
      $timeout = _$timeout_;
    }));

    beforeEach(function() {
      scope = $rootScope.$new();
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
        template: '/chat/views/bubble.html',
        animation: 'am-flip-x',
        scope: scope
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

    it('should do nothing if canBeDisplayed is false even if author is current attendee', function() {
      var message = new ChatMessage({ author: '54321', authorAvatar: 'avatar', published: 'a new date', message: 'a new message' });
      $rootScope.$broadcast('chat:window:visibility', { visible: true });
      $rootScope.$digest();

      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.equal(0);

      $rootScope.$broadcast('chat:window:visibility', { visible: false });
      $rootScope.$digest();

      $rootScope.$broadcast('chat:message:received', message);
      $rootScope.$digest();

      expect(called).to.equal(1);
      expect(config).to.deep.equal({
        placement: 'top',
        delay: { show: 100, hide: 200 },
        content: 'a new message',
        container: 'body',
        template: '/chat/views/bubble.html',
        animation: 'am-flip-x',
        scope: scope
      });
      $timeout.flush();
      expect(called).to.equal(2);
    });

    it('should open the chatBox if it is not displayed', function() {
      scope.openChatBox();
      $rootScope.$digest();
      expect(chatCalled).to.equal(1);
    });

    it('should not toggle the chatBox if it is already displayed', function() {
      $rootScope.$broadcast('chat:window:visibility', { visible: true });
      $rootScope.$digest();

      scope.openChatBox();
      $rootScope.$digest();

      expect(chatCalled).to.equal(0);
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

      var self = this;

      this.currentConferenceState = {
      };

      angular.mock.module(function ($provide) {
        $provide.value('easyRTCService', easyRTCService);
        $provide.value('chat', chatMock);
        $provide.value('localCameraScreenshot', localCameraScreenshotMock);
        $provide.value('currentConferenceState', self.currentConferenceState);
      });
    });

    beforeEach(inject(function ($rootScope, $compile) {
      this.scope = $rootScope.$new();
      this.$rootScope = $rootScope;
      this.element = $compile('<chat-message-editor></chat-message-editor>')(this.scope);

      $rootScope.$digest();
    }));

    it('should focus the input when the chat window is opened', function() {
      this.element.appendTo(document.body);
      this.$rootScope.$broadcast('chat:window:visibility', { visible: true });

      expect(this.element.find('.chat_input')[0]).to.equal(document.activeElement);
    });

    it('should disable the send button by default when the chat window is opened', function() {
      this.$rootScope.$broadcast('chat:window:visibility', { visible: true });

      expect(this.element.find('.send-button').prop('disabled')).to.be.true;
    });

    it('should enable the send button when some text is entered in the input', function() {
      this.scope.messageContent = 'some text';
      this.scope.$digest();

      expect(this.element.find('.send-button').prop('disabled')).to.be.false;
    });

    it('should disable the send button when the input is cleared', function() {
      this.scope.messageContent = '';
      this.scope.$digest();

      expect(this.element.find('.send-button').prop('disabled')).to.be.true;
    });

    describe('the createMessage function', function() {
      it('should create and send a message from ', function() {
        var msgDisplayName = 'user1';
        this.currentConferenceState.getAttendeeByEasyrtcid = function() {
          return {
            displayName: msgDisplayName
          };
        };
        var msgContent = 'content';
        this.scope.messageContent = msgContent;

        chatMock.sendMessage = function (msg) {
          expect(msg.author).to.equal(easyrtcid);
          expect(msg.authorAvatar).to.deep.equal(avatar.src);
          expect(msg.message).to.equal(msgContent);
          expect(msg.displayName).to.equal(msgDisplayName);
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
    var chat;

    beforeEach(function() {
      chat = {};

      angular.mock.module(function($provide) {
        $provide.value('chat', chat);
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

    it('should toggle the window when the close button is clicked', function(done) {
      chat.toggleWindow = done;

      this.chatWindow.find('.close').click();
    });
  });

  describe('the chatMessageDisplay directive', function() {

    beforeEach(function() {
      this.currentConferenceState = {
        getAttendeeByEasyrtcid: function() {}
      };
      this.easyRTCServcice = {
        myEasyrtcid: function() {
          return 'myself';
        }
      };
      var self = this;

      angular.mock.module(function($provide) {
        $provide.value('currentConferenceState', self.currentConferenceState);
        $provide.value('chatMessageAvatarDirective', function() {});
        $provide.value('amDateFormatFilter', function() {});
        $provide.value('easyRTCService', self.easyRTCServcice);
      });
    });

    beforeEach(module(function($sceProvider) {
      $sceProvider.enabled(false);
    }));

    beforeEach(inject(function($rootScope, $compile) {
      this.$scope = $rootScope.$new();
      this.$rootScope = $rootScope;
      this.$compile = $compile;

      this.initDirective = function(scope) {
        var html = '<chat-message-display chat-message="message"/>';
        var element = this.$compile(html)(scope);
        scope.$digest();
        return element;
      };
    }));

    it('should set $scope.myself to true when message is sent by the local user', function() {
      this.$scope.message = { author: 'myself' };

      var element = this.initDirective(this.$scope);
      this.$scope.$digest();

      expect(element.isolateScope().myself).to.be.true;
    });

    it('should set $scope.myself to false when message is sent by a peer', function() {
      this.$scope.message = { author: 'remote peer' };

      var element = this.initDirective(this.$scope);
      this.$scope.$digest();

      expect(element.isolateScope().myself).to.be.false;
    });

  });

  describe('the chatAutoScroll directive', function() {
    beforeEach(inject(function($rootScope, $compile) {
      this.$scope = $rootScope.$new();
      this.$rootScope = $rootScope;
      this.$compile = $compile;
      this.messageHTML = '<div style="height: 100px">x</div>';

      this.initDirective = function(scope) {
        var html = '<div chat-auto-scroll style="height: 150px; overflow: scroll;">';
        var element = this.$compile(html)(scope);
        $('body').append(element); // give dimensions to element
        scope.$digest();
        return element;
      };

      this.getScrollPosition = function(element) {
        if (element.scrollTop() === 0) {
          return 'top';
        } else if (element.prop('scrollHeight') - element.height() - element.prop('scrollTop') <= 1) {
          return 'bottom';
        } else {
          return 'middle';
        }
      };
    }));

    it('should autoScroll', function() {
      this.$scope.messages = [];
      var element = this.initDirective(this.$scope);
      this.$rootScope.$apply();
      this.$scope.messages = [1];
      element.append($(this.messageHTML));
      element.append($(this.messageHTML));
      this.$rootScope.$apply();
      expect(this.getScrollPosition(element)).to.equal('bottom');
    });

    it('should not autoScroll when user scrolled up', function() {
      this.$scope.messages = [];
      var element = this.initDirective(this.$scope);
      this.$rootScope.$apply();
      this.$scope.messages = [1];
      element.append($(this.messageHTML));
      element.append($(this.messageHTML));
      this.$rootScope.$apply();
      element.scrollTop(10);
      // unfortunately, should send scroll evt manually...
      element.trigger('scroll');
      this.$rootScope.$apply();
      this.$scope.messages.push(2);
      element.append($(this.messageHTML));
      this.$rootScope.$apply();
      expect(this.getScrollPosition(element)).to.equal('middle');
    });


  });

});
