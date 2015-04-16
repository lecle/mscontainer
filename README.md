MicroService Container
============
[![Build Status](https://travis-ci.org/lecle/mscontainer.svg?branch=master)](https://travis-ci.org/lecle/mscontainer)
[![Coverage Status](https://coveralls.io/repos/lecle/mscontainer/badge.svg?branch=master)](https://coveralls.io/r/lecle/mscontainer?branch=master)

MicroService Container (Hereinafter “Container”) takes charge of creation, deletion, interface, monitoring, log on MicroService.

Creating MicroService
-----
When the MicroService runs the Container, it follows below logic.

* It looks up Manager MicroService(Hereinafter “Manager”) from the route table.
  - If not found, the Container becomes the Manager itself.
  - If found, the Manager allocates task to the Container.
* According to granted task, the Container loads its MicroService. 
  - If a demanding MicroService module is installed, it is executed right away.
  - If not, after downloading from module repository, it is executed.
* `init` function will be called from the created module.

Destructing MicroService
-----

The Container destroy the MicroService In the following situations.
* When the Container receives a `Kill` message from the Manager.
  - The container terminates the process when every incoming message is handled.
  - For every incoming message after the `Kill` message, the Container returns `404 error` to them.

Interface of MicroService
-----

Container is an interface between MicroServices.
* The MicroService sends messages to other MicroService through interface declared at the Container.
* The MicroService registers a Service Name and event handlers by the Container interface, it can receive messages through. 

Monitoring MicroService
-----
The Container monitors input, output, cpu and memory usage of the MicroService and it notifies the status if requested. When it comes to be decided to extend, the Container requests it to the Manager. 


Logging Message
-----
The Container sends the log data to log administrator of the MicroService.
