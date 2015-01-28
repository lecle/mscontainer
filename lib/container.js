"use strict";

var messageServer = require('./messageServer');
var routeTable = require('./routeTable');

exports.serviceName = '';
exports.moduleName = '';
exports.direction = {ip : '127.0.0.1', port : 8080};

var serviceModule = null;

exports.init = function(serviceName, moduleName, callback) {

    exports.serviceName = serviceName;
    exports.moduleName = moduleName;

    // 메니저가 없으면 메니저 모듈을 로딩
    routeTable.getService('MANAGER', function(err, service) {

        var servicePort = 8080;

        if(!service) {

            exports.serviceName = 'MANAGER';
            exports.moduleName = 'lecle/managerservice';

            routeTable.add(exports.serviceName, exports.moduleName, exports.direction);

            initService(exports.serviceName, exports.moduleName, servicePort);
        } else {

            // 메니저에게 등록 요청 (serviceName이 없으면 메니저에게 작업 할당 요청이 됨. 메니저는 라우트 테이블에 실행 대기 상티로 등록.)
            service.send('init', {serviceName : exports.serviceName, moduleName : exports.moduleName}, function(err, res) {

                if(err) {

                    callback(err);
                } else {

                    exports.serviceName = res.data.serviceName;
                    exports.moduleName = res.data.moduleName;
                    exports.direction.ip = res.data.serviceInfo.ip;
                    exports.direction.port = res.data.serviceInfo.port;

                    if(exports.serviceName) {

                        initService(exports.serviceName, exports.moduleName, exports.direction.port);
                    } else {

                        // todo: wait mode
                    }

                }
            });
        }

        function initService(serviceName, moduleName, port) {

            // message server 실행
            messageServer.start(port);

            messageServer.on('monitor', monitor);

            try {

                serviceModule = require(serviceName.toLowerCase() + 'service');
            } catch(e) {

            }


            if(!serviceModule) {

                var npm = require('npm');

                console.log('load module : ' + moduleName);

                npm.load({}, function (er) {

                    npm.commands.install([moduleName], function(err, data) {

                        serviceModule = require(serviceName.toLowerCase() + 'service');
                        initServiceModule(serviceModule);
                    });
                });

            } else {

                initServiceModule(serviceModule);
            }

            function initServiceModule(serviceModule) {

                if(serviceModule) {

                    // 모듈의 init function 실행
                    serviceModule.init(exports, function(err) {

                        // 서버 실행 후 라우트 테이블에 실행 대기 상태 -> 실행 상태로 변경
                        routeTable.setStatus(serviceName, 'on');

                        callback(err);
                    });
                } else {

                    callback(new Error('service not found'));
                }
            }
        }
    });
};

exports.close = function() {

    // 라우트 테이블에서 삭제
    routeTable.remove(exports.serviceName, exports.direction);

    // 모듈의 close function 실행
    if(serviceModule)
        serviceModule.close(function(){});

    // message server 종료
    messageServer.stop();
};

exports.getService = function(name, callback) {

    routeTable.getService(name, callback);
};

exports.getRouteTable = function() {

    return routeTable;
};

exports.getRouteTableJSON = function() {

    return routeTable.getRouteTable();
};

exports.saveRouteTable = function() {

    routeTable.saveRouteTable();
};

exports.log = function(log) {

    routeTable.getService('LOG', function(err, service) {

        if(!service) {

            console.log(log);
        } else {

            service.post('log', {log : log}, function() {});
        }
    });
};

exports.addListener = function(name, callback) {

    messageServer.on(name, callback);

    // 라우트 테이블에 등록
};

exports.broadcast = function(command, req, callback) {

    routeTable.broadcast(command, req, callback);
};

function monitor(req, res) {

    res.send({
        serviceName : exports.serviceName,
        moduleName : exports.moduleName,
        direction : exports.direction,
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
    });

    //next();
}