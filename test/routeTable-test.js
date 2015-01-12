var routeTable = require('../lib/routeTable');

describe('routeTable', function() {
    describe('#getService()', function() {
        it('should get a manager service without error', function(done) {

            // test data
            routeTable.setRouteTable({
                'MANAGER': {
                    'serviceName' : 'MANAGER',
                    'moduleName' : 'managerservice',
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
    });

});