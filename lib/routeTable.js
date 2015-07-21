"use strict";

var MessageClient = require('./messageClient');
var Q = require('q');

var routeTable = {};

exports.getService = function(serviceName, container) {

    var messageClient = null;
    var def = Q.defer();

    // Checking its status at the route table
    if(routeTable[serviceName] && routeTable[serviceName].status === 'on') {

        messageClient = new MessageClient(serviceName, routeChooser(routeTable[serviceName]), container);

        def.resolve(messageClient);

    } else {

        if(serviceName === 'MANAGER') {

            def.reject(new Error('manager service not found'));
            return def.promise;
        }

        container.log.error('service not found ', routeTable[serviceName]);

        // If the content at the route table is missing, it ask for manager.
        this.getService('MANAGER').then(function(service) {

            service.post('create', {serviceName : serviceName}, function(err, res) {

                if(err) {

                    def.reject(err);
                    return;
                }

                messageClient = new MessageClient(res.data.serviceName, res.data.serviceInfo, container);
                def.resolve(messageClient);
            });
        }).fail(function(err) {

            def.reject(err);
            return;
        });
    }

    return def.promise;
};

exports.setRouteTable = function(table) {

    routeTable = table;
};

exports.getRouteTable = function() {

    return routeTable;
};

exports.add = function(serviceName, moduleName, direction) {

    if(routeTable[serviceName]) {

        if(routeTable[serviceName].direction === undefined)
            routeTable[serviceName].direction = [];

        routeTable[serviceName].direction.push(direction);
    } else {

        routeTable[serviceName] = {
            serviceName : serviceName,
            moduleName : moduleName,
            direction : [direction]
        };
    }

    exports.saveRouteTable(serviceName);

    return routeTable[serviceName];
};

exports.remove = function(serviceName, direction) {

    if(routeTable[serviceName] && routeTable[serviceName].direction) {

        for(var i= 0, cnt=routeTable[serviceName].direction.length; i<cnt; i++) {

            if(routeTable[serviceName].direction[i].ip === direction.ip
            && routeTable[serviceName].direction[i].port === direction.port) {

                routeTable[serviceName].direction.splice(i, 1);
            }
        }

        if(routeTable[serviceName].direction.length === 0) {

            delete routeTable[serviceName].direction;
            exports.setStatus(serviceName, 'off');
        }
        else {

            exports.saveRouteTable(serviceName);
        }

    }
};

exports.broadcast = function(command, req, container, callback) {

    var responseCnt = 0;

    var async = require('async');

    var responses = [];

    var queue = async.queue(function(task, cb) {

        responses.push(task);

        cb();
    }, 5);

    queue.drain = function() {

        if(responseCnt === responses.length)
            callback(null, {data : responses});
    };

    for(var name in routeTable) {

        if(routeTable[name].direction) {

            var directions = routeTable[name].direction;

            for(var i= 0, cnt=directions.length; i<cnt; i++) {

                var moduleName = routeTable[name].moduleName;
                var ip = routeTable[name].direction[i].ip;
                var port = routeTable[name].direction[i].port;

                var messageClient = new MessageClient(name, {
                    moduleName : moduleName,
                    ip : ip,
                    port : port
                }, container);

                responseCnt ++;

                messageClient.send(command, req, function(err, res) {

                    if(res) {

                        queue.push(res.data, function(err) {});

                    } else {

                        queue.push({
                            serviceName : name,
                            moduleName : moduleName,
                            ip : ip,
                            port : port,
                            error : 'response is null'
                        }, function(err) {});
                    }

                });
            }
        }
    }

    if(responseCnt === 0)
        callback(null, {data : responses});
};

exports.saveRouteTable = function(serviceName) {
/*
    var jsonFile = require('json-file-plus');
    var path = require('path');
    var filename = path.join(process.cwd(), 'serviceList.json');

    if(process.env.NODE_ENV === 'test')
        filename = path.join(process.cwd(), 'test', 'serviceList.json');

    jsonFile(filename, function(err, file) {

        if(err) {

            console.log('error', err.message);
            return;
        }

        var saveData = {};
        saveData[serviceName] = routeTable[serviceName];

        file.set(saveData);

        file.save(function() {}).then(function () {
            console.log('success!');
        }).catch(function (err) {
            console.log('error!', err);
        });
    });
*/
};

exports.setStatus = function(name, value) {

    if(routeTable[name]) {

        routeTable[name].status = value;
        this.saveRouteTable(name);
    }
};

exports.getStatus = function(name) {

    if(routeTable[name]) {

        return routeTable[name].status;
    }

    return '';
};

exports.getNextServiceName = function(name) {

    if(routeTable[name]) {

        return routeTable[name].next;
    }

    return '';
};

function routeChooser(route) {

    var routeInfo = {};

    routeInfo.moduleName = route.moduleName;

    var direction = {};

    if(route.direction && route.direction.length > 0) {

        // The situation when there are several modules.
        // First of all, it chooses randomly.
        var directionIndex = Math.floor(Math.random() * route.direction.length);

        direction = route.direction[directionIndex];

        routeInfo.ip = direction.ip;
        routeInfo.port = direction.port;
    }

    return routeInfo;
}

function loadRouteTable() {

    var _ = require('underscore');

    if(_.isEmpty(routeTable)) {

        if(process.env.NODE_ENV === 'test')
            routeTable = require('../test/serviceList.json');
        else
            routeTable = require('../serviceList.json');
    }
}

loadRouteTable();
