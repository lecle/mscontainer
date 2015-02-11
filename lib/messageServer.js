"use strict";

var connect = require('connect');
var http = require('http');
var bodyParser = require('body-parser');

var MessageServer = function() {

    this.app = connect();
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.server = null;
};

module.exports = MessageServer;

MessageServer.prototype.start = function(port) {

    http.createServer(this.app).listen(port);
};

MessageServer.prototype.stop = function() {

};

MessageServer.prototype.on = function(name, callback) {

    function parseResponse(req, res, next) {

        req.data = {};

        if(req.body)
            req.data = req.body;

        if(req.params)
            req.data = req.params;

        res.send = function(jsonDataOrCode, jsonData) {

            if(jsonData === undefined)
                this.end(JSON.stringify(jsonDataOrCode));
            else {

                res.writeHead(jsonDataOrCode, { 'Content-Type': 'application/json' });
                this.end(JSON.stringify(jsonData));
            }
        };

        res.error = function(errOrCode, err) {

            if(err === undefined) {

                var code = 500;

                if(errOrCode && errOrCode.responseCode)
                    code = errOrCode.responseCode;

                res.writeHead(code, { 'Content-Type': 'application/json' });
                this.end(JSON.stringify({code : code, message : errOrCode.message}));
            } else {

                res.writeHead(errOrCode, { 'Content-Type': 'application/json' });
                this.end(JSON.stringify({code : errOrCode, message : err.message}));
            }

        };

        res.writeHead(200, { 'Content-Type': 'application/json' });

        callback(req, res);

        next();
    }

    this.app.use('/' + name, parseResponse);
};