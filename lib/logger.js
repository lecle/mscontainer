"use strict";

var winston = require('winston');
var path = require('path');

require('date-utils');

var logger = null;
var date = '';
var logPath = '';

exports.info = function(message, data) {

    log('info', message, data);
};

exports.error = function(message, data) {

    log('error', message, data);
};

function log(type, message, data) {

    checkDate();

    if(data) {

        if(typeof(data) === 'object')
            message += ' ' + JSON.stringify(data);
        else if(data.toString)
            message += ' ' + data.toString();
    }

    logger[type](message);
}

function checkDate() {

    var now = new Date();

    var ymd = now.toFormat('YYYY-MM-DD');

    if(date != ymd) {

        date = ymd;

        var newLogPath = path.join(process.cwd(), 'logs', 'noserv.' + date + '.log');

        logger = new winston.Logger({

            transports: [
                new winston.transports.File({
                    json       : false,
                    maxsize : 100000000,
                    filename   : newLogPath,
                    timestamp : true,
                    level : 'debug'
                })
            ]
        });

        logger.exitOnError = false;
    }
}
