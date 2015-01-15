MicroService Container
============
[![Build Status](https://travis-ci.org/lecle/mscontainer.svg?branch=master)](https://travis-ci.org/lecle/mscontainer)
[![Coverage Status](https://coveralls.io/repos/lecle/mscontainer/badge.svg)](https://coveralls.io/r/lecle/mscontainer)

MicroService Container(이하 Container)는 각 MicroService들의 생성과 소멸, 인터페이스, 모니터링, 로깅을 담당한다.

MicroService의 생성
-----
Container를 실행할 때 다음의 로직으로 MicroService를 생성한다.

* 라우트 테이블에서 Manager MicroService(이하 Manager)를 찾는다.
  - 찾지 못했을 경우 : 본인이 Manager가 된다.
  - 찾았을 경우 : Manager에게 역할을 부여받는다.
* 부여받은 역할에 따라 MicroService를 로드한다.
  - 필요한 MicroService 모듈이 설치되어 있을경우 바로 실행한다.
  - 설치되어 있지 않을 경우 모듈 저장소에서 내려받은 후 실행한다.
* 생성된 모듈의 init function을 호출한다.

MicroService의 소멸
-----

Container는 다음과 같은 상황에서 MicroService를 소멸시킨다.
* Manager에서 Kill 메시지가 들어올 경우
  - 현재까지 들어온 메시지가 모두 처리된 뒤 프로세스를 종료한다.
  - kill 메시지가 들어온 이후에 들어오는 모든 메시지에는 404 오류코드를 리턴한다.

MicroService의 인터페이스
-----

Container는 MicroService간의 인터페이스를 담당한다.
* MicroService는 Container에 정의된 인터페이스를 통해 타 MicroService에 메시지를 보내고, callback을 받는다. 
* MicroService는 Container에 정의된 인터페이스를 통해 Service Name과 이벤트 핸들러를 등록하여 메시지를 받는다.

MicroService 모니터링 
-----

Container는 MicroService의 입출력 상황, cpu / 메모리 사용량 등을 모니터링하여 요청이 있을 경우 알려주고, 확장이 필요한 상황이라고 판단되면 Manager에게 요청한다.

로깅 
-----

MicroService의 로그 데이터를 로그 담당 MicroService에게 전송한다.
