var assert = require('assert');
var container = new (require('../../lib/container'))();
var request = require('request');
var fs = require('fs');

describe('files-route', function() {

    var client = null;

    before(function(done) {
        container.init('', '', function(err) {

            setTimeout(done, 1000);
        });
    });

    after(function(done) {
        container.close(function() {

            setTimeout(done, 2000);
        });
    });

    describe('create', function() {
        it('should create without error', function(done) {

            var options = {
                url: 'http://localhost:3337/1/files',
                headers: {
                    'X-Noserv-Session-Token' : 'supertoken',
                    'X-Noserv-Application-Id' : 'supertoken'
                }
            };

            var r = request.post(options, function (e, r, body) {

                assert(body);

                body = JSON.parse(body);

                assert(body.url);
                assert(body.name);

                done(e);
            });

            var form = r.form();
            form.append('upload', fs.createReadStream(__dirname + '/testfile.txt'));

        });
    });

    describe('base64', function() {
        it('should create without error', function(done) {

            var body = {
                "base64":"aHR0cDovL3d3dy54dWwuZnIvYWpheC94ZG9tYWlucmVxdWVzdC5waHANCmh0dHA6Ly9ibG9ncy5tc2RuLmNvbS9iL2llaW50ZXJuYWxzL2FyY2hpdmUvMjAxMC8wNS8xMy94ZG9tYWlucmVxdWVzdC1yZXN0cmljdGlvbnMtbGltaXRhdGlvbnMtYW5kLXdvcmthcm91bmRzLmFzcHg=",
                "_ContentType":"text/plain"
            };

            var options = {
                url: 'http://localhost:3337/1/files/base64.txt',
                headers: {
                    'X-Noserv-Session-Token' : 'supertoken',
                    'X-Noserv-Application-Id' : 'supertoken'
                }
            };

            var r = request.post(options, function (e, r, body) {

                assert(body);

                body = JSON.parse(body);

                assert(body.url);
                assert(body.name);

                done(e);
            }).form(body);


        });
    });

    describe('delete', function() {
        it('should delete without error', function(done) {

            var options = {
                url: 'http://localhost:3337/1/files/testfile.txt',
                headers: {
                    'X-Noserv-Session-Token' : 'supertoken',
                    'X-Noserv-Application-Id' : 'supertoken',
                    'X-Noserv-Master-Key' : 'supertoken'
                }
            };

            request.del(options, function (e, r, body) {

                options.url = 'http://localhost:3337/1/files/base64.txt';

                request.del(options, function (e, r, body) {

                    done(e);
                });
            });
        });
    });
});