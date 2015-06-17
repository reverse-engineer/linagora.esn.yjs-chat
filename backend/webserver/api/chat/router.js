'use strict';

var express = require('express');

module.exports = function(dependencies) {

  var controller = require('./controller')(dependencies);

  var router = express.Router();
  router.get('/api/info', controller.info);

  return router;
};
