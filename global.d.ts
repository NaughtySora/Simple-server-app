import pg, { Pool, Query } from '@types/pg';
import jwt from '@types/jsonwebtoken';
import jsonschema from '@types/json-schema';
import utils from 'naughty-util';
import express from 'express';
import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';
import Util from 'node:util';
import Url from 'node:url';
import Timers from 'node:timers';
import Stream from 'node:stream';
import Process from 'node:process';
import perfHooks from 'node:perf_hooks';
import Os from 'node:os';
import Net from 'node:net';
import Fs from 'node:fs';
import Events from 'node:events';
import Crypto from 'node:crypto';
import Console from 'node:console';
import Childprocess from 'node:child_process';
import Cluster from 'node:cluster';
import Buffer from 'node:buffer';
import Path from 'node:path';
import Http, { IncomingMessage, ServerResponse } from 'node:http';
import DomainError from './src/utils/DomainError';
import NetworkError from './src/utils/NetworkError';

interface SessionData {
  data: {
    [k: string]: any;
    _type: string;
  };
  iat: number;
  exp: number;
}

interface HTTPResponseMeta {
  code?: number;
  headers?: Record<string, string>;
  serialize?: 'json';
}
type HTTPMethods = 'get' | 'post' | 'put' | 'patch' | 'delete';
type AsyncCallback = (
  ...args: any[]
) => Promise<{ response: any; meta?: HTTPResponseMeta }>;
type RouteController = <R extends IncomingMessage, RS extends ServerResponse>({
  req: R,
  res: RS,
  data: any,
}) => Promise<any>;

type Restartable = { start(): Promise<void>; stop(): Promise<void> };

type Query = Pool['query'];

declare global {
  interface Postgres {
    pool: Pool;
    query: Pool['query'];
    QueryParameters: Parameters<Query>;
  }

  interface NodeApi {
    util: typeof Util;
    url: typeof Url;
    timers: typeof Timers;
    stream: typeof Stream;
    process: typeof Process;
    perf_hooks: typeof perfHooks;
    os: typeof Os;
    net: typeof Net;
    fs: typeof Fs;
    events: typeof Events;
    crypto: typeof Crypto;
    console: typeof Console;
    child_process: typeof Childprocess;
    cluster: typeof Cluster;
    buffer: typeof Buffer;
    path: typeof Path;
    http: typeof Http;
  }

  interface Npm {
    dotenv: typeof dotenv;
    express: typeof express;
    'naughty-util': typeof utils;
    pg: typeof pg;
    jwt: typeof jwt;
    jsonschema: typeof jsonschema;
  }

  interface Independent {
    npm: Npm;
    node: NodeApi;
  }

  interface Config {
    storage: {
      pg: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        max: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
        maxUses: number;
      };
      use: string;
    };
    server: {
      http: {
        port: number;
        debug: boolean;
      };
    };
    node: [
      'util',
      'url',
      'timers',
      'stream',
      'process',
      'perf_hooks',
      'os',
      'net',
      'fs',
      'events',
      'crypto',
      'console',
      'child_process',
      'cluster',
      'buffer',
      'path',
      'http',
    ];
    session: {
      secret: {
        refresh: string;
        access: string;
      };
      duration: {
        refresh: string;
        access: string;
      };
    };
  }

  interface Utils {
    DomainError: typeof DomainError;
    NetworkError: typeof NetworkError;
    http: {
      CODES: {
        badRequest: number;
        notFound: number;
        unauthorized: number;
        forbidden: number;
        success: number;
        unsupportedMediaType: number;
      }
    }
  }

  interface LowDependent {
    config: Config;
    utils: Utils;
  }

  type ApplicationDependencies = LowDependent & Independent;

  interface ApplicationServices {
    logger: Console;
    security: {
      hash(password: string): Promise<string>;
      compare(password: string, hashed: string): Promise<boolean>;
    };
    session: {
      access(data: Payload): Promise<string>;
      refresh(data: Payload): Promise<string>;
      verify(token: string): Promise<boolean>;
      decode(token: string): Promise<SessionData>;
    };
    validator: {
      user: {
        credentials(credentials: Credentials): void;
      };
    };
  }

  type TransportDependencies = ApplicationDependencies & {
    app: ApplicationServices;
  };

  interface StorageApi extends Restartable {
    repository: {
      user: {
        create(data: Credentials, query: any): Promise<any>;
        getById(id: string, query: any)
      };
      session: {
        create(data: { id: string, tokens: Tokens }, query: any): Promise<any>;
      };
    };
    query: (...args: any) => Promise<any>;
    transaction: (...args: any) => Promise<any>;
  }

  interface HTTPRoute {
    path: string;
    method: HTTPMethods | Capitalize<HTTPMethods>;
    modules: DomainModule;
  }

  interface Transports {
    http(routing: HTTPRoute[]): Restartable;
  }

  type DomainServicesDependencies = {
    app: ApplicationServices;
    storage: StorageApi;
    utils: LowDependent['utils'];
  } & Independent;

  interface DomainServices {
    user: {
      create(data: Credentials): Promise<any>;
      get(id: string): Promise<User>;
    };
    validation: {
      user: {
        credentials(data: Credentials): void;
      };
      http: {
        bearer(headers: Record<string, string>): Promise<string>;
      }
    };
  }

  type DomainModule = [RouteController, ...AsyncCallback];
  type HTTPModules = Record<string, Record<string, DomainModule>>;

  interface DomainServicesModules {
    user: {
      create: DomainModule;
      get: DomainModule;
    };
  }
}

export { };
