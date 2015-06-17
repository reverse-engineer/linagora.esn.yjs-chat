'use strict';

var controller;

function info(req, res) {
  return controller.info().then(function(info) {
    return res.json(200, { info: info });
  }, function(err) {
    return res.json(500, { error: err.message });
  });
}

module.exports = function(dependencies) {
  controller = require('./core')(dependencies);
  return {
    info: info
  };
};
