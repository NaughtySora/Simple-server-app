# Application flow

## Independent load

### [no context]

### modules

1. node libs
2. npm libs

## Low dependent load

### [npm] [node]

### modules

1. config

- rarely could load something from remote source
- preferably should'n have behavior, calls
- preferably json format
- formats .js, .json, .ts (.yaml maybe later)

2. utils

- could use npm, extends npm util functions or more specific ones
- could use node libs

## App services load

### [config] [npm] [utils] [node]

_app independent - no circle load, no logging in app services_

### modules

_self independent modules, can be couple for testing, dev, prod, ...etc_

#### examples

1. loggers
2. security
3. session
4. validators
5. mapping

## Transport load

#### examples

### [config] [npm] [utils] [node] [app]

1. http
2. mailing
3. websockets

## Data Access load

### [config] [npm] [utils] [node] [app]

### examples

- storage.user.create(credentials)
- storage.company.create(data)

## Domain services

_main logic that uses storage, app services..._

### [npm] [utils] [node] [storage] [app]

### examples

1. services.user.create(credentials)
   _here we probably use storage.user.create, along with app.security for password and app.session for jwt token_
2. services.notification.referral.notify(userId)
3. services.report.user.statistics(userId, "cvs")
4. services.bonuses.check.referral(userId, refereeId)
5. services.validator.user.credentials(data: any);

## Domain modules

_application core logic, can be different for http, console, testing, websockets, TCP ... output_
_nothing but domain services calls, thin functions_

### [domain services]

### examples

1. http

- controller for validation, returns to handler only data it needed
- handler is doing domain logic

```js
// Example 1
// async controller:
// here we use domain services for validation and session because our application
// know what is user, what users fields are and how to validate
// domain service underneath uses app.validation, app.session
async ({ headers, body, params }) => {
  const user = await services.http.session.user(headers);
  const query = params.get('search');
  services.validator.smth.search(query);
  return { user, query };
};

// async handler:
async ({ user, query }) => {
  const smth = await services.smth.findBy(query);
  await services.smth2.do(user);
  // meta optional, it minimize handler knowledge, but here we work only with http and can
  // give this knowledge to domain logic about code, headers, and serialize method
  // we can test this module without http transport
  return { response: smth, meta: { serialize: 'json', code: 201, cookie: {} } };
};
```

# Loading contract

### Independent load

- node (list): Promise<NodeJSApi>
- npm (path): Promise<NPM>

### Low dependent load

- config (path, {node, npm}): Promise<Config>
- utils (path, {node, npm}) : Promise<Utils>

### App services load

- app services (path, {config npm utils node}): Promise<AppServices>

### Data Access Layer

- storage/repository (path, { config npm utils node, app }): Promise<Storage>

### Domain services

- services (path, { config npm utils node, app }): Promise<DomainServices>

### Domain Modules

- modules (path, { services, app }): Promise<DomainModules>

# Layers

## Data Access Layer

_storage, repository, working with persistence_

### example

- Postgres
- MongoDB
- Redis
- Prisma, TypeORM...

## Transport

_i/o from user to user_

### examples

- mails
- http, tcp, websocket

## Application

_third party services, validators, security/hashing/crypto, session, concrete implementation of transport_

### examples

- security -> scrypt hashing, bcrypt hashing
- session -> jwt
- http transport -> express, fastify
- websocket transport -> socket.io, nmp ws lib

## Domain

_Domain entities and use cases, core application logic_
_Can be divided to domain services and domain cases_

### examples

- User, Project, Report,
- creating user account, calculate referral bonus
