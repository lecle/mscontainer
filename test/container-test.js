var container = require('../lib/container');

describe('container', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            // manager service load
            container.init('', '', function(err) {


                done(err);
            });
        });
    });

});