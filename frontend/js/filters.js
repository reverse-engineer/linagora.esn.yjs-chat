'use strict';

angular.module('esn.chat')
  .filter('autolink', function($window) {
    return function(text) {
      return $window.Autolinker.link(text, { className: 'autolink' });
    };
  })
  .filter('numberOverflow', function() {
    return function(input, max) {
      return input > max ? max + '+' : input;
    };
  });
