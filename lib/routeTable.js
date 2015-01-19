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

                messageClient = new MessageClient(res.data.serviceName, res.data.serviceInfo);
                callback(null, messageClient);
            });
        });
    }

};

exports.setRouteTable = function(table) {

    routeTable = table;
};

exports.add = function(serviceName, moduleName, direction) {

    if(routeTable[serviceName]) {

        routeTable[serviceName].direction.push(direction);
    } else {

        routeTable[serviceName] = {
            serviceName : serviceName,
            moduleName : moduleName,
            direction : [direction]
        };
    }
};

exports.remove = function(serviceName, direction) {

    if(routeTable[serviceName]) {

        for(var i= 0, cnt=routeTable[serviceName].direction.length; i<cnt; i++) {

            if(routeTable[serviceName].direction[i].ip === direction.ip
            && routeTable[serviceName].direction[i].port === direction.port) {

                routeTable[serviceName].direction.splice(i, 1);
            }
        }
    }
};

function routeChooser(route) {

    var routeInfo = {};

    routeInfo.moduleName = route.moduleName;

    // 같은 모듈이 여러개 떠있을 때
    // 우선은 랜덤으로 한다.
    var direction = route.direction[Math.floor(Math.random() * route.direction.length)];

    routeInfo.ip = direction.ip;
    routeInfo.port = direction.port;

    return routeInfo;
}

function loadRouteTable() {

    routeTable = require('../serviceList');
}

loadRouteTable();