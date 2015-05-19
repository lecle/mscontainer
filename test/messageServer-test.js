var messageServer = new (require('../lib/messageServer'))();
var MessageClient = require('../lib/messageClient');

describe('messageServer', function() {
    describe('#start()', function() {
        it('should start without error', function(done) {

            messageServer.start(8088);

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8088});

            client.post('testcommand', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('#on()', function() {
        it('should register event handler without error', function(done) {

            messageServer.on('test2', function(req, res, next) {


                res.send({test:'data',test2:{test3:'data2'}});
            });

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8088});

            client.post('test2', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('#on() - return error', function() {
        it('should register event handler with error', function(done) {

            messageServer.on('test3', function(req, res, next) {


                res.error(new Error('test3'));
            });

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8088});

            client.del('test3', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('#on() - return error with error code', function() {
        it('should register event handler with error code', function(done) {

            messageServer.on('test4', function(req, res, next) {


                res.error(500, new Error('test4'));
            });

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8088});

            client.put('test4', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('monitor', function() {
        it('should monitor without error', function(done) {

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8088});

            client.get('monitor', {}, function(err, res) {

                done();
            });
        });
    });

    describe('#stop', function() {
        it('should stop without error', function(done) {

            messageServer.stop(done);
        });
    });
});
