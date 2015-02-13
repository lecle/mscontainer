module.exports = (function getConfig() {

    if(process.env.NODE_ENV === 'test')
        return require('./config_test.json');

    if(process.env.NODE_ENV === 'local')
        return require('./config_local.json');

    return require('./config_deploy.json');
})();