"use strict";

var dummyServerManager = require('./dummyServerManager');

var MessageClient = function(serviceName, serviceInfo, container) {

    this.serviceName = serviceName;
    this.serviceInfo = serviceInfo;
    this.container = container;
    this.log = this.container.log;
};

module.exports = MessageClient;

MessageClient.prototype.get = function(command, req, callback) {

    send.call(this, 'get', command, req, callback);
};

MessageClient.prototype.post = function(command, req, callback) {

    send.call(this, 'post', command, req, callback);
};

MessageClient.prototype.put = function(command, req, callback) {

    send.call(this, 'put', command, req, callback);
};

MessageClient.prototype.del = function(command, req, callback) {

    send.call(this, 'del', command, req, callback);
};

MessageClient.prototype.send = function(command, req, callback) {

    send.call(this, 'post', command, req, callback);
};

function send(method, command, req, callback) {

    var self = this;

    if(self.serviceInfo && self.serviceInfo.ip && self.serviceInfo.port) {

        self.log.info('send to ' + this.serviceName + ' ' + this.serviceInfo.ip + ':' + this.serviceInfo.port + '/' + command);
        self.log.debug('send data ' + this.serviceName + '/' + command, req);

        if (!dummyServerManager[self.serviceInfo.port]) {

            return callback(new Error(this.serviceName + ' service not found (send)'));
        }

        var server = dummyServerManager[self.serviceInfo.port];

        if (!server[command]) {

            return callback(new Error(this.serviceName + ' service not found (send)'));
        }

        var timer = setTimeout(function() {

            self.log.error(this.serviceName + '/' + command + ' timeout');
            callback(new Error('timeout'));
        }, 60000);

        var domain = require('domain').create();

        domain.on('error', function(err) {
            clearTimeout(timer);
            self.log.error(this.serviceName + '/' + command + ' error');
            callback(err);
        });

        server[command](req, domain.bind(function(err, res) {

            clearTimeout(timer);

            callback(err, res);
        }));
    } else {

        return callback(new Error(this.serviceName + ' service not found (send)'));
    }
}
