"use strict";

var winston = require('winston');
var path = require('path');

require('date-utils');

var logger = null;
var date = '';
var logPath = '';
var config = {};
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;

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

    if(config && config.type === 's3') {

        var nameFormat = 'server-log/%Y/%m/%d/noserv-server_' + os.hostname() + '_%Y%m%d%H%M.log';

        var s3Stream = new S3StreamLogger({
            bucket: config.bucket,
            access_key_id: config.accessKeyId,
            secret_access_key: config.secretAccessKey,
            max_file_size : 100000000,
            buffer_size : 100000,
            name_format : nameFormat
        });

        transports.push(
            new winston.transports.File({
                json : false,
                timestamp : true,
                level : 'info',
                stream : s3Stream,
                name : 's3'
            })
        );

    }

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

    logger.exitOnError = false;

}
