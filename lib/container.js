"use strict";

var MessageServer = require('./messageServer');
var routeTable = require('./routeTable');

var Container = function(config) {

    this.serviceName = '';
    this.moduleName = '';
    this.direction = {ip : '127.0.0.1', port : 8080};

    var serviceModule = null;
    var messageServer = new MessageServer();
    var self = this;

    this.init = function(serviceName, moduleName, callback) {

        var self = this;

        self.serviceName = serviceName;
        self.moduleName = moduleName;

        // 메니저가 없으면 메니저 모듈을 로딩
        routeTable.getService('MANAGER').then(function(service) {

            // 메니저에게 등록 요청 (serviceName이 없으면 메니저에게 작업 할당 요청이 됨. 메니저는 라우트 테이블에 실행 대기 상티로 등록.)
            service.send('init', {serviceName : self.serviceName, moduleName : self.moduleName}, function(err, res) {

                if(err) {

                    callback(err);
                } else {

                    self.serviceName = res.data.serviceName;
                    self.moduleName = res.data.moduleName;
                    self.direction.ip = res.data.serviceInfo.ip;
                    self.direction.port = res.data.serviceInfo.port;

                    if(self.serviceName) {

                        initService(self.serviceName, self.moduleName, self.direction.port);
                    } else {

                        // todo: wait mode
                    }

                }
            });

        }).fail(function(err) {

            var servicePort = 8080;

            self.serviceName = 'MANAGER';
            self.moduleName = 'lecle/managerservice';

            initService(self.serviceName, self.moduleName, servicePort);
        });


        function initService(serviceName, moduleName, port) {

            console.log('initService : ' + serviceName);

            // message server 실행
            messageServer.start(port);

            messageServer.on('monitor', onMonitor);
            messageServer.on('kill', onKill);

            try {

                serviceModule = require(serviceName.toLowerCase() + 'service');
            } catch(e) {

            }


            if(!serviceModule) {

                var npm = require('npm');

                console.log('load module : ' + moduleName);

                npm.load({}, function (er) {

                    npm.commands.install([moduleName], function(err, data) {

                        console.log('npm load success : ' + moduleName);

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
                    serviceModule.init(self, function(err) {

                        // 서버 실행 후 라우트 테이블에 실행 대기 상태 -> 실행 상태로 변경
                        routeTable.setStatus(serviceName, 'on');

                        callback(err);
                    });
                } else {

                    callback(new Error(serviceName + ' service not found (initServiceModule)'));
                }
            }
        }
    };

    this.close = function(callback) {

        console.log('container close : ' + self.serviceName);

        // 라우트 테이블에서 삭제
        routeTable.remove(this.serviceName, this.direction);

        // 모듈의 close function 실행
        if(serviceModule)
            serviceModule.close(function(){

                // message server 종료
                messageServer.stop(function(err){
                    if(callback)
                        callback(err);
                });
            });
        else {

            // message server 종료
            messageServer.stop(function(err){
                if(callback)
                    callback(err);
            });
        }

    };

    this.getService = function(name) {

        if(name === '') {

            name = routeTable.getNextServiceName(this.serviceName);
        }

        return routeTable.getService(name);
    };

    this.getRouteTable = function() {

        return routeTable;
    };

    this.getRouteTableJSON = function() {

        return routeTable.getRouteTable();
    };

    this.saveRouteTable = function() {

        routeTable.saveRouteTable();
    };

    this.log = function(log) {

        routeTable.getService('LOG').then(function(service) {

            service.post('log', {log : log}, function() {});

        }).fail(function(err) {

            console.log(log);
        });
    };

    this.addListener = function(name, callback) {

        messageServer.on(name, callback);

        // 라우트 테이블에 등록
    };

    this.broadcast = function(command, req, callback) {

        routeTable.broadcast(command, req, callback);
    };

    this.createNewInstance = function() {

        return new Container(this.getConfig());
    };

    this.config = null;
    this.getConfig = function(name) {

        var config = this.config ? this.config : require('../conf/config');

        if(name)
            return config[name];

        return config;
    };

    this.setConfig = function(conf) {

        this.config = conf;
    };

    function onMonitor(req, res) {

        res.send({
            serviceName : self.serviceName,
            moduleName : self.moduleName,
            direction : self.direction,
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        });

        //next();
    }

    function onKill(req, res) {

        self.close();
        res.send(200, {});

        //next();
    }

    if(config)
        this.setConfig(config);
};

process.on('uncaughtException', function(err) {

    console.log(err.stack);
});

module.exports = Container;