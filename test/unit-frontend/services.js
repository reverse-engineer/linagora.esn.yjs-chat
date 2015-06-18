'use strict';

var expect = chai.expect;

describe('the yArraySynchronizer factory', function() {

  var ylist;

  beforeEach(function() {
    module('esn.chat');
  });

  beforeEach(function() {
    var self = this;
    this.yServiceData = {
      connector: {
        whenSynced: function(callback) {
          callback();
        }
      }
    };
    var yService = function() {
      return self.yServiceData;
    };
    this.$window = {
      Y: {
        List: function() {}
      }
    };

    module(function($provide) {
      $provide.value('yjsService', yService);
      $provide.value('$window', self.$window);
    });
    inject(function(yArraySynchronizer) {
      self.yArraySynchronizer = yArraySynchronizer;
    });

    ylist = {
      observe: function() {}
    };

  });

  it('should throw an error if first argument is undefined', function() {
    var self = this;
    function test() {
      return self.yArraySynchronizer(null);
    }
    expect(test).to.throw(/id is required/);
  });

  it('should throw an error if second argument is undefined', function() {
    var self = this;
    function test() {
      return self.yArraySynchronizer('test');
    }
    expect(test).to.throw(/jsArray is required/);
  });

  it('should throw an error if second argument is not an array', function() {
    var self = this;
    function test() {
      return self.yArraySynchronizer('test', 'not an array');
    }
    expect(test).to.throw(/jsArray should be a javascript array/);
  });

  it('should call the callback when yjs isSynced is called', function() {
    this.yServiceData.y = {
      val: function() {
        return ylist;
      }
    };

    var spy = chai.spy();
    this.yArraySynchronizer('test', [], spy);
    expect(spy).to.been.called.with(ylist);
  });

  it('should create a new YList when the val does not exist', function(done) {
    var myTab = [];

    this.yServiceData.y = {
      val: function() {
        return undefined;
      }
    };

    this.$window.Y.List = function(t) {
      expect(t).to.equal(myTab);
      done();
      return ylist;
    };

    this.yArraySynchronizer('test', myTab);
  });

  it('should not create a new YList when the val exists', function(done) {
    var myTab = [];

    this.yServiceData.y = {
      val: function() {
        return ylist;
      }
    };

    this.$window.Y.List = function(t) {
      expect(t).to.equal(myTab);
      done(new Error('new ylist creation'));
      return ylist;
    };

    this.yArraySynchronizer('test', myTab, function() {
      done();
    });
  });

});
