"use strict";

var connect = require('connect');
var http = require('http');
var bodyParser = require('body-parser');

var app = connect();

app.use(bodyParser.urlencoded({ extended: true }));

exports.server = null;

exports.start = function(port) {

    http.createServer(app).listen(port);
};

exports.stop = function() {

};

exports.on = function(name, callback) {

    function parseResponse(req, res, next) {

        req.data = {};

        if(req.body)
            req.data = req.body;

        if(req.query)
            req.data = req.query;

        res.send = function(jsonData) {

            this.end(JSON.stringify(jsonData));
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });

        callback(req, res);

        next();
    }

    app.use('/' + name, parseResponse);
};