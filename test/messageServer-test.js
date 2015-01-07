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

});