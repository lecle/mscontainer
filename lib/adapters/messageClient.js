"use strict";

var request = require('request');

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

        var options = {
            method : method,
            uri : 'http://' + this.serviceInfo.ip + ':' + this.serviceInfo.port + '/' + command,
            timeout : 10000
        };

        if(method === 'get' || method === 'del') {

            options.qs = req;
        } else {

            options.body = req;
            options.json = true;
        }

        request(options, function(err, res) {

            if(!err) {

                if(res.body && res.body.charAt && res.body.charAt(0) === '{')
                    res.data = JSON.parse(res.body);
                else
                    res.data = res.body;

                if(res.data && res.data.code && res.data.message && res.data.code >= 400) {

                    err = new Error(res.data.message);
                    err.responseCode = res.data.code;
                }

                self.log.debug('response data '+ self.serviceName + '/' + command, res.data);
            }

            callback(err, res);
        });
    } else {

        callback(new Error(this.serviceName + ' service not found (send)'));
    }
}
