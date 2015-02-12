var assert = require('assert');
var container = new (require('../../lib/container'))();
var restify = require('restify');

describe('users-route', function() {

    var client = null;
    var userId = null;

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 1000);
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

            setTimeout(done, 1000);
        });
    });

    beforeEach(function(done) {

        client.del('/1/users', function(err, req, res, obj) {

            client.post('/1/users', {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                if(obj) {

                    userId = obj.objectId;
                }
                done();
            });
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            client.post('/1/users', {username:'test2', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                if(res.statusCode === 409) {

                    // todo: 지우고 다시 만드는 코드 추가
                    done();
                    return;
                }
                assert.equal(201, res.statusCode);
                assert(obj.createdAt);
                assert(obj.objectId);
                assert(obj.sessionToken);

                done(err);
            });
        });
    });

    describe('login', function() {
        it('should login without error', function(done) {

            client.get('/1/login?username=test&password=pass', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('read', function() {
        it('should read without error', function(done) {

            client.get('/1/users/' + userId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('readMe', function() {
        it('should readMe without error', function(done) {

            client.get('/1/users/me', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('update', function() {
        it('should update without error', function(done) {

            client.put('/1/users/' + userId, {username:'test', password:'pass', phone:'010-1111-2222'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('find', function() {
        it('should find without error', function(done) {

            client.get('/1/users?username=test', function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('destroy', function() {
        it('should destroy without error', function(done) {

            client.del('/1/users/' + userId, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });

    describe('resetPassword', function() {
        it('should resetPassword without error', function(done) {

            client.post('/1/requestPasswordReset', {email:'test@test.com'}, function (err, req, res, obj) {

                assert.equal(200, res.statusCode);
                done();
            });
        });
    });
});