var routeTable = require('../lib/routeTable');
var assert = require('assert');

describe('routeTable', function() {

    describe('#setRouteTable()', function() {

        it('should setRouteTable without error', function(done) {

            // test data
            routeTable.setRouteTable({
                'MANAGER': {
                    'serviceName' : 'MANAGER',
                    'moduleName' : 'managerservice',
                    'status' : 'on',
                    'direction' : [{
                        'ip' : '127.0.0.1',
                        'port' : 80
                    }]
                }
            });

            done();
        });
    });

    describe('#getService()', function() {
        it('should get a manager service without error', function(done) {

            routeTable.getService('MANAGER').then(function(){done();}).fail(done);
        });
    });

    describe('#add()', function() {

        it('should add and remove without error', function(done) {

            // test data
            routeTable.add('MANAGER', 'managerservice', {'ip' : '127.0.0.1', 'port' : 80});
            routeTable.add('MANAGER', 'managerservice', {'ip' : '127.0.0.1', 'port' : 81});

            routeTable.remove('MANAGER', {'ip' : '127.0.0.1', 'port' : 81});
            done();
        });
    });

    describe('#broadcast()', function() {

        it('should broadcast without error', function(done) {

            // test data
            routeTable.broadcast('monitor', {}, done);
        });
    });

    describe('#saveRouteTable()', function() {

        it('should saveRouteTable without error', function(done) {

            routeTable.saveRouteTable('MANAGER');
            done();
        });
    });

    describe('#setStatus()', function() {

        it('should setStatus without error', function(done) {

            routeTable.setStatus('MANAGER', 'on');
            done();
        });
    });

    describe('#getStatus()', function() {

        it('should getStatus without error', function(done) {

            assert(routeTable.getStatus('MANAGER'));
            assert.equal('', routeTable.getStatus('testtesttest!@#'));
            done();
        });
    });
});