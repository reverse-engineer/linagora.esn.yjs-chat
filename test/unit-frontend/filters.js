'use strict';

var expect = chai.expect;

describe('The filters', function() {

  describe('The autolink filter', function() {

    var filter;

    beforeEach(function() {
      angular.mock.module('esn.chat');
    });

    beforeEach(inject(['$filter', function($filter) {
      filter = $filter('autolink');
    }]));

    it('should replace google.fr URL', function() {
      expect(filter('go to google.fr')).to.match(/<a href="http:\/\/google\.fr"/);
    })

  });

});
