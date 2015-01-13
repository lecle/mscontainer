"use strict";

var EventEmitter = require('events').EventEmitter;
var connect = require('connect');
var http = require('http');
var bodyParser = require('body-parser');

var events = new EventEmitter();
var app = connect();

app.use(bodyParser.urlencoded());
app.use(route);

exports.server = null;

exports.start = function(port) {

    http.createServer(app).listen(port);
};

exports.stop = function() {

};

exports.on = events.on;
exports.emit = events.emit;

function route(req, res) {

    var urlTokens = req.url.split('/');

    events.emit(urlTokens[urlTokens.length - 1], req);

    res.end('OK');
}