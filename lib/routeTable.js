var MessageClient = require('./messageClient');
var mapMessageClient = {};

exports.getService = function(serviceName, callback) {

    // route table에서 정보 확인
    var serviceInfo = null;
    var messageClient = null;

    if(mapMessageClient[serviceName]) {

        messageClient = mapMessageClient[serviceName];
    } else {

        messageClient = new MessageClient(serviceName, serviceInfo);
        mapMessageClient[serviceName] = messageClient;
    }

    callback(null, messageClient);
};

exports.add = function() {

};

exports.remove = function() {

};