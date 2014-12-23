var messageServer = require('./messageServer');
var routeTable = require('./routeTable');

module.serviceName = '';
module.init = function(serviceName, callback) {

    module.serviceName = serviceName;

    // 메니저가 없으면 메니저 모듈을 로딩
    routeTable.getService('MANAGER', function(err, service) {

        var servicePort = 80;

        if(!service) {

            module.serviceName = 'MANAGER';

            initService(module.serviceName, servicePort);
        } else {

            // 메니저에게 등록 요청 (serviceName이 없으면 메니저에게 작업 할당 요청이 됨. 메니저는 라우트 테이블에 실행 대기 상티로 등록.)
            service.send('init', {serviceName : module.serviceName}, function(err, res) {

                module.serviceName = res.data.serviceName;
                servicePort = res.data.servicePort;

                initService(module.serviceName, servicePort);
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

module.close = function() {

    // 라우트 테이블에서 삭제
    // 모듈의 close function 실행
    // message server 종료
};

module.send = function(req, callback) {

};

module.monitor = function() {

};

module.log = function(log) {

};

module.route = function() {

};