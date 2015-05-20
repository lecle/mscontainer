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

    var newLogPath = path.join(process.cwd(), 'logs', 'noserv.' + date + '.log');

    var transports = [
        new winston.transports.File({
            json       : false,
            maxsize : 100000000,
            filename   : newLogPath,
            timestamp : true,
            level : 'debug'
        })
    ];

    if(process.env.NODE_ENV === 'test') {

        transports.push(
            new winston.transports.Console({
                level : 'debug'
            })
        )
    }

    logger = new winston.Logger({

        transports: transports
    });

    logger.exitOnError = false;

}
