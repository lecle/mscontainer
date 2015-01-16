var routeTable = require('../lib/routeTable');

describe('routeTable', function() {
    describe('#getService()', function() {
        it('should get a manager service without error', function(done) {

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

            routeTable.getService('MANAGER', function(err) {

                done(err);
            });
        });

        it('should add and remove without error', function(done) {

            // test data
            routeTable.add('MANAGER', 'managerservice', {'ip' : '127.0.0.1', 'port' : 80});
            routeTable.add('MANAGER', 'managerservice', {'ip' : '127.0.0.1', 'port' : 81});

            routeTable.remove('MANAGER', {'ip' : '127.0.0.1', 'port' : 81});
            done();
        });
    });

});