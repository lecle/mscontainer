module.exports = new (require('./lib/container'))();

module.exports.init('', '', function() {});

process.on('exit', module.exports.close);