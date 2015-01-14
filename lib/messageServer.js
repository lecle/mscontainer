"use strict";

var connect = require('connect');
var http = require('http');
var bodyParser = require('body-parser');

var app = connect();

app.use(bodyParser.urlencoded());

exports.server = null;

exports.start = function(port) {

    http.createServer(app).listen(port);
};

exports.stop = function() {

};

exports.on = function(name, callback) {

    app.use('/' + name, callback);
};