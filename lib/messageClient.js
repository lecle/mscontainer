
var MessageClient = function(serviceName, serviceInfo) {

    this.serviceName = serviceName;
    this.serviceInfo = serviceInfo;
};

module.exports = MessageClient;

MessageClient.prototype.send = function(command, req, callback) {

    // todo: 미구현
    callback(null, {data:{serviceName:'test', servicePort:'8888'}});
};