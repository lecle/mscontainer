"use strict";

var connect = require('connect');
var http = require('http');
var bodyParser = require('body-parser');

var MessageServer = function(container) {

    var serverPort = 0;

    this.container = container;
    this.app = connect();
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json({ limit : 10240000 }));
    this.server = null;

    var self = this;
    var log = this.container.log;

    this.start = function(port) {

        serverPort = port;
        self.server = http.createServer(self.app);

        log.info('server.listen : ' + port);
        self.server.listen(port);
    };

    this.stop = function(callback) {

        if(self.server) {

            log.info('server.stop : ' + serverPort);
            self.server.close(function() {

                log.info('server.stoped : ' + serverPort);
                callback();
            });
        } else {

            callback(null);
        }
    };

    this.on = function(name, callback) {

        function parseResponse(req, res, next) {

            req.data = {};

            if(req.body)
                req.data = req.body;

            if(req.params)
                req.data = req.params;

            res.send = function(jsonDataOrCode, jsonData) {

                if(jsonData === undefined)
                    res.end(JSON.stringify(jsonDataOrCode));
                else {

                    res.writeHead(jsonDataOrCode, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(jsonData));
                }
            };

            res.error = function(errOrCode, err) {

                if(err === undefined) {

                    var code = 500;

                    if(errOrCode && errOrCode.responseCode)
                        code = errOrCode.responseCode;

                    res.writeHead(code, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({code : code, message : errOrCode.message}));
                } else {

                    res.writeHead(errOrCode, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({code : errOrCode, message : err.message}));
                }

            };

            res.writeHead(200, { 'Content-Type': 'application/json' });

            try {

                callback(req, res);
            } catch(e) {

                self.container.log.error('uncaughtException', e.stack);
                res.error(500, e);
            }

            next();
        }

        self.app.use('/' + name, parseResponse);
    };
};

module.exports = MessageServer;

