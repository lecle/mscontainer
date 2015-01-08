var MessageClient = require('./messageClient');
var messageClientMap = {};
var routeTable = {};

exports.getService = function(serviceName, callback) {

    var serviceInfo = null;
    var messageClient = null;

    if(messageClientMap[serviceName]) {

        messageClient = messageClientMap[serviceName];
        callback(null, messageClient);
    } else {

        // route table에서 정보 확인
        if(routeTable[serviceName]) {

            messageClient = new MessageClient(serviceName, routeTable[serviceName]);
            messageClientMap[serviceName] = messageClient;
            callback(null, messageClient);

        } else {

            if(serviceName === 'MANAGER') {

                callback(new Error('manager service not found'));
                return;
            }

            // route table에 정보가 없을 경우 manager에게 요청한다.
            this.getService('MANAGER', function(err, service) {

                service.post('create', {serviceName : serviceName}, function(err, res) {

                    messageClient = new MessageClient(res.data.serviceName, res.data.serviceInfo);
                    messageClientMap[res.data.serviceName] = messageClient;
                    callback(null, messageClient);
                });
            });
        }
    }
};

exports.setRouteTable = function(table) {

    routeTable = table;
};

exports.add = function() {

};

exports.remove = function() {

};