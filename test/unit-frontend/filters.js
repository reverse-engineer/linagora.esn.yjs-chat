'use strict';

var expect = chai.expect;

describe('The filters', function() {
  var filter;

  beforeEach(function() {
    angular.mock.module('esn.chat');
  });

  describe('The autolink filter', function() {
    beforeEach(inject(['$filter', function($filter) {
      filter = $filter('autolink');
    }]));

    it('should replace google.fr URL', function() {
      expect(filter('go to google.fr')).to.match(/<a href="http:\/\/google\.fr"/);
    })

  });

  describe('The numberOverflow filter', function() {
    beforeEach(inject(['$filter', function($filter) {
      filter = $filter('numberOverflow');
    }]));

    it('should show numbers under max normally', function() {
      expect(filter(10, 10)).to.equal(10)
    });

    it('should show numbers over max with a plus', function() {
      expect(filter(10, 9)).to.equal('9+')
    });
  });
});
