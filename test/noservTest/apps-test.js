/**
 * Created by Daesun on 14. 9. 11.
 */

var assert = require('assert');
var container = new (require('../../lib/container'))();
var restify = require('restify');

describe('apps-route', function() {

    var client = null;
    var appId = '';

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 500);
        });

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token' : 'supertoken',
                'X-Noserv-Application-Id' : 'supertoken'
            }
        });
    });

    after(function(done) {
        container.close(function() {

            setTimeout(done, 500);
        });
    });

    beforeEach(function(done) {

        client.del('/1/apps', function(err, req, res, obj) {

            client.post('/1/apps', {appname:'test'}, function (err, req, res, obj) {

                if(obj) {

                    appId = obj.objectId;
                }
                done();
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/apps', {appname:'test1'}, function (err, req, res, obj) {

                if(res.statusCode === 409) {

                    // todo: 지우고 다시 만드는 코드 추가
                    done();
                    return;
                }
                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);
                assert(obj.applicationId);
                assert(obj.clientKey);
                assert(obj.javascriptKey);
                assert(obj.dotNetKey);
                assert(obj.restApiKey);
                assert(obj.masterKey);

                done(err);
            });
        });
    });


    describe('update', function() {
        it('should update without error', function(done) {

            client.put('/1/apps/' + appId, {test:'updatedata'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert(obj.updatedAt);
                done(err);
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.get('/1/apps/'+ appId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done(err);
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/1/apps?appname=test', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                assert(obj.results);
                assert(obj.results.length > 0);
                done(err);
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.del('/1/apps/'+ appId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done(err);
            });
        });
    });
});