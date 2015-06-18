'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Constants', function() {

  var injector;

  beforeEach(module('esn.chat'));

  beforeEach(inject(function($injector) {
    injector = $injector;
  }));

  it('should be 48 for CHAT_AVATAR_SIZE', function() {
    expect(injector.get('CHAT_AVATAR_SIZE')).to.equal(48);
  });

  it('should be 330 for CHAT_WINDOW_SIZE', function() {
    expect(injector.get('CHAT_WINDOW_SIZE')).to.equal(330);
  });

});
