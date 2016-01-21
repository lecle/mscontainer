"use strict";

var dummyServerManager = require('./dummyServerManager');

var MessageServer = function(container) {

    var serverPort = 0;

    this.container = container;

    var self = this;
    var log = this.container.log;

    this.start = function(port) {

        serverPort = port;
        self.server = {};

        if (!dummyServerManager[port]) {

            dummyServerManager[port] = self.server;
        }

        log.info('server.listen : ' + port);
    };

    this.stop = function(callback) {

        if (dummyServerManager[serverPort]) {

            log.info('server.stop : ' + serverPort);

            delete dummyServerManager[serverPort];
        }

        callback(null);
    };

    this.on = function(name, callback) {

        function parseResponse(req, clientCallback) {

            var res = {};

            res.send = function(jsonDataOrCode, jsonData) {

                var response = {};

                if(jsonData === undefined) {

                    response.data = jsonDataOrCode;
                    clientCallback(null, response);
                } else {

                    response.data = jsonData;
                    response.statusCode = jsonDataOrCode;
                    clientCallback(null, response);
                }
            };

            res.error = function(errOrCode, err) {

                if(err === undefined) {

                    clientCallback(errOrCode);
                } else {

                    err.responseCode = errOrCode;
                    clientCallback(err);
                }

            };

            try {

                callback({data : req}, res);
            } catch(e) {

                self.container.log.error('uncaughtException', e.stack);
                clientCallback(e);
            }
        }

        self.server[name] = parseResponse;
    };
};

module.exports = MessageServer;

