"use strict";

var request = require('request');

var MessageClient = function(serviceName, serviceInfo) {

    this.serviceName = serviceName;
    this.serviceInfo = serviceInfo;
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

    if(this.serviceInfo && this.serviceInfo.ip && this.serviceInfo.port) {

        console.log('send command - ' + command + '  data - ', req);

        var options = {
            method : method,
            uri : 'http://' + this.serviceInfo.ip + ':' + this.serviceInfo.port + '/' + command,
            timeout : 1000
        };

        if(method === 'get' || method === 'del') {

            options.qs = req;
        } else {

            options.body = req;
            options.json = true;
        }

        request(options, function(err, res) {

            if(!err) {

                console.log('response : ', res.body);

                if(res.body && res.body.charAt && res.body.charAt(0) === '{')
                    res.data = JSON.parse(res.body);
                else
                    res.data = res.body;

                if(res.data && res.data.code && res.data.message && res.data.code >= 400) {

                    err = new Error(res.data.message);
                    err.responseCode = res.data.code;
                }

            }

            callback(err, res);
        });
    } else {

        callback(new Error('service not found'));
    }
}