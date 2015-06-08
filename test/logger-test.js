var log = require('../lib/logger');

describe('logger', function() {
    describe('#info()', function () {
        it('should log without error', function (done) {

            log.info('test');
            log.info('test', {test : 'data'});

            done();
        });
    });

    describe('#error()', function () {
        it('should log without error', function (done) {

            log.error('test');
            log.error('test', {test : 'data'});

            done();
        });
    });

    describe('#debug()', function () {
        it('should log without error', function (done) {

            log.debug('test');
            log.debug('test', {test : 'data'});

            done();
        });
    });
});
