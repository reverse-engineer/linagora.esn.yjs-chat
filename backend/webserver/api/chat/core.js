'use strict';

var q = require('q');

function info() {
  var defer = q.defer();

  defer.resolve(42);

  return defer.promise;
}

module.exports = function() {
  return {
    info: info
  };
};
