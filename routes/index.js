var config = require('../config')
var util = require("util")


/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { apiUrlBase: config.apiUrlBase });
};