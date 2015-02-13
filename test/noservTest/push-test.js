var assert = require('assert');
var container = new (require('../../lib/container'))();
var restify = require('restify');

describe('push-route', function() {

    var client = null;
    var pushId = '';

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 1000);
        });

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token' : 'supertoken',
                'X-Noserv-Application-Id' : 'supertoken',
                'X-Noserv-Master-Key' : 'supertoken'
            }
        });
    });

    after(function(done) {
        client.del('/1/installations', function(err, req, res, obj) {

            client.del('/1/push', function(err, req, res, obj) {

                container.close(function() {

                    setTimeout(done, 1000);
                });
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/installations', {deviceType:'ios', deviceToken:'test', channels : ['', 'test']}, function (err, req, res, obj) {

                if(obj) {

                    client.post('/1/push', {"data":{"alert":"노섭에서 알려드립니다~~","badge":"100"}}, function (err, req, res, obj) {

                        assert.equal(201, res.statusCode);
                        assert(obj.createdAt);
                        assert(obj.objectId);

                        pushId =obj.objectId;

                        done(err);
                    });
                }
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.get('/1/push/' + pushId, function(err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert(obj);

                done(err);
            });
        });
    });

    describe('find', function() {
        it('should read without error', function(done) {

            client.get('/1/push', function(err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert(obj);
                assert(obj.results);
                assert(obj.results.length);

                done(err);
            });
        });
    });
});