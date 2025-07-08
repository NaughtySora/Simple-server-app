# Simple server application

> Layers App
- storage - data access layer.
- transport - manages how data will be delivered to client (mailing, http, tcp ...).
- application - building block of application.
- domain - center, main logic, entities and use cases.

> Easy module loading
- loading modules (npm, domain, utils, ...)
- loading storage/transport interfaces, injects dependencies

> Dependency Injection 
- provides better testing, easy modules substitutions, agnostic approach
