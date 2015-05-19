"use strict";

var MessageServer = require('./messageServer');
var routeTable = require('./routeTable');
var log = require('./logger');

var Container = function(config) {

    this.serviceName = '';
    this.moduleName = '';
    this.direction = {ip : '127.0.0.1', port : 8080};

    var serviceModule = null;
    var self = this;

    this.init = function(serviceName, moduleName, callback) {

        var self = this;

        self.serviceName = serviceName;
        self.moduleName = moduleName;

        // When the manager is missing, it loads manager module.
        routeTable.getService('MANAGER').then(function(service) {

            // Requesting an enrollment to the Manager ( When serviceName is missing, the task is allocated to the manager. The manager is registered as wait state at the route table. )
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

            log.info('initService : ' + serviceName);

            // Starting message server
            messageServer.start(port);

            messageServer.on('monitor', onMonitor);
            messageServer.on('kill', onKill);

            try {

                serviceModule = require(serviceName.toLowerCase() + 'service');
            } catch(e) {

            }


            if(!serviceModule) {

                var npm = require('npm');

                log.info('load module : ' + moduleName);

                npm.load({}, function (er) {

                    npm.commands.install([moduleName], function(err, data) {

                        log.info('npm load success : ' + moduleName);

                        serviceModule = require(serviceName.toLowerCase() + 'service');
                        initServiceModule(serviceModule);
                    });
                });

            } else {

                initServiceModule(serviceModule);
            }

            function initServiceModule(serviceModule) {

                if(serviceModule) {

                    // Calling init function at the module
                    serviceModule.init(self, function(err) {

                        // After running server, the state of its service is changed from waiting to running state.
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

        log.info('container close : ' + self.serviceName);

        // Deleting the service from the route table.
        routeTable.remove(this.serviceName, this.direction);

        // Calling close function at the module
        if(serviceModule)
            serviceModule.close(function(){

                // Terminating the message server
                messageServer.stop(function(err){
                    if(callback)
                        callback(err);
                });
            });
        else {

            // Terminating the message server
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

    this.addListener = function(name, callback) {

        messageServer.on(name, callback);

        // Registering at the route table
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

    this.log = log;

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

    var messageServer = new MessageServer();
};

process.on('uncaughtException', function(err) {

    log.error(err.stack);
});

module.exports = Container;
