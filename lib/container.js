var messageServer = require('./messageServer');
var routeTable = require('./routeTable');

exports.serviceName = '';
exports.init = function(serviceName, callback) {

    exports.serviceName = serviceName;

    // 메니저가 없으면 메니저 모듈을 로딩
    routeTable.getService('MANAGER', function(err, service) {

        var servicePort = 80;

        if(!service) {

            exports.serviceName = 'MANAGER';

            initService(exports.serviceName, servicePort);
        } else {

            // 메니저에게 등록 요청 (serviceName이 없으면 메니저에게 작업 할당 요청이 됨. 메니저는 라우트 테이블에 실행 대기 상티로 등록.)
            service.send('init', {serviceName : exports.serviceName}, function(err, res) {

                exports.serviceName = res.data.serviceName;
                servicePort = res.data.servicePort;

                initService(exports.serviceName, servicePort);
            });
        }

        function initService(serviceName, port) {

            // message server 실행

            // 모듈 찾아보고 없으면 모듈 저장소에서 내려받음.

            // 모듈의 init function 실행

            // 서버 실행 후 라우트 테이블에 실행 대기 상태 -> 실행 상태로 변경

            callback();
        }
    });
};

exports.close = function() {

    // 라우트 테이블에서 삭제
    // 모듈의 close function 실행
    // message server 종료
};

exports.send = function(req, callback) {

};

exports.monitor = function() {

};

exports.log = function(log) {

};

exports.route = function() {

};

exports.addListener = function() {

};