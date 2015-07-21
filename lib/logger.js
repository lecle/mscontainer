"use strict";

var winston = require('winston');
var path = require('path');

require('date-utils');

var logger = null;
var date = '';
var config = {};

var os = require('os');

exports.init = function(conf) {

    config = conf;
};

exports.info = function(message, data) {

    log('info', message, data);
};

exports.error = function(message, data) {

    log('error', message, data);
};

exports.debug = function(message, data) {

    log('debug', message, data);
};

function log(type, message, data) {

    process.nextTick(function() {

        checkDate();

        if(data) {

            if(typeof(data) === 'object')
                message += ' ' + JSON.stringify(data);
            else if(data.toString)
                message += ' ' + data.toString();
        }

        logger[type](message);
    });
}

function checkDate() {

    var now = new Date();

    var ymd = now.toFormat('YYYY-MM-DD');

    if(date === ymd)
        return;

    date = ymd;

    var transports = [];

    // During the test using both file and s3

    var logDir = 'logs';

    if(config && config.path)
        logDir = config.path;

    var newLogPath = path.join(process.cwd(), logDir, 'noserv.' + date + '.log');

    transports.push(
        new winston.transports.File({
            json : false,
            maxsize : 100000000,
            filename   : newLogPath,
            timestamp : true,
            level : 'info',
            name : 'local'
        })
    );

    if(process.env.DEBUG_LEVEL) {

        transports.push(
            new winston.transports.Console({
                level : process.env.DEBUG_LEVEL
            })
        )
    }

    logger = new winston.Logger({

        transports: transports
    });

    if(config && config.type === 's3') {

        var winstonS3 = require('winston-s3');

        winstonS3.prototype.log = function (level, msg, meta, cb) {

            var item,
                _this = this;

            if (msg == null) {
                msg = '';
            }
            if (this.silent) {
                cb(null, true);
            }

            item = new Date().toISOString() + ' - ' + level + ': ' + msg + '\n'

            return this.open(function(newFileRequired) {
                _this.bufferSize += item.length;
                _this._stream.write(item);
                _this.emit("logged");
                return cb(null, true);
            });
        };

        winstonS3.prototype._s3Path = function () {

            var d = new Date;
            return "/server-log/" + (d.getUTCFullYear()) + "/" + (d.getUTCMonth() + 1) + "/" + (d.getUTCDate()) + "/" + (d.toISOString()) + "_" + this._id + ".log";
        };

        logger.add(winstonS3, {
            key: config.accessKeyId
            , secret: config.secretAccessKey
            , bucket: config.bucket
            , region: 'ap-northeast-1'

            // optional
            , maxSize: 20 * 1024 * 1024 // default
            , nested: false
            , temp: false
            , debug: false
            , headers: {} //headers that will be passed along to knox for the http requests
        })
    }

    logger.exitOnError = false;

}
