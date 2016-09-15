'use strict';

var controller;

function info(req, res) {
  return controller.info().then(function(info) {
    return res.status(200).json({info: info});
  }, function(err) {
    return res.status(500).json({error: err.message});
  });
}

module.exports = function(dependencies) {
  controller = require('./core')(dependencies);
  return {
    info: info
  };
};
