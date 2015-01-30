"use strict";

var MessageClient = require('./messageClient');
var routeTable = {};

exports.getService = function(serviceName, callback) {

    var messageClient = null;

    // route table에서 정보 확인
    if(routeTable[serviceName] && routeTable[serviceName].status === 'on') {

        messageClient = new MessageClient(serviceName, routeChooser(routeTable[serviceName]));
        callback(null, messageClient);

    } else {

        if(serviceName === 'MANAGER') {

            callback(new Error('manager service not found'));
            return;
        }

        // route table에 정보가 없을 경우 manager에게 요청한다.
        this.getService('MANAGER', function(err, service) {

            if(err) {

                callback(err);
                return;
            }

            service.post('create', {serviceName : serviceName}, function(err, res) {

                if(err) {

                    callback(err, null);
                    return;
                }

                messageClient = new MessageClient(res.data.serviceName, res.data.serviceInfo);
                callback(null, messageClient);
            });
        });
    }
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
    }

    exports.saveRouteTable(serviceName);
};

exports.broadcast = function(command, req, callback) {

    var async = require('async');

    var responses = [];

    var queue = async.queue(function(task, cb) {

        responses.push(task);

        cb();
    }, 5);

    queue.drain = function() {

        callback(null, {data : responses});
    };

    var responseCnt = 0;

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
                });

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

function routeChooser(route) {

    var routeInfo = {};

    routeInfo.moduleName = route.moduleName;

    var direction = {};

    if(route.direction && route.direction.length > 0) {

        // 같은 모듈이 여러개 떠있을 때
        // 우선은 랜덤으로 한다.
        var directionIndex = Math.floor(Math.random() * route.direction.length);

        console.log('directionIndex : ' + directionIndex);

        direction = route.direction[directionIndex];

        routeInfo.ip = direction.ip;
        routeInfo.port = direction.port;
    }

    return routeInfo;
}

function loadRouteTable() {

    if(process.env.NODE_ENV === 'test')
        routeTable = require('../test/serviceList.json');
    else
        routeTable = require('../serviceList.json');
}

loadRouteTable();