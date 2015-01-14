var messageServer = require('../lib/messageServer');
var MessageClient = require('../lib/messageClient');

describe('messageServer', function() {
    describe('#start()', function() {
        it('should start without error', function(done) {

            messageServer.start(8080);

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8080});

            client.post('testcommand', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('#on()', function() {
        it('should register event handler without error', function(done) {

            messageServer.on('test', function(req, res, next) {


                res.end('OK');
            });

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8080});

            client.post('test', {testcol:'value'}, function(err, res) {

                done();
            });
        });
    });

    describe('monitor', function() {
        it('should monitor without error', function(done) {

            var client = new MessageClient('test', {ip : '127.0.0.1', port : 8080});

            client.get('monitor', {}, function(err, res) {

                done();
            });
        });
    });
});