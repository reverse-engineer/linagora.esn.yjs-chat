'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The Services', function() {
  describe('The messageAvatarService service', function() {
    var newCanvas, currentConferenceState, attendeeColorsService, drawHelper, messageAvatarService, DEFAULT_AVATAR;
    beforeEach(function() {

      newCanvas = {
        getContext: function() {
          return {
            drawImage: function() {
            },
            fillRect: function() {
            }
          };
        },
        toBlob: function() {
        }
      };

      currentConferenceState = {};
      attendeeColorsService = {};
      drawHelper = {};


      angular.mock.module('esn.chat');
      angular.mock.module(function($provide) {
        $provide.value('newCanvas', function() {
          return newCanvas;
        });
        $provide.value('currentConferenceState', currentConferenceState);
        $provide.value('attendeeColorsService', attendeeColorsService);
        $provide.value('drawHelper', drawHelper);
      });
    });

    beforeEach(inject(function(_messageAvatarService_, _DEFAULT_AVATAR_) {
      messageAvatarService = _messageAvatarService_;
      DEFAULT_AVATAR = _DEFAULT_AVATAR_;
    }));

    describe('The generate function', function() {

      it('should send back DEFAULT_AVATAR when attendee not found', function(done) {

        currentConferenceState.getAttendeeByRtcid = function() {
          return;
        };

        messageAvatarService.generate({}, function(err, result) {
          expect(result).to.equal(DEFAULT_AVATAR);
          done();
        });
      });

      it('should send back DEFAULT_AVATAR when attendee does not have avatar', function(done) {
        currentConferenceState.getAttendeeByRtcid = function() {
          return {};
        };

        messageAvatarService.generate({}, function(err, result) {
          expect(result).to.equal(DEFAULT_AVATAR);
          done();
        });

      });

      it('should generate the image from canvas', function(done) {
        currentConferenceState.getAttendeeByRtcid = function() {
          return {avatar: 1};
        };
        currentConferenceState.getAvatarImageByIndex = function(index, callback) {
          return callback(null, 'image');
        };
        attendeeColorsService.getColorForAttendeeAtIndex = function() {
        };
        drawHelper.drawImage = function() {
          done();
        };
        messageAvatarService.generate({});
      });
    });
  });

  describe('the yArraySynchronizer factory', function() {

    var ylist, yjsServiceData, $window, yArraySynchronizer;

    beforeEach(function() {
      module('esn.chat');
    });

    beforeEach(function() {

      yjsServiceData = {
        connector: {
          whenSynced: function(callback) {
            callback();
          }
        },
        y: {
          val: function() {
            return ylist;
          },
          observe: function() {}
        }
      };

      $window = {
        Y: {
          List: function() {
          }
        }
      };

      module(function($provide) {
        $provide.value('yjsService', yjsServiceData);
        $provide.value('$window', $window);
      });
      inject(function(_yArraySynchronizer_) {
        yArraySynchronizer = _yArraySynchronizer_;
      });

      ylist = {
        observe: function() {},
        val: function() {}
      };

    });

    it('should call the callback when yjs isSynced is called', function() {
      yjsServiceData.y.val = function() {
        return ylist;
      };

      var spy = chai.spy();
      yArraySynchronizer('test', [], spy);
      expect(spy).to.been.called.with(ylist);
    });

    it('should create a new YList when the val does not exist', function(done) {
      var myTab = [];

      yjsServiceData.y.val = function() {
        return undefined;
      };

      $window.Y.List = function(t) {
        expect(t).to.equal(myTab);
        done();
        return ylist;
      };

      yArraySynchronizer('test', myTab);
    });

    it('should not create a new YList when the val exists', function(done) {
      var myTab = [];

      yjsServiceData.y.val = function() {
        return ylist;
      };

      $window.Y.List = function(t) {
        expect(t).to.equal(myTab);
        done(new Error('new ylist creation'));
        return ylist;
      };

      yArraySynchronizer('test', myTab, function() {
        done();
      });
    });

    describe('observe chat:messages object', function() {
      var myTab = [],
        callback,
        mySpy;

      beforeEach(function() {
        yjsServiceData.y = {
          val: function() {
            return ylist;
          },
          observe: chai.spy(function(cb) {
            callback = cb;
          })
        };
        ylist.observe = chai.spy();
        $window.Y.List = function(t) {
          return ylist;
        };

        mySpy = chai.spy();

      });

      it('shouldn\'t do anything of the y.val() hasn\'t changed', function() {
        var events = [{
          name: 'chat:messages'
        }];

        yArraySynchronizer('test', myTab, mySpy);

        expect(ylist.observe).to.have.been.called.once;
        callback(events);
        expect(ylist.observe).to.have.been.called.once;

        expect(yjsServiceData.y.observe).to.have.been.called.once;
      });

      it('should reattach the callbacks when y.val() has changed', function() {
        var newYList = {
            observe: chai.spy(),
            foo: 'bar'
          },
          events = [{
            name: 'chat:messages'
          }];

        yArraySynchronizer('test', myTab, mySpy);

        yjsServiceData.y.val = function() {
          return newYList;
        };


        callback(events);
        expect(newYList.observe).to.have.been.called.once;
      });

      it('shouldn\'t reattach the callbacks when other yjs variables are changed', function() {
        var events = [{
          name: 'self is another shared variable'
        }];

        yArraySynchronizer('test', myTab, mySpy);

        callback(events);
        expect(mySpy).to.have.been.called.once;
      });

      it('should insert the existing array elements, in order, to the start of new yList when y.val() has changed', function() {
        var newYList = {
          observe: chai.spy(),
          foo: 'bar',
          elements: ['c'],
          insert: function(position, element) {
            newYList.elements.splice(0, 0, element);
          }
        },
        events = [{
          name: 'chat:messages'
        }];
        myTab = ['a', 'b'];

        yArraySynchronizer('test', myTab, mySpy);

        yjsServiceData.y.val = function() {
          return newYList;
        };

        callback(events);
        expect(newYList.elements).to.deep.equal(['a', 'b', 'c']);
      });

    });

  });

  describe('the chat factory', function() {
    var chatFactory, yList, $rootScope, message,
        yArraySynchronizerMock, yArraySynchronizer, yListToMessagesMock, yListToMessages;

    beforeEach(module('esn.chat'));
    beforeEach(function() {

      var yService = function() {
        return {
          connector: {
            whenSynced: function(callback) {
              callback();
            }
          }
        };
      };

      yList = {
        val: chai.spy(),
        observe: chai.spy(),
        push: chai.spy()
      };

      yArraySynchronizerMock = function(channel, messages, callback) {
        callback(yList);
      };

      yArraySynchronizer = function(channel, messages, callback) {
        return yArraySynchronizerMock(channel, messages, callback);
      };

      yListToMessagesMock = function() {
      };

      yListToMessages = function(ylist, messages) {
        return yListToMessagesMock(ylist, messages);
      };


      message = {foo: 'bar'};

      module(function($provide) {
        $provide.value('yArraySynchronizer', yArraySynchronizer);
        $provide.value('yjsService', yService);
        $provide.value('yListToMessages', yListToMessages);
      });

      inject(function(_$rootScope_) {
        $rootScope = _$rootScope_;
      });

    });

    it('should have the right properties', function() {
      inject(function(chat) {
        chatFactory = chat;
      });
      expect(chatFactory).to.have.property('yMessages');
      expect(chatFactory).to.have.property('messages');
      expect(chatFactory).to.have.property('opened')
        .and.to.equal(false);
      expect(chatFactory).to.have.property('unread')
        .and.to.equal(0);
    });

    describe('the sendMessage method', function() {
      beforeEach(function() {
        inject(function(chat) {
          chatFactory = chat;
        });
      });

      it('should fail if no message is provided', function() {

        var test = function() {
          chatFactory.sendMessage();
        };
        expect(test).to.throw(/No message provided/);
      });

      it('should push the message in the yjs list', function() {
        chatFactory.sendMessage(message);
        expect(yList.push).to.have.been.called.with(message);
      });

      it('should broadcast a chat:message:sent', function(done) {
        var scope = $rootScope.$new();
        scope.$on('chat:message:sent', function() {
          done();
        });
        chatFactory.sendMessage(message);
        $rootScope.$digest();
      });
    });

    describe('the sendMessage method', function() {

      it('should push the message in the native messages array if the ylist is not initialized', function() {
        yArraySynchronizerMock = function() {};

        inject(function(chat) {
          chatFactory = chat;
        });

        chatFactory.sendMessage(message);
        expect(chatFactory.messages).to.have.length(1);
      });

    });

    describe('the toggleWindow method', function() {
      beforeEach(function() {
        inject(function(chat) {
          chatFactory = chat;
        });
      });

      it('should toggle the opened boolean', function() {
        expect(chatFactory.opened).to.be.false;
        chatFactory.toggleWindow();
        expect(chatFactory.opened).to.be.true;
        chatFactory.toggleWindow();
        expect(chatFactory.opened).to.be.false;
      });

      describe('unread messages count', function() {
        it('should be reset when opened becomes true', function() {
          chatFactory.unread = 42;
          chatFactory.toggleWindow();
          expect(chatFactory.unread).to.equal(0);
        });
      });

      it('should broadcast chat:window:visibility event on window opening', function(done) {
        var scope = $rootScope.$new();
        scope.$on('chat:window:visibility', function(evt, data) {
          expect(data).to.deep.equal({visible: true});
          done();
        });
        chatFactory.toggleWindow();
      });
      it('should broadcast chat:window:visibility event on window closing', function(done) {
        var scope = $rootScope.$new();
        chatFactory.toggleWindow();
        scope.$on('chat:window:visibility', function(evt, data) {
          expect(data).to.deep.equal({visible: false});
          done();
        });
        chatFactory.toggleWindow();
      });
    });

    describe('initialization code', function() {
      it('should register a yArraySynchronizer array', function(done) {
        yArraySynchronizerMock = function(channel, messages, callback) {
          expect(channel).to.equal('chat:messages');
          expect(messages).to.be.an('array');
          expect(messages).to.have.length(0);
          expect(callback).to.be.a('function');
          done();
        };
        inject(function(chat) {
          chatFactory = chat;
        });
      });
      describe('yArraySynchronizer callback', function() {
        var callbackMock;

        beforeEach(function() {

          yArraySynchronizerMock = function(channel, messages, callback) {
            callbackMock = callback;
          };
          inject(function(chat) {
            chatFactory = chat;
          });
        });

        it('should expose the ylist', function() {
          var ylist = {
            observe: function() {}
          };
          callbackMock(ylist);
          expect(chatFactory.yMessages).to.equal(ylist);
        });
        it('should call the yListToMessages service', function() {
          var ylist = {
            observe: function() {}
          };
          yListToMessagesMock = function(ylist, messages) {
            messages.push('hello');
          };
          callbackMock(ylist);
          expect(chatFactory.messages).to.deep.equal(['hello']);
        });
        it('should call $rootScope.$applyAsync', function(done) {
          var ylist = {
            observe: function() {}
          };
          $rootScope.$applyAsync = done;
          callbackMock(ylist);
        });
        it('should flush the messages array', function() {
          var messages = chatFactory.messages;
          messages.push(1);
          messages.push(2);
          messages.push(3);
          var ylist = {
            observe: function() {}
          };
          callbackMock(ylist);
          expect(messages).have.length(0);
        });
      });

      describe('yjs events handler', function() {
        var handler;

        beforeEach(function() {

          yArraySynchronizerMock = function(channel, messages, callback) {
            callback({
              observe: function(callback) {
                handler = callback;
              },
              val: function() {
                return yList;
              }
            });
          };
          inject(function(chat) {
            chatFactory = chat;
          });
        });

        it('should loop over events array and send rootScope events', function() {
          var events = [
            {
              type: 'insert',
              value: 'test1',
              position: 0
            },
            {
              type: 'insert',
              value: 'test2',
              position: 2
            }
          ];

          var received = [];
          $rootScope.$on('chat:message:received', function(evt, data) {
            received.push(data);
          });
          handler(events);
          expect(received).to.deep.equal(['test1', 'test2']);
        });

        it('should increment the unread count if the window is not opened', function() {
          var events = [
            {
              type: 'insert',
              value: 'test1',
              position: 0
            },
            {
              type: 'insert',
              value: 'test2',
              position: 2
            }
          ];

          var received = [];
          expect(chatFactory.opened).to.be.false;
          $rootScope.$on('chat:message:received', function(evt, data) {
            received.push(data);
          });
          handler(events);
          expect(chatFactory.unread).to.equal(2);
        });

        it('should not increment the unread count if the window is opened', function() {
          var events = [
            {
              type: 'insert',
              value: 'test1',
              position: 0
            },
            {
              type: 'insert',
              value: 'test2',
              position: 2
            }
          ];

          var received = [];
          chatFactory.toggleWindow();
          expect(chatFactory.opened).to.be.true;
          $rootScope.$on('chat:message:received', function(evt, data) {
            received.push(data);
          });
          handler(events);
          expect(chatFactory.unread).to.equal(0);
        });
      });
    });

  });

  describe('the yListToMessages factory', function() {
    var yListToMessages;
    beforeEach(module('esn.chat'));
    beforeEach(inject(function(_yListToMessages_) {
      yListToMessages = _yListToMessages_;
    }));

    it('should be a function', function() {
      expect(yListToMessages).to.be.a('function');
    });

    it('should add messages to the messages array', function() {
      var yMessages = [
        {author: 'u1', authorAvatar: 'a1', published: 1, message: 'm1', displayName: 'author1'},
        {author: 'u2', authorAvatar: 'a2', published: 2, message: 'm2', displayName: 'author2'}
      ];
      var messages = [];
      var ylist = {
        val: function() {
          return yMessages;
        }
      };
      yListToMessages(ylist, messages);
      expect(messages).to.deep.equal(yMessages);
    });
    it('should remove angularish variables', function() {
      var yMessages = [
        {author: 'u1', authorAvatar: 'a1', published: 1, message: 'm1', $$id: 'v7'},
        {author: 'u2', authorAvatar: 'a2', published: 2, message: 'm2', $$id: 'v8'}
      ];
      var messages = [];
      var ylist = {
        val: function() {
          return yMessages;
        }
      };
      yListToMessages(ylist, messages);
      expect(messages).to.have.length(2);
      expect(messages[0]).to.not.have.property('$$id');
      expect(messages[1]).to.not.have.property('$$id');
    });
  });
});
